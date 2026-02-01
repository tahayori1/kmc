
import type { ApiCarCondition, CarCondition, CarModel, UserInfo } from '../types';
import { formatPrice } from './helpers';

const BASE_API_URL = 'https://api.hoseinikhodro.com/webhook';

const mapApiConditionToCarCondition = (apiCond: ApiCarCondition): CarCondition => {
    // Defensive parsing for numbers, with a fallback to 0 if invalid
    const initialDeposit = parseInt(apiCond.initial_deposit, 10);
    const modelYear = parseInt(apiCond.model, 10);

    // Defensive handling of all properties to prevent TypeErrors on null/undefined
    const carModelStr = apiCond.car_model ?? 'نامشخص';
    const saleTypeStr = apiCond.sale_type ?? 'نامشخص';
    const payTypeStr = apiCond.pay_type ?? 'نامشخص';

    return {
        id: apiCond.id,
        "وضعیت": apiCond.status ?? 'نامشخص',
        "خودرو": carModelStr,
        "مدل": isNaN(modelYear) ? 0 : modelYear,
        "نوع فروش": saleTypeStr,
        "روش پرداخت": payTypeStr,
        "رنگ خودرو": (apiCond.colors ?? '').replace(/,/g, ' - '), // Safely handle null colors
        "سند": apiCond.indeed_status ?? 'نامشخص',
        "تحویل": apiCond.delivery_time ?? 'نامشخص',
        "پرداخت اولیه": isNaN(initialDeposit) ? (apiCond.initial_deposit || 'نامشخص') : initialDeposit,
        "توضیحات": apiCond.descriptions ?? 'ندارد',
        "slug": `${carModelStr}-${saleTypeStr}-${payTypeStr}-${apiCond.id}`.replace(/\s/g, '-'),
    };
};

export async function fetchAllConditions(): Promise<CarCondition[]> {
    try {
        const response = await fetch('https://api.hoseinikhodro.com/webhook/cdded59e-5173-4cce-84a0-6e2992e0489f/');
        if (!response.ok) {
            console.error(`Failed to fetch conditions, status: ${response.status}`);
            return [];
        }
        const text = await response.text();
        if (!text) return [];

        const data: ApiCarCondition[] | ApiCarCondition = JSON.parse(text);
        
        // Ensure data is an array
        let conditionsArray: ApiCarCondition[];
        if (!Array.isArray(data)) {
            // Handle the case where the API might return a single object instead of an array
            console.warn(`Expected an array for conditions, but got an object. Wrapping it in an array.`, data);
            conditionsArray = data && typeof data === 'object' ? [data] : [];
        } else {
            conditionsArray = data;
        }

        // Filter out any null, undefined, or non-object entries before mapping to prevent crashes
        const validEntries = conditionsArray.filter(item => item && typeof item === 'object');
        
        if (validEntries.length !== conditionsArray.length) {
            console.warn('Some invalid (e.g., null) entries were filtered from the API response.');
        }
        
        const mappedConditions = validEntries.map(mapApiConditionToCarCondition);
        const uniqueConditions = Array.from(new Map(mappedConditions.map(item => [item.id, item])).values());
        return uniqueConditions;

    } catch (error) {
        console.error("Failed to fetch or parse conditions", error);
        return [];
    }
}


export async function submitUserInfo(userInfo: UserInfo): Promise<void> {
    const payload: any = { ...userInfo };

    if (userInfo.carOfInterest) {
        payload.description = `کاربر برای خودروی ${userInfo.carOfInterest} علاقه نشان داده است.`;
    }

    const response = await fetch(`${BASE_API_URL}/b35ce87e-b016-4eaa-bdc0-99963775a5a5`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error('Failed to submit user info');
}

export async function submitConsultationRequest(request: {
    userInfo: UserInfo,
    condition?: CarCondition | null
}): Promise<void> {
    const { userInfo, condition } = request;
    
    const carOfInterest = condition ? condition['خودرو'] : (userInfo.carOfInterest || 'مشاوره عمومی');
    
    let description = '';
    if (condition) {
        description = `شرایط انتخابی: ${condition['نوع فروش']} ${condition['روش پرداخت']} - مدل ${condition['مدل']}. رنگ: ${condition['رنگ خودرو']} / سند: ${condition['سند']} / تحویل: ${condition['تحویل']} / پرداخت اولیه: ${formatPrice(condition['پرداخت اولیه'])}. توضیحات: ${condition.توضیحات}`;
    } else {
        description = 'درخواست مشاوره عمومی / کمک در انتخاب خودرو (لید عمومی)';
    }

    const payload = {
        name: userInfo.name,
        phone: userInfo.phone,
        city: userInfo.city,
        carOfInterest: carOfInterest,
        description: description,
    };

    const response = await fetch(`${BASE_API_URL}/b35ce87e-b016-4eaa-bdc0-99963775a5a5`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });

    if (!response.ok) throw new Error('Failed to submit consultation request');
}
