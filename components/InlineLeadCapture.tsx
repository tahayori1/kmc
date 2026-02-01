
import React from 'react';
import { trackEvent } from '../utils/tracking';

interface Props {
    onConsult: () => void;
}

const InlineLeadCapture: React.FC<Props> = ({ onConsult }) => {
    const handleClick = () => {
        trackEvent({ category: 'Inline Lead Capture', action: 'Click', label: 'Free Consultation' });
        onConsult();
    };

    return (
        <div className="bg-kmc-dark-grey-800 text-white rounded-xl shadow-lg p-6 relative overflow-hidden flex flex-col justify-center items-center text-center h-full min-h-[300px] animate-fade-in">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-12 -mt-12"></div>
            <div className="absolute bottom-0 left-0 w-20 h-20 bg-kmc-orange-500/20 rounded-full -ml-10 -mb-10"></div>
            
            <div className="relative z-10">
                <div className="w-16 h-16 bg-kmc-orange-500/20 text-kmc-orange-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
                <h3 className="text-xl font-bold mb-2">هنوز تصمیم نگرفته‌اید؟</h3>
                <p className="text-gray-300 text-sm mb-6 leading-relaxed">
                    کارشناسان ما آماده‌اند تا بر اساس بودجه شما، بهترین گزینه را پیشنهاد دهند.
                </p>
                <button 
                    onClick={handleClick}
                    className="bg-white text-kmc-dark-grey-900 hover:bg-gray-100 font-bold py-3 px-6 rounded-lg w-full transition-colors flex items-center justify-center gap-2"
                >
                    <span>درخواست مشاوره رایگان</span>
                    <svg className="w-4 h-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                </button>
            </div>
        </div>
    );
};

export default InlineLeadCapture;
