
import React, { useEffect, useCallback, useState } from 'react';
import { CarCondition } from '../types';
import { trackEvent } from '../utils/tracking';

interface CarModalProps {
    car: CarCondition;
    onClose: () => void;
    onOpenConsultation: () => void;
    formatPrice: (price: number | string) => string;
}

const CarModal: React.FC<CarModalProps> = ({ car, onClose, onOpenConsultation, formatPrice }) => {
    const [shareFeedback, setShareFeedback] = useState('');
    
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

    const handleShare = async () => {
        trackEvent({ category: 'Car Modal', action: 'Click Share', label: car.خودرو });
        const shareUrl = `${window.location.origin}${window.location.pathname}#/car/${car.slug}`;
        const shareTitle = `شرایط فروش ${car.خودرو} مدل ${car.مدل}`;
        const shareText = `این شرایط فروش برای ${car.خودرو} رو ببین!`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: shareTitle,
                    text: shareText,
                    url: shareUrl,
                });
            } catch (error) {
                console.error('Error sharing:', error);
            }
        } else {
            try {
                await navigator.clipboard.writeText(shareUrl);
                setShareFeedback('لینک کپی شد!');
                setTimeout(() => setShareFeedback(''), 2000);
            } catch (error) {
                console.error('Error copying to clipboard:', error);
                setShareFeedback('خطا در کپی لینک');
                 setTimeout(() => setShareFeedback(''), 2000);
            }
        }
    };

    const handleOpenConsultation = () => {
        trackEvent({ category: 'Car Modal', action: 'Click Urgent Consultation', label: car.خودرو });
        onOpenConsultation();
    };

    return (
        <div 
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="car-modal-title"
        >
            <div 
                className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Modal Header */}
                <div className="sticky top-0 bg-white border-b border-kmc-light-grey p-6 rounded-t-2xl z-10">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                            <img src={`https://hoseinikhodro.com/conditions/img/${encodeURIComponent(car.خودرو)}.png`} alt={car.خودرو} className="w-16 h-16 object-cover rounded-lg" />
                            <div>
                                <h3 id="car-modal-title" className="text-2xl font-bold text-kmc-dark-grey-500">{car.خودرو}</h3>
                                <p className="text-kmc-mid-grey">{`${car['نوع فروش']} ${car['روش پرداخت']} مدل ${car.مدل}`}</p>
                            </div>
                        </div>
                        <button onClick={onClose} aria-label="بستن پنجره" className="p-2 hover:bg-kmc-light-grey rounded-full transition-colors">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                    </div>
                </div>

                {/* Modal Body */}
                <div className="p-6 space-y-6">
                    <div className="bg-gradient-to-r from-kmc-orange-50 to-kmc-orange-100 p-6 rounded-xl border border-kmc-orange-200">
                        <div className="flex items-center gap-3 mb-2">
                            <svg className="w-6 h-6 text-kmc-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path></svg>
                            <h4 className="text-lg font-bold text-kmc-orange-700">پیش پرداخت</h4>
                        </div>
                        <p className="text-2xl font-bold text-kmc-orange-800">{formatPrice(car['پرداخت اولیه'])}</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-x-6 gap-y-4">
                        <div className="flex justify-between py-3 border-b border-kmc-beige-200"><span className="text-kmc-mid-grey">مدل:</span><span className="font-medium text-kmc-dark-grey-500">{car.مدل}</span></div>
                        <div className="flex justify-between py-3 border-b border-kmc-beige-200"><span className="text-kmc-mid-grey">نوع فروش:</span><span className="font-medium text-kmc-dark-grey-500">{car['نوع فروش']}</span></div>
                        <div className="flex justify-between py-3 border-b border-kmc-beige-200"><span className="text-kmc-mid-grey">رنگ‌های موجود:</span><span className="font-medium text-right text-kmc-dark-grey-500">{car['رنگ خودرو']}</span></div>
                        <div className="flex justify-between py-3 border-b border-kmc-beige-200"><span className="text-kmc-mid-grey">روش پرداخت:</span><span className="font-medium text-kmc-dark-grey-500">{car['روش پرداخت']}</span></div>
                        <div className="flex justify-between py-3 border-b border-kmc-beige-200"><span className="text-kmc-mid-grey">وضعیت سند:</span><span className="font-medium text-kmc-dark-grey-500">{car.سند}</span></div>
                        <div className="flex justify-between py-3 border-b border-kmc-beige-200"><span className="text-kmc-mid-grey">زمان تحویل:</span><span className="font-medium text-kmc-dark-grey-500">{car.تحویل}</span></div>
                    </div>
                     
                    <div className="bg-kmc-beige-100 p-6 rounded-xl">
                        <h4 className="text-lg font-bold text-kmc-dark-grey-500 mb-4 flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                            شرایط و توضیحات کامل
                        </h4>
                        <div className="text-kmc-dark-grey leading-relaxed space-y-2">
                             {car.توضیحات ? car.توضیحات.split(' / ').map((item, index) => <p key={index} className="flex items-start"><span className="ml-2 text-kmc-orange-500">•</span>{item}</p>) : <p>جزئیات بیشتر هنگام تماس ارائه خواهد شد.</p>}
                        </div>
                    </div>
                     
                    <div className="bg-gradient-to-r from-kmc-blue-50 to-kmc-blue-100 p-6 rounded-xl border border-kmc-blue-200 flex flex-wrap items-center justify-between gap-4">
                       <div>
                         <h4 className="text-lg font-bold text-kmc-blue-500 mb-2">برای خرید فوری این خودرو درخواست مشاوره ثبت کنید</h4>
                         <button onClick={handleOpenConsultation} className="bg-gradient-to-r from-urgent to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 py-3 rounded-lg font-medium inline-flex items-center gap-2 transition-all animate-pulse">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                            درخواست مشاوره فوری
                        </button>
                       </div>
                       <div className="relative">
                            <button onClick={handleShare} className="bg-white/80 backdrop-blur-sm border border-kmc-blue-200 text-kmc-blue-500 px-4 py-2 rounded-lg font-medium inline-flex items-center gap-2 hover:bg-white transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.368a3 3 0 105.367 2.684 3 3 0 00-5.367 2.684z"></path></svg>
                                اشتراک‌گذاری
                            </button>
                            {shareFeedback && <span className="absolute -bottom-6 right-0 text-xs bg-kmc-dark-grey-900 text-white px-2 py-1 rounded">{shareFeedback}</span>}
                       </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default React.memo(CarModal);
