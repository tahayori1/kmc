
import React from 'react';
import { CarCondition } from '../types';
import { formatPrice } from '../utils/helpers';

interface RecentlyViewedProps {
    conditions: CarCondition[];
    onSelectCondition: (condition: CarCondition) => void;
}

const RecentlyViewedCard: React.FC<{condition: CarCondition, onClick: () => void}> = ({ condition, onClick }) => (
    <div 
        onClick={onClick}
        className="bg-white rounded-lg shadow p-3 flex items-center gap-3 cursor-pointer hover:shadow-lg transition-shadow"
    >
        <img 
            src={`https://hoseinikhodro.com/conditions/img/${encodeURIComponent(condition.خودرو)}.png`}
            alt={condition.خودرو}
            className="w-20 h-20 object-cover rounded-md flex-shrink-0"
            loading="lazy"
            width="80"
            height="80"
        />
        <div className="overflow-hidden">
            <h4 className="font-bold text-sm truncate text-kmc-dark-grey-500">{condition.خودرو}</h4>
            <p className="text-xs text-kmc-mid-grey truncate">{`${condition['نوع فروش']} ${condition['روش پرداخت']}`}</p>
            <p className="text-xs font-semibold text-kmc-green-600 mt-1">{formatPrice(condition['پرداخت اولیه'])}</p>
        </div>
    </div>
);

const RecentlyViewed: React.FC<RecentlyViewedProps> = ({ conditions, onSelectCondition }) => {
    return (
        <section className="py-16 bg-kmc-beige-200">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-2xl md:text-4xl font-bold mb-4 text-kmc-dark-grey-500">بازدیدهای اخیر شما</h2>
                    <p className="text-base md:text-lg text-kmc-mid-grey">شرایطی که اخیراً مشاهده کرده‌اید</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    {conditions.map(condition => (
                        <RecentlyViewedCard 
                            key={condition.id} 
                            condition={condition} 
                            onClick={() => onSelectCondition(condition)} 
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default React.memo(RecentlyViewed);
