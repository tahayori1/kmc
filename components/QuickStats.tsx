
import React from 'react';

interface QuickStatsProps {
    carModelCount: number;
    inventoryCount: number;
}

const QuickStats: React.FC<QuickStatsProps> = ({ carModelCount, inventoryCount }) => {
    return (
        <section className="py-8 -mt-12 relative z-10">
            <div className="container mx-auto px-4">
                <div className="bg-white rounded-2xl shadow-xl p-4 md:p-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                        <div className="text-center">
                            <div className="text-xl md:text-3xl font-bold text-kmc-dark-grey-500 mb-2">۴۳</div>
                            <p className="text-xs md:text-sm text-kmc-mid-grey">سال سابقه</p>
                        </div>
                        <div className="text-center">
                            <div className="text-xl md:text-3xl font-bold text-kmc-dark-grey-500 mb-2">{carModelCount}</div>
                            <p className="text-xs md:text-sm text-kmc-mid-grey">مدل خودرو</p>
                        </div>
                        <div className="text-center">
                            <div className="text-xl md:text-3xl font-bold text-kmc-dark-grey-500 mb-2">{inventoryCount}</div>
                            <p className="text-xs md:text-sm text-kmc-mid-grey">شرایط فروش</p>
                        </div>
                        <div className="text-center">
                            <div className="text-xl md:text-3xl font-bold text-kmc-dark-grey-500 mb-2">۲۴/۷</div>
                            <p className="text-xs md:text-sm text-kmc-mid-grey">پشتیبانی</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default QuickStats;
