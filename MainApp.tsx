
import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
import { CarCondition, UserInfo, CarModel } from './types';
import { formatPrice, updateSEOMetadataForCondition, resetSEOMetadata } from './utils/helpers';
import { fetchAllConditions, submitConsultationRequest, submitUserInfo } from './utils/api';

import Header from './components/Header';
import Hero from './components/Hero';
import CarInventory from './components/CarInventory';
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

const STATIC_PHONE_NUMBERS = ['09370518538', '09004645553', '09004645552', '09004645551'];
const RECENTLY_VIEWED_KEY = 'recentlyViewedCars';
const MAX_RECENTLY_VIEWED = 4;

const MainApp: React.FC = () => {
    const [carModels, setCarModels] = useState<CarModel[]>([]);
    const [allConditions, setAllConditions] = useState<CarCondition[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    
    const [selectedCondition, setSelectedCondition] = useState<CarCondition | null>(null);
    const [isConsultationModalOpen, setIsConsultationModalOpen] = useState<boolean>(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
    const [isUserInfoModalOpen, setIsUserInfoModalOpen] = useState<boolean>(false);
    const [postUserInfoAction, setPostUserInfoAction] = useState<'profile' | null>(null);
    const [isChatOpen, setIsChatOpen] = useState<boolean>(false);

    const [userInfo, setUserInfo] = useState<UserInfo | null>(() => {
        try {
            const storedUserInfo = localStorage.getItem('userInfo');
            return storedUserInfo ? JSON.parse(storedUserInfo) : null;
        } catch (error) {
            console.error('Failed to parse user info from localStorage', error);
            localStorage.removeItem('userInfo');
            return null;
        }
    });

    const [recentlyViewed, setRecentlyViewed] = useState<CarCondition[]>([]);
    
    const [callNumber, setCallNumber] = useState('09370518538');
    const [whatsappNumber, setWhatsappNumber] = useState('09370518538');

    const onUpdateUserInfo = useCallback(async (info: UserInfo) => {
        await submitUserInfo(info);
        localStorage.setItem('userInfo', JSON.stringify(info));
        setUserInfo(info);
    }, []);
    
    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const conditions = await fetchAllConditions();
            
            if (conditions.length === 0) {
                 console.error("No car conditions found. The API might be down or returning empty data.");
            }

            const sortedConditions = conditions.sort((a, b) => {
                const priceA = typeof a['پرداخت اولیه'] === 'number' ? a['پرداخت اولیه'] : Infinity;
                const priceB = typeof b['پرداخت اولیه'] === 'number' ? b['پرداخت اولیه'] : Infinity;
                return priceA - priceB;
            });
            setAllConditions(sortedConditions);
            
            // Load recently viewed
            try {
                const storedRecentlyViewed = localStorage.getItem(RECENTLY_VIEWED_KEY);
                if (storedRecentlyViewed) {
                    const ids = JSON.parse(storedRecentlyViewed) as number[];
                    const viewedConditions = ids.map(id => sortedConditions.find(c => c.id === id)).filter(Boolean) as CarCondition[];
                    setRecentlyViewed(viewedConditions);
                }
            } catch (error) {
                console.error('Failed to load recently viewed cars', error);
            }

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
            setCarModels(sortedCarModels);

        } catch (error) {
            console.error("Error loading data:", error);
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
        
        // Add to recently viewed
        setRecentlyViewed(prev => {
            const filtered = prev.filter(c => c.id !== condition.id);
            const newRecent = [condition, ...filtered].slice(0, MAX_RECENTLY_VIEWED);
            localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(newRecent.map(c => c.id)));
            return newRecent;
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

    return (
        <div className="min-h-screen bg-kmc-beige-100 flex flex-col">
             {isLoading && <ProgressBar />}
             
            <Header 
                inventoryCount={allConditions.length} 
                callNumber={callNumber}
                onOpenProfile={handleOpenProfile}
            />

            <main className="flex-grow">
                <Hero onConsult={handleGeneralConsultation} />
                
                <CarInventory 
                    carModels={carModels} 
                    allConditions={allConditions}
                    onSelectCondition={handleSelectCondition}
                    onRequestConsultation={handleRequestConsultation}
                    onGeneralConsultation={handleGeneralConsultation}
                    isLoading={isLoading}
                />
                
                {recentlyViewed.length > 0 && (
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
