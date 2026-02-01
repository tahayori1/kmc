
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { CarCondition, CarModel } from '../types';
import CarCard from './CarCard';
import CarModelCard from './CarModelCard';
import { formatPrice } from '../utils/helpers';
import { updateSEOMetadataForModel, resetSEOMetadata } from '../utils/helpers';
import { SkeletonCarCard, SkeletonModelCard } from './Skeletons';
import InlineLeadCapture from './InlineLeadCapture';
import { trackEvent } from '../utils/tracking';

interface CarInventoryProps {
    carModels: CarModel[];
    allConditions: CarCondition[];
    onSelectCondition: (condition: CarCondition) => void;
    onRequestConsultation: (condition: CarCondition) => void;
    onGeneralConsultation: () => void;
    isLoading?: boolean;
}

const CarInventory: React.FC<CarInventoryProps> = ({ carModels, allConditions, onSelectCondition, onRequestConsultation, onGeneralConsultation, isLoading = false }) => {
    const [selectedCarModel, setSelectedCarModel] = useState<string | null>(null);

    const scrollInventoryToTop = useCallback(() => {
        setTimeout(() => {
            document.getElementById('cars')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    }, []);

    useEffect(() => {
        if (carModels.length > 0 && window.location.hash.startsWith('#/model/') && selectedCarModel === null) {
            try {
                const modelFromHash = decodeURIComponent(window.location.hash.substring(8));
                const foundModel = carModels.find(m => m.CarModel.replace(/\s/g, '-') === modelFromHash);
                if (foundModel) {
                    setSelectedCarModel(foundModel.CarModel);
                    scrollInventoryToTop();
                }
            } catch (e) {
                console.error("Error decoding hash on initial load:", e);
            }
        }
    }, [carModels, selectedCarModel, scrollInventoryToTop]);

    useEffect(() => {
        const handlePopState = () => {
            if (window.location.hash.startsWith('#/model/')) {
                try {
                    const modelFromHash = decodeURIComponent(window.location.hash.substring(8));
                    const foundModel = carModels.find(m => m.CarModel.replace(/\s/g, '-') === modelFromHash);
                    setSelectedCarModel(foundModel ? foundModel.CarModel : null);
                } catch (e) {
                    console.error("Error decoding hash on popstate:", e);
                    setSelectedCarModel(null);
                }
            } else {
                setSelectedCarModel(null);
            }
             scrollInventoryToTop();
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [carModels, scrollInventoryToTop]);

    useEffect(() => {
        const selectedModelData = carModels.find(m => m.CarModel === selectedCarModel);
        if (selectedModelData) {
            updateSEOMetadataForModel(selectedModelData);
        } else {
            resetSEOMetadata();
        }
    }, [selectedCarModel, carModels]);

    const conditionsForSelectedModel = useMemo(() => {
        if (!selectedCarModel) return [];

        return allConditions
            .filter(c => c['خودرو'] === selectedCarModel)
            .sort((a, b) => {
                const priceA = typeof a['پرداخت اولیه'] === 'number' ? a['پرداخت اولیه'] : Infinity;
                const priceB = typeof b['پرداخت اولیه'] === 'number' ? b['پرداخت اولیه'] : Infinity;
                return priceA - priceB;
            });
    }, [selectedCarModel, allConditions]);

    const handleSelectCarModel = useCallback((modelName: string) => {
        trackEvent({ category: 'Inventory', action: 'Select Model', label: modelName });
        const modelData = carModels.find(m => m.CarModel === modelName);
        if (modelData) {
            setSelectedCarModel(modelName);
            const hash = `#/model/${encodeURIComponent(modelName.replace(/\s/g, '-'))}`;
            history.pushState({ model: modelName }, '', hash);
            scrollInventoryToTop();
        }
    }, [carModels, scrollInventoryToTop]);

    const handleGoBack = useCallback(() => {
        trackEvent({ category: 'Inventory', action: 'Click', label: 'Back to List' });
        setSelectedCarModel(null);
        history.pushState(null, '', window.location.pathname + window.location.search);
        scrollInventoryToTop();
    }, [scrollInventoryToTop]);


    if (isLoading) {
        return (
            <section id="cars" className="py-16">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-2xl md:text-4xl font-bold mb-4 text-kmc-dark-grey-500">محصولات کرمان موتور</h2>
                        <p className="text-base md:text-lg text-kmc-mid-grey max-w-2xl mx-auto">در حال دریافت جدیدترین لیست قیمت و شرایط...</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                        {[...Array(8)].map((_, i) => (
                            <SkeletonModelCard key={i} />
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (!selectedCarModel) {
        return (
            <section id="cars" className="py-16">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-2xl md:text-4xl font-bold mb-4 text-kmc-dark-grey-500">خودرو مورد نظر خود را انتخاب کنید</h2>
                        <p className="text-base md:text-lg text-kmc-mid-grey max-w-2xl mx-auto">جدیدترین محصولات کرمان موتور و BAC با بهترین شرایط فروش</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                        {carModels.map(model => (
                            <CarModelCard key={model.CarModel} carModel={model} onSelectCarModel={handleSelectCarModel} />
                        ))}
                        <InlineLeadCapture onConsult={onGeneralConsultation} />
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section id="cars" className="py-16">
            <div className="container mx-auto px-4">
                <div className="text-center mb-8">
                    <h2 className="text-2xl md:text-4xl font-bold mb-4 text-kmc-dark-grey-500">شرایط فروش {selectedCarModel}</h2>
                    <p className="text-base md:text-lg text-kmc-mid-grey max-w-2xl mx-auto">از میان شرایط متنوع فروش، بهترین گزینه را برای خرید انتخاب کنید</p>
                </div>
                
                <div className="text-center mb-8">
                     <button onClick={handleGoBack} className="text-kmc-blue-500 hover:text-kmc-blue-700 hover:underline inline-flex items-center gap-2 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 rtl:-scale-x-100" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                        بازگشت به لیست خودروها
                    </button>
                </div>

                <div id="carsContainer" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                    {conditionsForSelectedModel.length > 0 ? (
                        <>
                            {conditionsForSelectedModel.map(car => (
                                <CarCard key={car.id} car={car} onSelectCar={onSelectCondition} onRequestConsultation={onRequestConsultation} formatPrice={formatPrice} />
                            ))}
                            <InlineLeadCapture onConsult={onGeneralConsultation} />
                        </>
                    ) : (
                        <>
                             <div className="col-span-full text-center py-12">
                                <p className="text-lg text-kmc-mid-grey mb-6">برای این خودرو در حال حاضر شرایط فروشی ثبت نشده است</p>
                                <div className="max-w-md mx-auto">
                                    <InlineLeadCapture onConsult={onGeneralConsultation} />
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </section>
    );
};

export default React.memo(CarInventory);
