
import React from 'react';
import type { CarCondition } from '../types';
import { trackEvent } from '../utils/tracking';

interface CarCardProps {
    car: CarCondition;
    onSelectCar: (car: CarCondition) => void;
    onRequestConsultation: (car: CarCondition) => void;
    formatPrice: (price: number | string) => string;
}

const CarCard: React.FC<CarCardProps> = ({ car, onSelectCar, onRequestConsultation, formatPrice }) => {
    const isUrgent = car['نوع فروش'] === 'صفر' || car.تحویل === 'آنی' || car.تحویل === 'فوری';

    // Generate ID: e.g., "KMC T8" -> "card-KMC-T8"
    const cardId = `card-${car.خودرو.replace(/\s+/g, '-')}`;

    let urgencyBadge = '';
    if (car['نوع فروش'] === 'صفر') {
        urgencyBadge = '<div class="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold animate-pulse">🔥 محدود</div>';
    } else if (car.تحویل === 'آنی' || car.تحویل === 'فوری') {
        urgencyBadge = '<div class="absolute top-2 left-2 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold">⚡ فوری</div>';
    }

    const handleRequestConsultation = () => {
        trackEvent({ category: 'Car Card', action: 'Click Request Consultation', label: car.خودرو });
        onRequestConsultation(car);
    };

    const handleSelectCar = () => {
        trackEvent({ category: 'Car Card', action: 'Click View Details', label: car.خودرو });
        onSelectCar(car);
    };

    return (
        <div 
            id={cardId}
            className="car-card bg-white rounded-xl shadow-lg p-4 md:p-6 relative transition-all duration-300 ease-in-out hover:transform hover:-translate-y-1 hover:shadow-2xl animate-fade-in"
        >
            <div className="relative mb-4">
                <img 
                  src={`https://hoseinikhodro.com/conditions/img/${encodeURIComponent(car.خودرو)}.png`}
                  alt={`شرایط فروش ${car.خودرو} ${car['نوع فروش']}`}
                  className="w-full h-56 md:h-56 object-cover rounded-lg"
                  loading="lazy"
                  onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null; // prevent infinite loop
                      target.src = 'https://hoseinikhodro.com/conditions/img/placeholder.png';
                  }}
                />
                <div className="absolute top-2 right-2 bg-kmc-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">{car.وضعیت}</div>
                <div dangerouslySetInnerHTML={{ __html: urgencyBadge }} />
            </div>

            <h3 className="text-lg md:text-xl font-bold text-kmc-dark-grey-500 mb-2 truncate">{car.خودرو}</h3>
            <p className="text-kmc-mid-grey text-xs md:text-sm mb-4">{`${car['نوع فروش']} ${car['روش پرداخت']} مدل ${car.مدل}`}</p>

            <div className="bg-kmc-orange-100 text-kmc-orange-700 px-3 py-2 rounded-lg text-sm font-medium mb-4 text-center">
                {formatPrice(car['پرداخت اولیه'])}
            </div>

            <div className="space-y-2 mb-4">
                <div className="flex items-center text-xs md:text-sm text-kmc-mid-grey">
                    <svg className="w-3 h-3 md:w-4 md:h-4 text-kmc-green-500 ml-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                    <span className="truncate">{car['رنگ خودرو']}</span>
                </div>
                <div className="flex items-center text-xs md:text-sm text-kmc-mid-grey">
                    <svg className="w-3 h-3 md:w-4 md:h-4 text-kmc-green-500 ml-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                    <span>{car.سند}</span>
                </div>
            </div>

            <div>
                <button
                    onClick={handleRequestConsultation}
                    className={`w-full text-white py-2 md:py-3 rounded-lg font-medium hover:shadow-lg transition-all text-sm md:text-base block text-center ${
                        isUrgent ? 'bg-gradient-to-r from-urgent to-red-700 hover:from-red-700 hover:to-red-800 animate-pulse' : 'bg-gradient-to-r from-kmc-orange-500 to-kmc-orange-600 hover:from-kmc-orange-600 hover:to-kmc-orange-700'
                    }`}
                >
                    درخواست مشاوره
                </button>
                <button
                    onClick={handleSelectCar}
                    className="w-full text-center mt-3 text-kmc-blue-500 hover:text-kmc-blue-600 font-medium text-sm transition-colors"
                >
                    مشاهده جزئیات
                </button>
            </div>
        </div>
    );
};

export default CarCard;
