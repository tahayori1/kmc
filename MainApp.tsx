
import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
import { CarCondition, UserInfo, CarModel } from './types';
import { formatPrice, updateSEOMetadataForCondition, resetSEOMetadata } from './utils/helpers';
import { fetchAllConditions, submitConsultationRequest, submitUserInfo } from './utils/api';

import Header from './components/Header';
import Hero from './components/Hero';
import CarInventory from './components/CarInventory';
import InlineLeadCapture from './components/InlineLeadCapture';
import RecentlyViewed from './components/RecentlyViewed';
import ProgressBar from './components/ProgressBar';

const Testimonials = lazy(() => import('./components/Testimonials'));
const Benefits = lazy(() => import('./components/Benefits'));
const CTA = lazy(() => import('./components/CTA'));
const Footer = lazy(() => import('./components/Footer'));
const CarModal = lazy(() => import('./components/CarModal'));
const ConsultationModal = lazy(() => import('./components/ConsultationModal'));
const UserProfileModal = lazy(() => import('./components/UserProfileModal'));
const UserInfoModal = lazy(() => import('./components/UserInfoModal'));
const Chatbot = lazy(() => import('./components/Chatbot'));
const ConsultationPage = lazy(() => import('./components/ConsultationPage'));


// No static conditions fallback imported here to avoid offline access


function processConditions(conditions: CarCondition[]) {
    const sortedConditions = [...conditions].sort((a, b) => {
        const priceA = typeof a['پرداخت اولیه'] === 'number' ? a['پرداخت اولیه'] : Infinity;
        const priceB = typeof b['پرداخت اولیه'] === 'number' ? b['پرداخت اولیه'] : Infinity;
        return priceA - priceB;
    });

    const carModelsData: { [key: string]: CarCondition[] } = {};
    for (const cond of sortedConditions) {
        if (!carModelsData[cond.خودرو]) {
            carModelsData[cond.خودرو] = [];
        }
        carModelsData[cond.خودرو].push(cond);
    }

    const derivedCarModels: CarModel[] = Object.keys(carModelsData).map(carModelName => {
        const modelConditions = carModelsData[carModelName];
        const validDeposits = modelConditions
            .map(c => c['پرداخت اولیه'])
            .filter((p): p is number => typeof p === 'number');
        
        const minimumDeposit = validDeposits.length > 0 ? Math.min(...validDeposits) : 0;
        
        return {
            CarModel: carModelName,
            MinimumDeposit: minimumDeposit,
            conditionCount: modelConditions.length
        };
    });
    
    const sortedCarModels = derivedCarModels.sort((a, b) => a.MinimumDeposit - b.MinimumDeposit);

    return { sortedConditions, sortedCarModels };
}

const STATIC_PHONE_NUMBERS = ['07191690906'];
const RECENTLY_VIEWED_KEY = 'recentlyViewedCars';
const MAX_RECENTLY_VIEWED = 4;

const MainApp: React.FC = () => {
    const [allConditions, setAllConditions] = useState<CarCondition[]>([]);
    const [carModels, setCarModels] = useState<CarModel[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [apiHasError, setApiHasError] = useState<boolean>(false);
    
    const [selectedCondition, setSelectedCondition] = useState<CarCondition | null>(null);
    const [isConsultationModalOpen, setIsConsultationModalOpen] = useState<boolean>(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
    const [isUserInfoModalOpen, setIsUserInfoModalOpen] = useState<boolean>(false);
    const [postUserInfoAction, setPostUserInfoAction] = useState<'profile' | null>(null);
    const [isChatOpen, setIsChatOpen] = useState<boolean>(false);

    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

    const [recentlyViewed, setRecentlyViewed] = useState<CarCondition[]>([]);
    const [currentHash, setCurrentHash] = useState<string>(window.location.hash);

    useEffect(() => {
        const handleHashChangeGlobal = () => {
            setCurrentHash(window.location.hash);
        };
        window.addEventListener('hashchange', handleHashChangeGlobal);
        return () => window.removeEventListener('hashchange', handleHashChangeGlobal);
    }, []);
    
    const [callNumber, setCallNumber] = useState('07191690906');
    const [whatsappNumber, setWhatsappNumber] = useState('07191690906');

    const onUpdateUserInfo = useCallback(async (info: UserInfo) => {
        await submitUserInfo(info);
        setUserInfo(info);
    }, []);
    
    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const conditions = await fetchAllConditions();
            
            if (conditions && conditions.length > 0) {
                const { sortedConditions, sortedCarModels } = processConditions(conditions);
                setAllConditions(sortedConditions);
                setCarModels(sortedCarModels);
                setApiHasError(false);
            } else {
                 console.error("No car conditions found. The API might be down or returning empty data.");
                 setAllConditions([]);
                 setCarModels([]);
                 setApiHasError(true);
            }
        } catch (error) {
            console.error("Error loading data:", error);
            setAllConditions([]);
            setCarModels([]);
            setApiHasError(true);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // 1. Initial Data Load (Runs once)
    useEffect(() => {
        loadData();
        
        // Randomize phone numbers
        const randomPhone = STATIC_PHONE_NUMBERS[Math.floor(Math.random() * STATIC_PHONE_NUMBERS.length)];
        setCallNumber(randomPhone);
        setWhatsappNumber(randomPhone);
    }, [loadData]);

    // 2. Hash Handling (Runs when allConditions updates or hash changes)
    useEffect(() => {
        const handleHashChange = () => {
            if (window.location.hash.startsWith('#/car/')) {
                const slug = decodeURIComponent(window.location.hash.substring(6));
                if (allConditions.length > 0) {
                   const condition = allConditions.find(c => c.slug === slug);
                   if (condition) {
                       setSelectedCondition(condition);
                       updateSEOMetadataForCondition(condition);
                   }
                }
            } else if (!window.location.hash.startsWith('#/model/')) {
                setSelectedCondition(null);
                resetSEOMetadata();
            }
        };

        window.addEventListener('hashchange', handleHashChange);
        
        // Check initial hash when data becomes available
        if (allConditions.length > 0) {
            handleHashChange();
        }
        
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, [allConditions]);

    const handleSelectCondition = useCallback((condition: CarCondition) => {
        setSelectedCondition(condition);
        window.location.hash = `/car/${condition.slug}`;
        
        // Add to recently viewed in-memory list (avoiding persistent storage)
        setRecentlyViewed(prev => {
            const filtered = prev.filter(c => c.id !== condition.id);
            return [condition, ...filtered].slice(0, MAX_RECENTLY_VIEWED);
        });
    }, []);

    const handleCloseModal = useCallback(() => {
        setSelectedCondition(null);
        // Revert hash if it was on a car
        if (window.location.hash.startsWith('#/car/')) {
            history.pushState("", document.title, window.location.pathname + window.location.search);
            resetSEOMetadata();
        }
    }, []);

    const handleRequestConsultation = useCallback((condition: CarCondition) => {
        setSelectedCondition(condition); // Ensure modal is open or context is set
        setIsConsultationModalOpen(true);
    }, []);

    const handleGeneralConsultation = useCallback(() => {
        // Redirect general consultation to Chatbot
        setIsChatOpen(true);
    }, []);

    const handleOpenProfile = useCallback(() => {
        if (!userInfo) {
            setPostUserInfoAction('profile');
            setIsUserInfoModalOpen(true);
        } else {
            setIsProfileModalOpen(true);
        }
    }, [userInfo]);

    const handleUserInfoSubmit = async (info: UserInfo) => {
        await onUpdateUserInfo(info);
        setIsUserInfoModalOpen(false);
        if (postUserInfoAction === 'profile') {
            setIsProfileModalOpen(true);
        }
        setPostUserInfoAction(null);
    };

    if (currentHash.startsWith('#/consultation')) {
        return (
            <Suspense fallback={
                <div className="flex flex-col items-center justify-center h-screen bg-kmc-beige-100" role="status" aria-label="Loading page">
                    <div className="w-12 h-12 border-4 border-kmc-orange-200 border-t-kmc-orange-600 rounded-full animate-spin mb-4"></div>
                    <div className="text-kmc-dark-grey-500 font-bold text-lg">کرمان موتور ۲۶۰۶ حسینی</div>
                </div>
            }>
                <ConsultationPage 
                    availableCarModels={carModels.map(m => m.CarModel)} 
                    onBackToHome={() => {
                        window.location.hash = '';
                    }} 
                    callNumber={callNumber}
                />
            </Suspense>
        );
    }

    return (
        <div className="min-h-screen bg-kmc-beige-100 flex flex-col">
             {isLoading && <ProgressBar />}
             
            <Header 
                inventoryCount={apiHasError ? 0 : allConditions.length} 
                callNumber={callNumber}
                onOpenProfile={handleOpenProfile}
            />

            <main className="flex-grow">
                <Hero onConsult={handleGeneralConsultation} />
                
                {apiHasError ? (
                    <section className="py-12 bg-kmc-beige-100">
                        <div className="container mx-auto px-4 max-w-2xl text-center space-y-6">
                            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-red-100 space-y-4">
                                <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto text-red-500 text-2xl">
                                    ⚠️
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-lg font-bold text-kmc-dark-grey-600">عدم دسترسی به سرور مرکزی شرایط فروش</h3>
                                    <p className="text-xs text-kmc-mid-grey leading-relaxed">
                                        جهت حفظ دقت و صحت اطلاعات و مبالغ خرید نقد و اقساط، دسترسی به لیست خودروها در حالت آفلاین غیرفعال شده است. لطفاً اتصال اینترنت خود را بررسی نموده و مجدداً تلاش نمایید.
                                    </p>
                                </div>
                                
                                <div className="flex justify-center">
                                    <button
                                        onClick={loadData}
                                        className="bg-kmc-orange-500 hover:bg-kmc-orange-600 text-white px-5 py-2 rounded-xl font-bold transition-all text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H18" />
                                        </svg>
                                        <span>تلاش مجدد برای اتصال</span>
                                    </button>
                                </div>
                            </div>

                            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-kmc-beige-200">
                                <div className="mb-4">
                                    <span className="bg-kmc-orange-500/10 text-kmc-orange-600 text-[10px] font-bold px-3 py-1 rounded-full">
                                        ثبت درخواست تماس فوری پشتیبانی ۲۴ ساعته
                                    </span>
                                    <h4 className="text-sm font-bold text-kmc-dark-grey-500 mt-2">دریافت آخرین شرایط فعال و کاتالوگ قیمت‌ها</h4>
                                    <p className="text-xs text-kmc-mid-grey mt-1">با تکمیل فرم زیر، کارشناسان نمایندگی ۲۶۰۶ حسینی در اولین فرصت شرایط روز را خدمت شما اعلام خواهند کرد.</p>
                                </div>
                                <div className="max-w-sm mx-auto">
                                    <InlineLeadCapture onConsult={handleGeneralConsultation} />
                                </div>
                            </div>
                        </div>
                    </section>
                ) : (
                    <CarInventory 
                        carModels={carModels} 
                        allConditions={allConditions}
                        onSelectCondition={handleSelectCondition}
                        onRequestConsultation={handleRequestConsultation}
                        onGeneralConsultation={handleGeneralConsultation}
                        isLoading={isLoading}
                    />
                )}
                
                {!apiHasError && recentlyViewed.length > 0 && (
                    <RecentlyViewed 
                        conditions={recentlyViewed}
                        onSelectCondition={handleSelectCondition}
                    />
                )}

                <Suspense fallback={<div className="h-96 bg-gray-100 animate-pulse"></div>}>
                    <Benefits />
                </Suspense>

                <Suspense fallback={<div className="h-96 bg-gray-100 animate-pulse"></div>}>
                    <Testimonials />
                </Suspense>

                <Suspense fallback={<div className="h-64 bg-gray-800 animate-pulse"></div>}>
                    <CTA callNumber={callNumber} whatsappNumber={whatsappNumber} />
                </Suspense>
            </main>

            <Suspense fallback={<div className="h-96 bg-gray-900"></div>}>
                <Footer phoneNumbers={STATIC_PHONE_NUMBERS} />
            </Suspense>

            {/* Modals */}
            <Suspense fallback={null}>
                {selectedCondition && (
                    <CarModal 
                        car={selectedCondition} 
                        onClose={handleCloseModal} 
                        onOpenConsultation={() => setIsConsultationModalOpen(true)}
                        formatPrice={formatPrice}
                    />
                )}
                
                {isConsultationModalOpen && (
                    <ConsultationModal
                        car={selectedCondition}
                        userInfo={userInfo}
                        onClose={() => setIsConsultationModalOpen(false)}
                        onUpdateAndConfirm={async (info) => {
                            await onUpdateUserInfo(info);
                            await submitConsultationRequest({ userInfo: info, condition: selectedCondition });
                        }}
                    />
                )}

                {isUserInfoModalOpen && (
                    <UserInfoModal 
                        onSubmit={handleUserInfoSubmit}
                        onClose={() => setIsUserInfoModalOpen(false)}
                    />
                )}

                {isProfileModalOpen && userInfo && (
                    <UserProfileModal 
                        currentUserInfo={userInfo}
                        onClose={() => setIsProfileModalOpen(false)}
                        onUpdate={onUpdateUserInfo}
                    />
                )}
                
                <Chatbot 
                    isOpen={isChatOpen}
                    onToggle={() => setIsChatOpen(!isChatOpen)}
                    onClose={() => setIsChatOpen(false)}
                    userInfo={userInfo}
                    onUpdateUserInfo={onUpdateUserInfo}
                    carModels={carModels}
                />
            </Suspense>
        </div>
    );
};

export default MainApp;
