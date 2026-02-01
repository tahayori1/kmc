
import React, { useState, useEffect, useCallback } from 'react';
import { UserInfo } from '../types';
import { cities } from '../constants';

interface UserProfileModalProps {
    currentUserInfo: UserInfo;
    onClose: () => void;
    onUpdate: (userInfo: UserInfo) => Promise<void>;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({ currentUserInfo, onClose, onUpdate }) => {
    const [name, setName] = useState(currentUserInfo.name);
    const [phone, setPhone] = useState(currentUserInfo.phone);
    const [city, setCity] = useState(currentUserInfo.city);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

    const isFormValid = name && phone && city;

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isFormValid) return;

        setIsSubmitting(true);
        setMessage(null);

        const newUserInfo: UserInfo = { ...currentUserInfo, name, phone, city };
        try {
            await onUpdate(newUserInfo);
            setMessage({ type: 'success', text: 'اطلاعات شما با موفقیت بروزرسانی شد.' });
            setTimeout(() => {
                onClose();
            }, 2000);
        } catch (err) {
            setMessage({ type: 'error', text: 'خطا در بروزرسانی اطلاعات. لطفا مجددا تلاش کنید.' });
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div 
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in"
            onClick={onClose}
        >
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-scale-in" onClick={(e) => e.stopPropagation()}>
                <div className="p-6 md:p-8">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-2xl font-bold text-kmc-dark-grey-500">پروفایل کاربری</h3>
                        <button onClick={onClose} className="p-2 hover:bg-kmc-light-grey rounded-full transition-colors">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
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
                             <input 
                                list="profile-city-options"
                                type="text" 
                                value={city} 
                                onChange={(e) => setCity(e.target.value)} 
                                required 
                                className="w-full px-4 py-3 border border-kmc-light-grey rounded-lg focus:outline-none focus:ring-2 focus:ring-kmc-blue-500 focus:border-transparent bg-white"
                                placeholder="نام شهر..."
                            />
                            <datalist id="profile-city-options">
                                {cities.map(c => <option key={c} value={c} />)}
                            </datalist>
                        </div>
                        
                        {message && (
                             <p className={`text-sm text-center p-3 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {message.text}
                            </p>
                        )}
                        
                        <div className="flex gap-4 pt-2">
                             <button type="button" onClick={onClose} disabled={isSubmitting} className="w-full bg-kmc-light-grey text-kmc-mid-grey py-3 rounded-lg font-medium disabled:opacity-50 transition-opacity">
                                انصراف
                            </button>
                            <button type="submit" disabled={!isFormValid || isSubmitting} className="w-full bg-gradient-to-r from-kmc-orange-500 to-kmc-orange-600 hover:from-kmc-orange-600 hover:to-kmc-orange-700 text-white py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-opacity">
                                {isSubmitting ? 'در حال بروزرسانی...' : 'بروزرسانی اطلاعات'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default UserProfileModal;
