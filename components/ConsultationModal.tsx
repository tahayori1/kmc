
import React, { useState, useCallback, useEffect } from 'react';
import { CarCondition, UserInfo } from '../types';
import { cities } from '../constants';
import { trackEvent, trackLeadGeneration } from '../utils/tracking';

interface ConsultationModalProps {
    car?: CarCondition | null;
    userInfo: UserInfo | null;
    onClose: () => void;
    onUpdateAndConfirm: (userInfo: UserInfo) => Promise<void>;
}

const ConsultationModal: React.FC<ConsultationModalProps> = ({ car, userInfo, onClose, onUpdateAndConfirm }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState<string | null>(null);

    // Form state, pre-filled if userInfo exists
    const [name, setName] = useState(userInfo?.name || '');
    const [phone, setPhone] = useState(userInfo?.phone || '');
    const [city, setCity] = useState(userInfo?.city || '');
    const [formError, setFormError] = useState<string | null>(null);

    const isFormValid = name && phone && city;

    // Determine Form ID based on car name
    const formId = car ? car.خودرو.replace(/\s+/g, '-') : 'general-consultation-form';

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === 'Escape') {
            onClose();
        }
    }, [onClose]);

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.body.style.overflow = '';
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleKeyDown]);
    
    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isFormValid) return;

        setIsSubmitting(true);
        setFormError(null);
        setSubmitMessage(null);

        try {
            await onUpdateAndConfirm({ name, phone, city });
            
            trackEvent({ 
                category: 'Consultation Form', 
                action: 'Submit', 
                label: car ? car.خودرو : 'General' 
            });

            // Fire GTM Lead Generation Event
            const carModelName = car ? car.خودرو : 'Consult';
            trackLeadGeneration(carModelName);

            setSubmitMessage('درخواست شما با موفقیت ثبت شد. کارشناسان ما به زودی با شما تماس خواهند گرفت.');
            setTimeout(onClose, 3000);
        } catch (err) {
            setFormError('خطا در ارسال اطلاعات. لطفا مجددا تلاش کنید.');
            console.error(err);
            setIsSubmitting(false);
        }
    };
    
    return (
        <div 
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in"
            onClick={onClose}
        >
            <div 
                className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-scale-in overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6">
                    <div className="flex items-start justify-between mb-6">
                        <div>
                            <h3 className="text-2xl font-bold text-kmc-dark-grey-500">درخواست مشاوره</h3>
                            <p className="text-xs text-kmc-mid-grey mt-1">پاسخگویی در کمتر از ۱۵ دقیقه</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-kmc-light-grey rounded-full transition-colors">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                    </div>

                    {!submitMessage ? (
                        <>
                            {car ? (
                                <div className="bg-kmc-beige-100 p-4 rounded-lg mb-4 border-r-4 border-kmc-orange-500">
                                    <h4 className="font-medium text-kmc-black mb-1 text-sm">خودرو انتخابی:</h4>
                                    <p className="text-sm text-kmc-dark-grey-500 font-bold">{car.خودرو}</p>
                                    <p className="text-xs text-kmc-mid-grey">{`${car['نوع فروش']} ${car['روش پرداخت']} - مدل ${car.مدل}`}</p>
                                </div>
                            ) : (
                                <div className="bg-blue-50 p-4 rounded-lg mb-4 border-r-4 border-blue-500">
                                    <p className="text-sm text-blue-800 font-medium">مشاوره رایگان برای انتخاب بهترین گزینه</p>
                                    <p className="text-xs text-blue-600 mt-1">ما به شما کمک می‌کنیم بهترین خودرو را متناسب با بودجه خود پیدا کنید.</p>
                                </div>
                            )}

                            <form id={formId} onSubmit={handleFormSubmit} className="space-y-4">
                                <p className="text-kmc-mid-grey text-sm">
                                    {userInfo
                                        ? 'اطلاعات زیر برای هماهنگی استفاده خواهد شد. لطفا تایید کنید.'
                                        : 'برای دریافت مشاوره تخصصی، شماره خود را وارد کنید.'}
                                </p>
                                <div>
                                    <label className="block text-xs font-medium text-kmc-black mb-1">نام و نام خانوادگی</label>
                                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-3 py-2 border border-kmc-light-grey rounded-lg focus:outline-none focus:ring-2 focus:ring-kmc-blue-500 focus:border-transparent" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-kmc-black mb-1">شماره تماس</label>
                                    <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required className="w-full px-3 py-2 border border-kmc-light-grey rounded-lg focus:outline-none focus:ring-2 focus:ring-kmc-blue-500 focus:border-transparent" placeholder="09123456789" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-kmc-black mb-1">شهر</label>
                                    <select value={city} onChange={(e) => setCity(e.target.value)} required className="w-full px-3 py-2 border border-kmc-light-grey rounded-lg focus:outline-none focus:ring-2 focus:ring-kmc-blue-500 focus:border-transparent bg-white">
                                        <option value="" disabled>انتخاب کنید...</option>
                                        {cities.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                {formError && <p className="text-red-500 text-sm text-center">{formError}</p>}
                                <button type="submit" disabled={!isFormValid || isSubmitting} className="w-full bg-gradient-to-r from-urgent to-red-700 hover:from-red-700 hover:to-red-800 text-white py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-opacity shadow-lg">
                                    {isSubmitting ? 'در حال ارسال...' : 'ثبت درخواست مشاوره رایگان'}
                                </button>
                                <p className="text-center text-[10px] text-kmc-mid-grey mt-2">
                                    <span className="inline-block w-2 h-2 bg-green-500 rounded-full ml-1"></span>
                                    اطلاعات شما نزد ما محفوظ است و فقط برای مشاوره استفاده می‌شود.
                                </p>
                            </form>
                        </>
                    ) : (
                        <div 
                            id="success-form-submit"
                            className={`text-center p-6 rounded-lg flex flex-col items-center justify-center min-h-[200px] ${submitMessage.includes('موفقیت') ? 'bg-green-50' : 'bg-red-50'}`}
                        >
                            {submitMessage.includes('موفقیت') && (
                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3 text-green-600">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                </div>
                            )}
                            <p className={submitMessage.includes('موفقیت') ? 'text-green-800 font-medium' : 'text-red-800'}>{submitMessage}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ConsultationModal;
