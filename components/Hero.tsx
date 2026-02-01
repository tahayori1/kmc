import React from 'react';
import { trackEvent } from '../utils/tracking';

interface HeroProps {
    onConsult?: () => void;
}

const Hero: React.FC<HeroProps> = ({ onConsult }) => {
    const handleScrollToCars = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        trackEvent({ category: 'Hero', action: 'Click', label: 'View Sale Conditions' });
        const carsElement = document.getElementById('cars');
        if (carsElement) {
            carsElement.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const handleConsultClick = () => {
        trackEvent({ category: 'Hero', action: 'Click', label: 'Free Consultation' });
        if (onConsult) onConsult();
    };

    return (
        <section 
            className="relative py-16 md:py-32 overflow-hidden bg-kmc-dark-grey-900"
            aria-label="Kerman Motor cars collage"
        >
            {/* LCP Optimization: Use <img> tag with fetchpriority="high" instead of CSS background-image */}
            <img 
                src="https://x264.storage.iran.liara.space/conditions/img/kmc-bg-min.jpg" 
                alt="Background of Kerman Motor cars"
                className="absolute inset-0 w-full h-full object-cover z-0"
                width="1920"
                height="1080"
                fetchPriority="high"
                decoding="async"
            />
            
            <div className="absolute inset-0 bg-kmc-dark-grey-900/70 z-0" aria-hidden="true"></div>
            
            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center animate-fade-in">
                    <h2 className="text-2xl md:text-5xl font-bold mb-6 leading-tight text-white">
                        خرید خودرو با
                        <span className="text-kmc-orange-400"> اطمینان کامل</span>
                    </h2>
                    <p className="text-base md:text-xl mb-8 opacity-90 max-w-3xl mx-auto text-white">
                        ۴۳ سال سابقه • تحویل فوری • شرایط نقد و اقساط
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <a href="#cars" onClick={handleScrollToCars} className="bg-gradient-to-r from-urgent to-red-700 hover:from-red-700 hover:to-red-800 text-white px-8 md:px-10 py-3 md:py-4 rounded-xl font-semibold text-base md:text-lg inline-flex items-center justify-center gap-3 hover:shadow-xl transition-all animate-pulse">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                            </svg>
                            مشاهده شرایط فروش
                        </a>
                         <button 
                            onClick={handleConsultClick}
                            className="bg-white/10 backdrop-blur-sm hover:bg-white/20 border border-white/30 text-white px-8 md:px-10 py-3 md:py-4 rounded-xl font-semibold text-base md:text-lg inline-flex items-center justify-center gap-3 hover:shadow-xl transition-all"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                            </svg>
                            مشاوره تخصصی رایگان
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default React.memo(Hero);