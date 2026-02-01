
import React from 'react';

interface Props {
    onCall: () => void;
    onConsult: () => void;
    callNumber: string;
}

const StickyBottomNav: React.FC<Props> = ({ onCall, onConsult, callNumber }) => {
    return (
        <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-[90] md:hidden flex p-3 gap-3">
             <a href={`tel:${callNumber}`} className="flex-1 bg-kmc-green-500 hover:bg-kmc-green-600 text-white rounded-lg flex items-center justify-center py-3 font-bold gap-2 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                تماس
            </a>
            <button onClick={onConsult} className="flex-1 bg-kmc-orange-500 hover:bg-kmc-orange-600 text-white rounded-lg flex items-center justify-center py-3 font-bold gap-2 transition-colors animate-pulse">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                مشاوره رایگان
            </button>
        </div>
    );
};

export default StickyBottomNav;
