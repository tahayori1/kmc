
import React from 'react';

const benefits = [
    { 
        icon: <svg className="w-6 md:w-8 h-6 md:h-8 text-kmc-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>, 
        title: "ضمانت رسمی", 
        description: "نمایندگی رسمی کرمان موتور با کد ۲۶۰۶",
        color: "blue"
    },
    { 
        icon: <svg className="w-6 md:w-8 h-6 md:h-8 text-kmc-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>, 
        title: "تضمین تحویل", 
        description: "تحویل در موعد مقرر یا جبران خسارت ۳٪ ماهانه",
        color: "orange"
    },
    { 
        icon: <svg className="w-6 md:w-8 h-6 md:h-8 text-kmc-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path></svg>, 
        title: "شرایط متنوع", 
        description: "فروش نقدی، اقساطی، و لیزینگی",
        color: "green"
    },
    { 
        icon: <svg className="w-6 md:w-8 h-6 md:h-8 text-kmc-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>, 
        title: "۴۳ سال سابقه", 
        description: "تاسیس ۱۳۶۱ - تجربه و اعتماد",
        color: "blue"
    },
    { 
        icon: <svg className="w-6 md:w-8 h-6 md:h-8 text-kmc-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>, 
        title: "تحویل سریع", 
        description: "ارسال مستقیم از درب کارخانه",
        color: "orange"
    },
    { 
        icon: <svg className="w-6 md:w-8 h-6 md:h-8 text-kmc-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>, 
        title: "پشتیبانی ۲۴/۷", 
        description: "مشاوره رایگان و پشتیبانی کامل",
        color: "green"
    }
];

const Benefit: React.FC<typeof benefits[0]> = ({ icon, title, description, color }) => {
     const colorClasses = {
        orange: 'bg-kmc-orange-100',
        green: 'bg-kmc-green-100',
        blue: 'bg-kmc-blue-100',
    };
    return (
        <div className="text-center">
            <div className={`w-12 md:w-16 h-12 md:h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${colorClasses[color as keyof typeof colorClasses]}`}>
                {icon}
            </div>
            <h3 className="text-lg md:text-xl font-bold mb-2 text-kmc-dark-grey-500">{title}</h3>
            <p className="text-sm md:text-base text-kmc-mid-grey">{description}</p>
        </div>
    )
};

const MemoizedBenefit = React.memo(Benefit);

const Benefits: React.FC = () => {
    return (
        <section className="py-16 bg-white">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-2xl md:text-4xl font-bold mb-4 text-kmc-dark-grey-500">چرا حسینی خودرو؟</h2>
                    <p className="text-base md:text-lg text-kmc-mid-grey">مزایای خرید از نمایندگی رسمی کرمان موتور</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
                    {benefits.map((b, i) => <MemoizedBenefit key={i} {...b} />)}
                </div>
            </div>
        </section>
    );
};

export default React.memo(Benefits);
