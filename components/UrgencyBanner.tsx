
import React from 'react';

const UrgencyBanner: React.FC = () => {
    return (
        <div className="bg-gradient-to-r from-red-500 via-red-600 to-red-700 animate-pulse text-white py-2 px-4 text-center font-bold text-sm md:text-base">
            🔥 فرصت محدود: خودروهای صفر کیلومتر موجود! تنها تا پایان هفته! 🔥
        </div>
    );
};

export default UrgencyBanner;
