
import React from 'react';
import { CarModel } from '../types';
import { formatPrice } from '../utils/helpers';

interface CarModelCardProps {
    carModel: CarModel;
    onSelectCarModel: (model: string) => void;
}

const CarModelCard: React.FC<CarModelCardProps> = ({ carModel, onSelectCarModel }) => {
    // Generate ID: e.g., "KMC T8" -> "card-KMC-T8"
    const cardId = `card-${carModel.CarModel.replace(/\s+/g, '-')}`;

    return (
        <div 
            id={cardId}
            onClick={() => onSelectCarModel(carModel.CarModel)}
            className="car-model-card bg-white rounded-xl shadow-lg p-4 md:p-6 relative transition-all duration-300 ease-in-out hover:transform hover:-translate-y-1 hover:shadow-2xl animate-fade-in cursor-pointer flex flex-col justify-between"
        >
            <div>
                <div className="relative mb-4">
                    <img 
                        src={`https://hoseinikhodro.com/conditions/img/${encodeURIComponent(carModel.CarModel)}.png`} 
                        alt={`خرید ${carModel.CarModel} نقدی و اقساطی`}
                        className="w-full h-56 md:h-56 object-cover rounded-lg" 
                        loading="lazy"
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.onerror = null; // prevent infinite loop
                            target.src = 'https://hoseinikhodro.com/conditions/img/placeholder.png';
                        }}
                    />
                     {carModel.conditionCount && carModel.conditionCount > 0 && (
                        <div className="absolute top-2 right-2 bg-kmc-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                            {carModel.conditionCount} شرایط فعال
                        </div>
                    )}
                </div>
                <h3 className="text-lg md:text-xl font-bold text-kmc-dark-grey-500 mb-2 text-center">{carModel.CarModel}</h3>
                <div className="text-center text-sm text-kmc-mid-grey mb-4">
                    شروع قیمت از <span className="font-semibold text-kmc-green-600">{formatPrice(carModel.MinimumDeposit)}</span>
                </div>
            </div>
            <button
                className="w-full bg-gradient-to-r from-kmc-dark-grey-500 to-kmc-dark-grey-600 text-white py-2 md:py-3 rounded-lg font-medium hover:shadow-lg transition-all text-sm md:text-base block text-center mt-auto"
            >
                مشاهده شرایط فروش
            </button>
        </div>
    );
};

export default CarModelCard;
