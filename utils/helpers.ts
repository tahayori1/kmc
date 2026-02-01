
import type { CarCondition, CarModel, UserInfo } from '../types';

export const formatPhoneNumber = (number: string): string => {
    if(!number) return '';
    const persianNumbers = '۰۱۲۳۴۵۶۷۸۹';
    return number.replace(/\d/g, d => persianNumbers[d]).replace(/(\d{4})(\d{3})(\d{4})/, '$1 $2 $3');
};

export const formatPrice = (price: number | string): string => {
    if (typeof price === 'string' && (price.includes('میلیون') || price.includes('میلیارد'))) {
        return price;
    }
    if (typeof price === 'number') {
        if (price >= 1000) {
            const billions = Math.floor(price / 1000);
            const millions = price % 1000;
            const formattedBillions = billions.toLocaleString('fa-IR');
            
            if (millions > 0) {
                const formattedMillions = millions.toLocaleString('fa-IR');
                return `${formattedBillions} میلیارد و ${formattedMillions} میلیون تومان`;
            } else {
                return `${formattedBillions} میلیارد تومان`;
            }
        } else {
            return `${price.toLocaleString('fa-IR')} میلیون تومان`;
        }
    }
    return String(price);
};

const BASE_URL = window.location.origin + window.location.pathname.replace(/\/$/, '');
const SCHEMA_SCRIPT_ID = 'app-structured-data';

// Helper to remove existing schema script
const removeStructuredData = () => {
    const script = document.getElementById(SCHEMA_SCRIPT_ID);
    if (script) {
        script.remove();
    }
};

// Helper to inject new schema script
const injectStructuredData = (schema: object) => {
    removeStructuredData();
    const script = document.createElement('script');
    script.id = SCHEMA_SCRIPT_ID;
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);
};

// Helper to update meta tags dynamically
const updateMetaTag = (selector: string, attribute: string, value: string) => {
    const tag = document.querySelector(selector);
    if (tag) {
        tag.setAttribute(attribute, value);
    } else {
        // Fallback: create the tag if it doesn't exist (basic implementation)
        // For OG and Twitter, creating dynamically is less effective for some crawlers but better than nothing
    }
};

const DEFAULT_IMAGE = "https://hoseinikhodro.com/wp-content/uploads/sites/150/elementor/thumbs/%DA%A9%D8%AF-%DB%B2%DB%B6%DB%B0%DB%B6-%D8%AD%D8%B3%DB%8C%D9%86%DB%8C-r5bc3861hzh5a9zeiouunil55tzm5gavja54dv3ja4.png";

// For a specific car condition (modal view)
export const updateSEOMetadataForCondition = (carData: CarCondition) => {
    const title = `شرایط فروش ${carData.خودرو} مدل ${carData.مدل} - ${carData['نوع فروش']} ${carData['روش پرداخت']} - نمایندگی کرمان موتور حسینی`;
    document.title = title;
    
    const description = `خرید ${carData.خودرو} مدل ${carData.مدل} ${carData['نوع فروش']} ${carData['روش پرداخت']} - ${formatPrice(carData['پرداخت اولیه'])} - تحویل ${carData.تحویل} - نمایندگی رسمی کرمان موتور ۲۶۰۶ حسینی شیراز`;
    updateMetaTag('meta[name="description"]', 'content', description);

    const canonicalUrl = BASE_URL + '#/car/' + carData.slug;
    document.querySelector('#canonicalLink')?.setAttribute('href', canonicalUrl);
    
    const imageUrl = `https://hoseinikhodro.com/conditions/img/${encodeURIComponent(carData.خودرو)}.png`;

    // Update Open Graph
    updateMetaTag('meta[property="og:title"]', 'content', title);
    updateMetaTag('meta[property="og:description"]', 'content', description);
    updateMetaTag('meta[property="og:url"]', 'content', canonicalUrl);
    updateMetaTag('meta[property="og:image"]', 'content', imageUrl);

    // Update Twitter Card
    updateMetaTag('meta[name="twitter:title"]', 'content', title);
    updateMetaTag('meta[name="twitter:description"]', 'content', description);
    updateMetaTag('meta[name="twitter:url"]', 'content', canonicalUrl);
    updateMetaTag('meta[name="twitter:image"]', 'content', imageUrl);
    
    // Structured Data for a specific Offer
    const priceInTomans = typeof carData['پرداخت اولیه'] === 'number' ? carData['پرداخت اولیه'] * 10000000 : 0;
    const vehicleSchema = {
        "@context": "https://schema.org",
        "@type": "Vehicle",
        "name": `${carData.خودرو} مدل ${carData.مدل}`,
        "brand": {
            "@type": "Brand",
            "name": carData.خودرو.split(' ')[0]
        },
        "model": carData.خودرو,
        "vehicleModelDate": carData.مدل,
        "image": imageUrl,
        "description": description,
        "offers": {
            "@type": "Offer",
            "priceCurrency": "IRR",
            "price": priceInTomans,
            "itemCondition": "https://schema.org/NewCondition",
            "availability": carData.وضعیت === 'موجود' ? "https://schema.org/InStock" : "https://schema.org/SoldOut",
            "seller": {
                "@type": "AutomotiveBusiness",
                "name": "نمایندگی ۲۶۰۶ کرمان موتور حسینی",
                "url": BASE_URL,
                 "address": {
                    "@type": "PostalAddress",
                    "streetAddress": "چهارراه بنفشه - نرسیده به فلکه هنگ, روبروی کوچه ۱۸",
                    "addressLocality": "شیراز",
                    "addressRegion": "فارس",
                    "addressCountry": "IR"
                }
            }
        }
    };
    injectStructuredData(vehicleSchema);
};


// For a car model page (list of conditions)
export const updateSEOMetadataForModel = (carModel: CarModel) => {
    const title = `شرایط فروش ${carModel.CarModel} - قیمت و خرید نقدی و اقساطی | نمایندگی حسینی`;
    document.title = title;
    
    const description = `مشاهده تمام شرایط فروش نقدی و اقساطی برای ${carModel.CarModel}. بهترین قیمت و تحویل فوری از نمایندگی رسمی ۲۶۰۶ کرمان موتور حسینی در شیراز.`;
    updateMetaTag('meta[name="description"]', 'content', description);

    const canonicalUrl = BASE_URL + `#/model/${encodeURIComponent(carModel.CarModel.replace(/\s/g, '-'))}`;
    document.querySelector('#canonicalLink')?.setAttribute('href', canonicalUrl);

    const imageUrl = `https://hoseinikhodro.com/conditions/img/${encodeURIComponent(carModel.CarModel)}.png`;

    // Update Open Graph
    updateMetaTag('meta[property="og:title"]', 'content', title);
    updateMetaTag('meta[property="og:description"]', 'content', description);
    updateMetaTag('meta[property="og:url"]', 'content', canonicalUrl);
    updateMetaTag('meta[property="og:image"]', 'content', imageUrl);

    // Update Twitter Card
    updateMetaTag('meta[name="twitter:title"]', 'content', title);
    updateMetaTag('meta[name="twitter:description"]', 'content', description);
    updateMetaTag('meta[name="twitter:url"]', 'content', canonicalUrl);
    updateMetaTag('meta[name="twitter:image"]', 'content', imageUrl);
};


// For the main homepage
export const resetSEOMetadata = () => {
    const defaultTitle = 'نمایندگی ۲۶۰۶ کرمان موتور حسینی - خرید خودرو نقد و اقساط شیراز';
    document.title = defaultTitle;
    
    const defaultDescription = 'نمایندگی رسمی کرمان موتور ۲۶۰۶ حسینی خودرو شیراز. خرید و فروش خودرو صفر و کارکرده، فروش نقدی و اقساطی، تحویل سریع از درب کارخانه';
    updateMetaTag('meta[name="description"]', 'content', defaultDescription);

    document.querySelector('#canonicalLink')?.setAttribute('href', BASE_URL);

    // Reset Open Graph
    updateMetaTag('meta[property="og:title"]', 'content', defaultTitle);
    updateMetaTag('meta[property="og:description"]', 'content', defaultDescription);
    updateMetaTag('meta[property="og:url"]', 'content', BASE_URL);
    updateMetaTag('meta[property="og:image"]', 'content', DEFAULT_IMAGE);

    // Reset Twitter Card
    updateMetaTag('meta[name="twitter:title"]', 'content', defaultTitle);
    updateMetaTag('meta[name="twitter:description"]', 'content', defaultDescription);
    updateMetaTag('meta[name="twitter:url"]', 'content', BASE_URL);
    updateMetaTag('meta[name="twitter:image"]', 'content', DEFAULT_IMAGE);
    
    // AutomotiveBusiness Structured Data for homepage
    const dealershipSchema = {
        "@context": "https://schema.org",
        "@type": "AutomotiveBusiness",
        "name": "نمایندگی ۲۶۰۶ کرمان موتور حسینی",
        "url": BASE_URL,
        "image": DEFAULT_IMAGE,
        "logo": DEFAULT_IMAGE,
        "description": defaultDescription,
        "address": {
            "@type": "PostalAddress",
            "streetAddress": "چهارراه بنفشه - نرسیده به فلکه هنگ, روبروی کوچه ۱۸",
            "addressLocality": "شیراز",
            "addressRegion": "فارس",
            "addressCountry": "IR"
        },
        "telephone": "+989370518538",
        "openingHours": "Sa-We 08:30-14:00, Sa-We 16:00-19:00, Th 08:30-13:30",
        "priceRange": "$$"
    };
    injectStructuredData(dealershipSchema);
};
