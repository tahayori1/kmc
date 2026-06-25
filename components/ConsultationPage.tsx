import React, { useState, useEffect, useMemo } from 'react';
import { cities } from '../constants';
import { trackEvent, trackLeadGeneration } from '../utils/tracking';
import { submitConsultationRequest } from '../utils/api';
import { formatPhoneNumber } from '../utils/helpers';

interface ConsultationPageProps {
    availableCarModels: string[];
    onBackToHome: () => void;
    callNumber?: string;
}

const ConsultationPage: React.FC<ConsultationPageProps> = ({ 
    availableCarModels = [], 
    onBackToHome,
    callNumber = '07191690906'
}) => {
    // Form states
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [city, setCity] = useState('');
    const [selectedCar, setSelectedCar] = useState('مشاوره عمومی');
    const [source, setSource] = useState('');
    const [campaign, setCampaign] = useState('');
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState<boolean | null>(null);
    const [submitMessage, setSubmitMessage] = useState<string | null>(null);
    const [formError, setFormError] = useState<string | null>(null);

    // Live working hours states
    const [isWorkingHours, setIsWorkingHours] = useState(true);
    const [simulateOutsideHours, setSimulateOutsideHours] = useState(false);



    // Live business hours check (Tehran offset is UTC + 3.5)
    useEffect(() => {
        const checkWorkingHours = () => {
            const now = new Date();
            const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
            const tehranTime = new Date(utc + (3600000 * 3.5));
            
            const day = tehranTime.getDay(); // 0: Sun, 1: Mon, 2: Tue, 3: Wed, 4: Thu, 5: Fri, 6: Sat
            const hours = tehranTime.getHours();
            const minutes = tehranTime.getMinutes();
            const decimalTime = hours + (minutes / 60);

            // Saturday (6) to Wednesday (3) are working days in Iran
            const isWorkingDay = (day === 6 || day === 0 || day === 1 || day === 2 || day === 3);
            // Working hours: 8:30 (8.5) to 19:00 (19.0)
            const isWorkingHour = decimalTime >= 8.5 && decimalTime < 19;

            setIsWorkingHours(isWorkingDay && isWorkingHour);
        };

        checkWorkingHours();
        const interval = setInterval(checkWorkingHours, 30000); // Check every 30 seconds
        return () => clearInterval(interval);
    }, []);

    const showAsOutsideHours = !isWorkingHours || simulateOutsideHours;

    // Get list of standard models for selection
    const carList = useMemo(() => {
        const standardCars = ['KMC J7', 'KMC T8', 'KMC X5', 'KMC A5', 'BAC X3 Pro', 'جک J4', 'جک S5'];
        // Merge with available models from API, filtering duplicates
        const merged = Array.from(new Set([...standardCars, ...availableCarModels])).filter(Boolean);
        return merged;
    }, [availableCarModels]);

    // Parse URL queries on mount to pre-fill parameters
    useEffect(() => {
        const parseUrlParams = () => {
            const hash = window.location.hash;
            let carParam = '';
            let sourceParam = '';
            let campaignParam = '';

            // 1. Try parsing from hash query parameters (e.g., #/consultation?car=J7&source=instagram)
            const queryIndex = hash.indexOf('?');
            if (queryIndex !== -1) {
                const queryString = hash.substring(queryIndex + 1);
                const params = new URLSearchParams(queryString);
                carParam = params.get('car') || '';
                sourceParam = params.get('source') || '';
                campaignParam = params.get('campaign') || '';
            }

            // 2. Fallback to standard location search query parameters (e.g., ?car=J7#/consultation)
            if (!carParam || !sourceParam) {
                const searchParams = new URLSearchParams(window.location.search);
                carParam = carParam || searchParams.get('car') || '';
                sourceParam = sourceParam || searchParams.get('source') || '';
                campaignParam = campaignParam || searchParams.get('campaign') || '';
            }

            // Decodes parameters if they are URI-encoded
            if (carParam) {
                const decodedCar = decodeURIComponent(carParam).trim();
                // Find closest match in carList
                const matchedCar = carList.find(c => 
                    c.toLowerCase().includes(decodedCar.toLowerCase()) || 
                    decodedCar.toLowerCase().includes(c.toLowerCase())
                );
                setSelectedCar(matchedCar || decodedCar);
            }
            if (sourceParam) setSource(decodeURIComponent(sourceParam));
            if (campaignParam) setCampaign(decodeURIComponent(campaignParam));
        };

        parseUrlParams();
        
        // Push view event
        trackEvent({ category: 'Consultation Landing', action: 'View' });
    }, [carList]);

    // Form submission
    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!name.trim()) {
            setFormError('لطفاً نام خود را وارد کنید.');
            return;
        }
        if (!phone.trim() || phone.length < 11 || !phone.startsWith('09')) {
            setFormError('لطفاً شماره موبایل معتبر (مثل ۰۹۱۲۳۴۵۶۷۸۹) وارد کنید.');
            return;
        }
        if (!city.trim()) {
            setFormError('لطفاً شهر محل سکونت خود را مشخص کنید.');
            return;
        }

        setIsSubmitting(true);
        setFormError(null);
        setSubmitSuccess(null);

        try {
            // Track event prior to network request
            trackEvent({ 
                category: 'Consultation Landing', 
                action: 'Submit Form', 
                label: `Car: ${selectedCar} | Source: ${source || 'direct'}` 
            });

            // Prepare payload
            const trackingDesc = [
                `درخواست مشاوره اختصاصی از صفحه فرود کمپین`,
                source ? `منبع تبلیغات: ${source}` : null,
                campaign ? `نام کمپین: ${campaign}` : null,
            ].filter(Boolean).join(' | ');

            const fakeConditionObj = {
                id: Date.now(),
                "وضعیت": "موجود",
                "خودرو": selectedCar,
                "مدل": 1405,
                "نوع فروش": "نامشخص",
                "روش پرداخت": "کمپین تبلیغاتی",
                "رنگ خودرو": "نامشخص",
                "سند": "مشاوره اختصاصی",
                "تحویل": "نامشخص",
                "پرداخت اولیه": 0,
                "توضیحات": trackingDesc,
                "slug": "landing-consult"
            };

            await submitConsultationRequest({
                userInfo: { name, phone, city, carOfInterest: selectedCar },
                condition: fakeConditionObj
            });

            // Fire GTM Lead Generation Event
            trackLeadGeneration(selectedCar || 'Landing-Consult');

            setSubmitSuccess(true);
            setSubmitMessage('درخواست شما با موفقیت ثبت شد! کارشناسان نمایندگی ۲۶۰۶ حسینی در کمتر از ۱۵ دقیقه با شما تماس خواهند گرفت.');
            
            // Clear form
            setName('');
            setPhone('');
        } catch (err) {
            console.error(err);
            setSubmitSuccess(false);
            setFormError('متأسفانه خطایی در ارسال اطلاعات رخ داد. لطفاً مجدداً تلاش کنید یا مستقیماً تماس بگیرید.');
        } finally {
            setIsSubmitting(false);
        }
    };



    return (
        <div className="min-h-screen bg-kmc-beige-100 flex flex-col font-sans" dir="rtl">
            {/* Elegant Header for Landing Page */}
            <header className="bg-gradient-to-r from-kmc-dark-grey-500 to-kmc-dark-grey-700 text-white shadow-md">
                <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img 
                            src="https://hoseinikhodro.com/wp-content/uploads/sites/150/elementor/thumbs/%DA%A9%D8%AF-%DB%B2%DB%B6%DB%B0%DB%B6-%D8%AD%D8%B3%DB%8C%D9%86%DB%8C-r5bc3861hzh5a9zeiouunil55tzm5gavja54dv3ja4.png"
                            alt="کرمان موتور ۲۶۰۶ حسینی"
                            className="h-12 md:h-16 w-auto"
                        />
                        <div>
                            <h1 className="text-sm md:text-lg font-bold">نمایندگی ۲۶۰۶ کرمان موتور</h1>
                            <p className="text-[10px] md:text-xs opacity-80">حسینی خودرو شیراز - مشاوره رسمی و سراسری</p>
                        </div>
                    </div>
                    <button 
                        onClick={onBackToHome}
                        className="text-xs md:text-sm bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg border border-white/20 transition-all flex items-center gap-1"
                    >
                        <span>ورود به سایت اصلی</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                </div>
            </header>

            {/* Main Content Container */}
            <main className="flex-grow flex flex-col justify-center py-6 md:py-12 px-4">
                <div className="max-w-5xl mx-auto w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-kmc-beige-200">
                    <div className="grid grid-cols-1 lg:grid-cols-12">
                        
                        {/* Right / Top Side: Dynamic Landing Visual & Branding Info */}
                        {/* On mobile, this moves to order-2 (below the form) to keep the focus entirely on the quick lead capture */}
                        <div className="lg:col-span-5 bg-gradient-to-br from-kmc-dark-grey-600 to-kmc-dark-grey-500 text-white p-6 md:p-10 flex flex-col justify-between order-2 lg:order-1">
                            <div>
                                <span className="bg-kmc-orange-500 text-white text-[10px] md:text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                    جشنواره فروش و ثبت‌نام کرمان موتور
                                </span>
                                <h2 className="text-xl md:text-3xl font-extrabold mt-4 leading-tight">
                                    دریافت مشاوره رایگان ثبت‌نام و خرید خودرو
                                </h2>
                                <p className="text-xs md:text-sm text-kmc-light-grey mt-3 leading-relaxed">
                                    جهت دریافت لیست قیمت روز، شرایط فروش نقد و اقساطی نمایندگی و برآورد پیش‌پرداخت بر اساس بودجه خود، اطلاعات تماس خود را در فرم مقابل ثبت نمایید.
                                </p>

                                <div className="mt-6 md:mt-8 space-y-3 md:space-y-4">
                                    <div className="flex items-start gap-3">
                                        <div className="w-5 h-5 rounded-full bg-kmc-orange-500/20 text-kmc-orange-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-xs md:text-sm">پاسخگویی سریع کمتر از ۱۵ دقیقه</h4>
                                            <p className="text-[10px] md:text-xs text-kmc-light-grey mt-0.5">کارشناسان ما بلافاصله پس از ثبت درخواست با شما تماس خواهند گرفت.</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <div className="w-5 h-5 rounded-full bg-kmc-orange-500/20 text-kmc-orange-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-xs md:text-sm">بررسی اختصاصی توان پرداخت شما</h4>
                                            <p className="text-[10px] md:text-xs text-kmc-light-grey mt-0.5">محاسبه مبالغ چک‌ها و اقساط ماهانه بر اساس شرایط دلخواه مالی شما.</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <div className="w-5 h-5 rounded-full bg-kmc-orange-500/20 text-kmc-orange-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-xs md:text-sm">ارتباط مستقیم با معتبرترین نمایندگی</h4>
                                            <p className="text-[10px] md:text-xs text-kmc-light-grey mt-0.5">نمایندگی ۲۶۰۶ حسینی با بیش از ۴ دهه سابقه درخشان در صنعت خودرو کشور.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Dynamic Call CTA: Hides raw calling links and guides the user to fill out the form when outside business hours */}
                            {showAsOutsideHours ? (
                                <div className="mt-6 md:mt-8 pt-4 md:pt-6 border-t border-white/10 space-y-3">
                                    <div className="bg-white/5 p-3.5 rounded-xl border border-white/10">
                                        <div className="flex items-center gap-1.5 mb-1 text-kmc-orange-400">
                                            <span className="text-sm">🌙</span>
                                            <h4 className="font-bold text-xs">سیستم رزرو اولویت ۲۴ ساعته فعال است</h4>
                                        </div>
                                        <p className="text-[10px] text-kmc-light-grey leading-relaxed">
                                            در حال حاضر خارج از ساعات کاری نمایندگی هستیم. اما با تکمیل فرم مقابل، اطلاعات شما فوراً ثبت شده و در ساعت ۸:۳۰ صبح فردا، در اولین اولویت تماس با کارشناسان قرار می‌گیرید.
                                        </p>
                                    </div>
                                    <button 
                                        onClick={() => {
                                            const nameInput = document.getElementById('landing-full-name');
                                            if (nameInput) {
                                                nameInput.focus();
                                                nameInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                            }
                                        }}
                                        className="w-full text-center bg-kmc-orange-500 hover:bg-kmc-orange-600 text-white py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all shadow-md flex items-center justify-center gap-1.5 animate-pulse"
                                        id="scroll-to-form-btn"
                                    >
                                        <span>تکمیل فوری فرم مشاوره</span>
                                        <svg className="w-4 h-4 transform rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>
                                </div>
                            ) : (
                                <div className="mt-6 md:mt-8 pt-4 md:pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
                                    <div className="text-right w-full sm:w-auto">
                                        <p className="text-[10px] text-kmc-light-grey">یا هم‌اکنون با کارشناس تماس بگیرید:</p>
                                        <a 
                                            href={`tel:${callNumber}`} 
                                            className="text-base md:text-lg font-extrabold text-kmc-orange-400 hover:text-kmc-orange-300 transition-colors inline-block mt-0.5"
                                            style={{ direction: 'ltr' }}
                                        >
                                            {formatPhoneNumber(callNumber)}
                                        </a>
                                    </div>
                                    <a 
                                        href={`tel:${callNumber}`}
                                        className="w-full sm:w-auto text-center bg-kmc-green-500 hover:bg-kmc-green-600 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md"
                                    >
                                        تماس فوری تلفنی
                                    </a>
                                </div>
                            )}
                        </div>

                        {/* Left / Bottom Side: Consultation Lead Capture Form */}
                        {/* On mobile, this has order-1 to render on top, allowing immediate high-converting touch fill-out */}
                        <div className="lg:col-span-7 p-5 md:p-10 flex flex-col justify-center order-1 lg:order-2" id="consultation-form-section">
                            {submitSuccess ? (
                                <div className="text-center py-10 px-4 bg-green-50 rounded-2xl border border-green-200">
                                    <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 text-green-600">
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg md:text-xl font-bold text-green-800 mb-1.5">ثبت با موفقیت انجام شد!</h3>
                                    <p className="text-xs md:text-sm text-green-700 leading-relaxed max-w-md mx-auto">
                                        {submitMessage}
                                    </p>
                                    <div className="mt-6 flex justify-center gap-3">
                                        <button 
                                            onClick={() => setSubmitSuccess(null)}
                                            className="text-xs bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors font-semibold"
                                        >
                                            ثبت درخواست جدید
                                        </button>
                                        <button 
                                            onClick={onBackToHome}
                                            className="text-xs bg-kmc-dark-grey-500 hover:bg-kmc-dark-grey-600 text-white px-4 py-2 rounded-lg transition-colors font-semibold"
                                        >
                                            بازگشت به سایت
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <form onSubmit={handleFormSubmit} className="space-y-4">
                                    <div>
                                        <h3 className="text-lg md:text-2xl font-bold text-kmc-dark-grey-500 mb-1">فرم درخواست مشاوره فوری</h3>
                                        <p className="text-xs text-kmc-mid-grey">برای بررسی شرایط فروش ویژه نقد و اقساط، لطفاً فیلدهای زیر را کامل کنید.</p>
                                    </div>

                                    {/* Elegant off-hours warning alert on top of the form for massive conversions when staff is asleep */}
                                    {showAsOutsideHours && (
                                        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-orange-200 p-3 md:p-4 rounded-xl flex items-start gap-2.5 shadow-sm animate-fade-in" id="outside-hours-banner">
                                            <span className="text-lg md:text-xl mt-0.5">🌙</span>
                                            <div>
                                                <h4 className="font-extrabold text-[11px] md:text-xs text-orange-800">کمپین ویژه ثبت‌نام خارج از ساعات کاری</h4>
                                                <p className="text-[10px] md:text-xs text-orange-700 mt-1 leading-relaxed">
                                                    در حال حاضر خارج از ساعات کاری هستیم. با ثبت فرم زیر، اولویت تماس اول فردا ساعت ۸:۳۰ صبح را رزرو کنید.
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {source && (
                                        <div className="bg-kmc-beige-100 px-3 py-1.5 rounded-lg text-[10px] text-kmc-dark-grey-400 flex items-center gap-1.5 border border-kmc-beige-300 w-fit">
                                            <span className="w-1.5 h-1.5 bg-kmc-orange-500 rounded-full animate-ping"></span>
                                            <span>ثبت از تبلیغات: <b>{source}</b></span>
                                            {campaign && <span>| کمپین: <b>{campaign}</b></span>}
                                        </div>
                                    )}

                                    <div className="space-y-3.5">
                                        <div>
                                            <label htmlFor="landing-full-name" className="block text-xs font-bold text-kmc-dark-grey-500 mb-1">نام و نام خانوادگی <span className="text-red-500">*</span></label>
                                            <input 
                                                id="landing-full-name"
                                                type="text" 
                                                value={name} 
                                                onChange={(e) => setName(e.target.value)} 
                                                placeholder="مثال: علی محمدی" 
                                                required 
                                                className="w-full px-4 py-2.5 border border-kmc-light-grey rounded-xl focus:outline-none focus:ring-2 focus:ring-kmc-orange-500 focus:border-transparent transition-all bg-kmc-beige-100/50 text-sm md:text-base h-11" 
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div>
                                                <label htmlFor="landing-phone-number" className="block text-xs font-bold text-kmc-dark-grey-500 mb-1">شماره تلفن همراه <span className="text-red-500">*</span></label>
                                                <input 
                                                    id="landing-phone-number"
                                                    type="tel" 
                                                    value={phone} 
                                                    onChange={(e) => setPhone(e.target.value)} 
                                                    placeholder="مثال: 09171234567" 
                                                    required 
                                                    className="w-full px-4 py-2.5 border border-kmc-light-grey rounded-xl focus:outline-none focus:ring-2 focus:ring-kmc-orange-500 focus:border-transparent transition-all bg-kmc-beige-100/50 text-sm md:text-base h-11" 
                                                    style={{ direction: 'ltr' }}
                                                />
                                            </div>

                                            <div>
                                                <label htmlFor="landing-city-select" className="block text-xs font-bold text-kmc-dark-grey-500 mb-1">شهر محل سکونت <span className="text-red-500">*</span></label>
                                                <input 
                                                    id="landing-city-select"
                                                    list="landing-city-options" 
                                                    type="text" 
                                                    value={city} 
                                                    onChange={(e) => setCity(e.target.value)} 
                                                    placeholder="مثال: شیراز" 
                                                    required 
                                                    className="w-full px-4 py-2.5 border border-kmc-light-grey rounded-xl focus:outline-none focus:ring-2 focus:ring-kmc-orange-500 focus:border-transparent transition-all bg-kmc-beige-100/50 text-sm md:text-base h-11" 
                                                />
                                                <datalist id="landing-city-options">
                                                    {cities.map(c => <option key={c} value={c} />)}
                                                </datalist>
                                            </div>
                                        </div>

                                        <div>
                                            <label htmlFor="landing-car-select" className="block text-xs font-bold text-kmc-dark-grey-500 mb-1">خودروی مورد علاقه جهت مشاوره <span className="text-red-500">*</span></label>
                                            <select 
                                                id="landing-car-select"
                                                value={selectedCar} 
                                                onChange={(e) => setSelectedCar(e.target.value)} 
                                                className="w-full px-4 py-2.5 border border-kmc-light-grey rounded-xl focus:outline-none focus:ring-2 focus:ring-kmc-orange-500 focus:border-transparent transition-all bg-kmc-beige-100/50 text-xs md:text-sm h-11"
                                            >
                                                <option value="مشاوره عمومی">مشاوره عمومی و راهنمایی انتخاب خودرو</option>
                                                {carList.map(car => (
                                                    <option key={car} value={car}>{car}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {formError && (
                                        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 text-center font-semibold animate-shake">
                                            {formError}
                                        </div>
                                    )}

                                    <button 
                                        id="landing-submit-btn"
                                        type="submit" 
                                        disabled={isSubmitting} 
                                        className="w-full bg-gradient-to-r from-kmc-orange-500 to-kmc-orange-600 hover:from-kmc-orange-600 hover:to-kmc-orange-700 text-white py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none text-center text-sm"
                                    >
                                        {isSubmitting ? 'در حال ارسال اطلاعات...' : (showAsOutsideHours ? 'ثبت اولویت تماس و رزرو مشاوره' : 'ثبت رایگان درخواست و دریافت تماس')}
                                    </button>

                                    <p className="text-center text-[10px] text-kmc-mid-grey">
                                        🔒 اطلاعات شما مستقیماً به سیستم مدیریت لیدهای نمایندگی ارسال شده و به صورت کاملاً محرمانه ذخیره می‌گردد.
                                    </p>
                                </form>
                            )}
                        </div>
                    </div>
                </div>


            </main>

            {/* Footer matching standard landing look */}
            <footer className="bg-kmc-dark-grey-700 text-kmc-light-grey text-center py-6 text-xs border-t border-kmc-dark-grey-600">
                <p>© ۱۴۰۴ نمایندگی رسمی کرمان موتور ۲۶۰۶ حسینی. طراحی شده برای کمپین‌های تبلیغاتی هوشمند.</p>
            </footer>
        </div>
    );
};

export default React.memo(ConsultationPage);
