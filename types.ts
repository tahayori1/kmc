

export interface ApiCarCondition {
    status: string;
    car_model: string;
    model: string;
    sale_type: string;
    pay_type: string;
    colors: string;
    indeed_status: string;
    delivery_time: string;
    initial_deposit: string;
    descriptions: string;
    id: number;
}

export interface CarCondition {
    id: number;
    "وضعیت": string;
    "خودرو": string;
    "مدل": number;
    "نوع فروش": string;
    "روش پرداخت": string;
    "رنگ خودرو": string;
    "سند": string;
    "تحویل": string;
    "پرداخت اولیه": number | string;
    "توضیحات": string;
    "slug": string;
}

export interface CarModel {
    CarModel: string;
    MinimumDeposit: number;
    conditionCount?: number;
}

export interface UserInfo {
    name: string;
    phone: string;
    city: string;
    carOfInterest?: string;
}

export interface ChatMessage {
    sender: 'user' | 'bot';
    text: string;
    timestamp: number;
}