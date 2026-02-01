import React, { lazy, Suspense } from 'react';

const MainApp = lazy(() => import('./MainApp'));

const App: React.FC = () => {
    return (
        <Suspense fallback={
            <div className="flex flex-col items-center justify-center h-screen bg-kmc-beige-100" role="status" aria-label="Loading application">
                <div className="w-12 h-12 border-4 border-kmc-orange-200 border-t-kmc-orange-600 rounded-full animate-spin mb-4"></div>
                <div className="text-kmc-dark-grey-500 font-bold text-lg">کرمان موتور ۲۶۰۶ حسینی</div>
            </div>
        }>
            <MainApp />
        </Suspense>
    );
};

export default App;