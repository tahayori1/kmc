
import React from 'react';

export const SkeletonModelCard: React.FC = () => {
    return (
        <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 relative animate-pulse h-[350px] flex flex-col justify-between">
            <div>
                <div className="w-full h-56 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2 mx-auto mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3 mx-auto mb-4"></div>
            </div>
            <div className="w-full h-10 bg-gray-200 rounded-lg mt-auto"></div>
        </div>
    );
};

export const SkeletonCarCard: React.FC = () => {
    return (
        <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 relative animate-pulse">
            <div className="w-full h-56 bg-gray-200 rounded-lg mb-4"></div>
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-10 bg-gray-200 rounded-lg mb-4"></div>
            <div className="space-y-2 mb-4">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            </div>
            <div className="space-y-3">
                <div className="h-10 bg-gray-200 rounded-lg"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4 mx-auto"></div>
            </div>
        </div>
    );
};
