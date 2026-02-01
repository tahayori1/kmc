import React from 'react';

const ProgressBar: React.FC = () => {
    return (
        <div className="fixed top-0 left-0 w-full h-1 z-[1000] bg-transparent overflow-hidden">
            <div className="h-full bg-gradient-to-r from-kmc-orange-400 to-kmc-red-600 animate-indeterminate-bar w-full origin-left"></div>
            <style>{`
                @keyframes indeterminate-bar {
                    0% { transform: translateX(-100%); }
                    50% { transform: translateX(0%); }
                    100% { transform: translateX(100%); }
                }
                .animate-indeterminate-bar {
                    animation: indeterminate-bar 1.5s infinite cubic-bezier(0.65, 0.815, 0.735, 0.395);
                }
            `}</style>
        </div>
    );
};

export default ProgressBar;