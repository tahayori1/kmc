
import React from 'react';

const testimonials = [
    {
        quote: "خرید KMC J7 از این نمایندگی تجربه فوق‌العاده‌ای بود. تحویل سریع و خدمات پس از فروش عالی. پیشنهاد می‌کنم.",
        initials: "ر.ا",
        name: "رضا احمدی",
        car: "خریدار KMC J7",
        color: "orange"
    },
    {
        quote: "شرایط قسطی فوق‌العاده و مشاوره حرفه‌ای. خودرو BAC X3PRO رو با بهترین قیمت خریدم. ممنون از تیم حسینی خودرو.",
        initials: "س.م",
        name: "سارا محمدی",
        car: "خریدار BAC X3PRO",
        color: "green"
    },
    {
        quote: "تحویل دقیقاً در موعد مقرر. تضمین تحویل آن‌ها واقعی است. KMC SR3 من بدون هیچ مشکلی تحویل شد.",
        initials: "ع.ک",
        name: "علی کریمی",
        car: "خریدار KMC SR3",
        color: "blue"
    }
];

const TestimonialCard: React.FC<typeof testimonials[0]> = ({ quote, initials, name, car, color }) => {
    const colorClasses = {
        orange: 'bg-kmc-orange-100 text-kmc-orange-600',
        green: 'bg-kmc-green-100 text-kmc-green-600',
        blue: 'bg-kmc-blue-100 text-kmc-blue-600',
    };
    
    return (
        <div className="bg-white rounded-xl p-6 shadow-lg transition-all duration-300 ease-in-out hover:transform hover:-translate-y-1 hover:shadow-2xl">
            <div className="flex items-center mb-4 text-amber-400">
                <span>⭐⭐⭐⭐⭐</span>
            </div>
            <p className="text-kmc-dark-grey-500 mb-4 leading-relaxed text-sm md:text-base">"{quote}"</p>
            <div className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${colorClasses[color as keyof typeof colorClasses]}`}>
                    <span className="font-bold">{initials}</span>
                </div>
                <div>
                    <p className="font-semibold text-kmc-dark-grey-500">{name}</p>
                    <p className="text-xs text-kmc-mid-grey">{car}</p>
                </div>
            </div>
        </div>
    );
};

const MemoizedTestimonialCard = React.memo(TestimonialCard);

const Testimonials: React.FC = () => {
    return (
        <section className="py-16 bg-kmc-light-grey">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-2xl md:text-4xl font-bold mb-4 text-kmc-dark-grey-500">نظرات مشتریان راضی</h2>
                    <p className="text-base md:text-lg text-kmc-mid-grey">تجربه خرید مشتریان ما از حسینی خودرو</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    {testimonials.map((t, index) => <MemoizedTestimonialCard key={index} {...t} />)}
                </div>
            </div>
        </section>
    );
};

export default React.memo(Testimonials);
