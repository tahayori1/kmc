import React, { useState } from 'react';
import type { UserInfo } from '../types';
import { cities } from '../constants';

interface UserInfoModalProps {
    onSubmit: (userInfo: UserInfo) => Promise<void>;
    onClose?: () => void;
    title?: string;
    description?: string;
    submitText?: string;
}

const UserInfoModal: React.FC<UserInfoModalProps> = ({ 
    onSubmit, 
    onClose,
    title = "مشاهده شرایط فروش",
    description = "برای مشاهده لیست خودروها و شرایط فروش، لطفا اطلاعات خود را وارد کنید.",
    submitText = "مشاهده خودروها"
}) => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [city, setCity] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isFormValid = name && phone && city;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isFormValid) return;

        setIsSubmitting(true);
        setError(null);

        const userInfo = { name, phone, city };
        try {
            await onSubmit(userInfo);
            // On success, the parent component will handle closing the modal.
        } catch (err) {
            setError('خطا در ارسال اطلاعات. لطفا مجددا تلاش کنید.');
            console.error(err);
            setIsSubmitting(false);
        }
    };

    return (
        <div 
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in"
            onClick={onClose}
        >
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-scale-in" onClick={(e) => e.stopPropagation()}>
                <div className="p-6 md:p-8 relative">
                     {onClose && (
                         <button onClick={onClose} className="absolute top-4 left-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-kmc-light-grey rounded-full transition-colors">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                    )}
                    <div className="text-center mb-6">
                         <img src="https://hoseinikhodro.com/wp-content/uploads/sites/150/elementor/thumbs/%DA%A9%D8%AF-%DB%B2%DB%B6%DB%B0%DB%B6-%D8%AD%D8%B3%DB%8C%D9%86%DB%8C-r5bc3861hzh5a9zeiouunil55tzm5gavja54dv3ja4.png"
                            alt="نمایندگی ۲۶۰۶ کرمان موتور حسینی"
                            className="h-16 w-auto mx-auto mb-4" />
                        <h3 className="text-2xl font-bold text-kmc-dark-grey-500">{title}</h3>
                        <p className="text-kmc-mid-grey mt-2">{description}</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-kmc-black mb-2">نام و نام خانوادگی</label>
                            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-4 py-3 border border-kmc-light-grey rounded-lg focus:outline-none focus:ring-2 focus:ring-kmc-blue-500 focus:border-transparent" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-kmc-black mb-2">شماره تماس</label>
                            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required className="w-full px-4 py-3 border border-kmc-light-grey rounded-lg focus:outline-none focus:ring-2 focus:ring-kmc-blue-500 focus:border-transparent" placeholder="09123456789" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-kmc-black mb-2">شهر</label>
                            <select value={city} onChange={(e) => setCity(e.target.value)} required className="w-full px-4 py-3 border border-kmc-light-grey rounded-lg focus:outline-none focus:ring-2 focus:ring-kmc-blue-500 focus:border-transparent bg-white">
                                <option value="" disabled>انتخاب کنید...</option>
                                {cities.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                        <button type="submit" disabled={!isFormValid || isSubmitting} className="w-full bg-gradient-to-r from-kmc-orange-500 to-kmc-orange-600 hover:from-kmc-orange-600 hover:to-kmc-orange-700 text-white py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-opacity">
                            {isSubmitting ? 'در حال ارسال...' : submitText}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default React.memo(UserInfoModal);