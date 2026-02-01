import React from 'react';
import { trackEvent } from '../utils/tracking';

interface HeaderProps {
    inventoryCount: number;
    callNumber: string;
    onOpenProfile: () => void;
}

const Header: React.FC<HeaderProps> = ({ inventoryCount, callNumber, onOpenProfile }) => {
    const handleProfileClick = () => {
        trackEvent({ category: 'Header', action: 'Click Profile' });
        onOpenProfile();
    };

    return (
        <header className="bg-gradient-to-r from-kmc-dark-grey-500 to-kmc-dark-grey-700 text-white sticky top-0 z-50 shadow-lg">
            <div className="container mx-auto px-4 py-3 md:py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 md:gap-4">
                        <img 
                            src="https://hoseinikhodro.com/wp-content/uploads/sites/150/elementor/thumbs/%DA%A9%D8%AF-%DB%B2%DB%B6%DB%B0%DB%B6-%D8%AD%D8%B3%DB%8C%D9%86%DB%8C-r5bc3861hzh5a9zeiouunil55tzm5gavja54dv3ja4.png"
                            alt="نمایندگی ۲۶۰۶ کرمان موتور حسینی"
                            className="h-16 md:h-20 w-auto"
                            width="80"
                            height="80"
                        />
                        <div>
                            <h1 className="text-lg md:text-xl font-bold">نمایندگی ۲۶۰۶ کرمان موتور</h1>
                            <p className="text-xs md:text-sm opacity-90">حسینی خودرو شیراز - از ۱۳۶۱</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 md:gap-4">
                        <div className="hidden lg:flex items-center gap-4">
                            <div className="bg-gradient-to-r from-kmc-green-500 to-kmc-green-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                                <span id="totalInventory">{inventoryCount}</span> خودرو موجود
                            </div>
                             <button onClick={handleProfileClick} title="پروفایل کاربری" className="p-2 rounded-full hover:bg-white/10 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </button>
                        </div>
                         <button onClick={handleProfileClick} title="پروفایل کاربری" className="p-2 rounded-full hover:bg-white/10 transition-colors lg:hidden">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default React.memo(Header);