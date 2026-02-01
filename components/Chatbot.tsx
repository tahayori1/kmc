
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import type { UserInfo, CarModel, ChatMessage } from '../types';
import { cities } from '../constants';
import { trackEvent, trackLeadGeneration } from '../utils/tracking';

interface ChatbotProps {
    userInfo: UserInfo | null;
    onUpdateUserInfo: (info: UserInfo) => Promise<void>;
    carModels: CarModel[];
    isOpen: boolean;
    onToggle: () => void;
    onClose: () => void;
}

const Chatbot: React.FC<ChatbotProps> = ({ userInfo, onUpdateUserInfo, carModels, isOpen, onToggle, onClose }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isTyping, setIsTyping] = useState(false);

    // Form state for when userInfo is not present
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [city, setCity] = useState('');
    const [carOfInterest, setCarOfInterest] = useState('');
    const [formError, setFormError] = useState('');

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages, isTyping]);
    
    useEffect(() => {
        if (isOpen && !userInfo) {
            setMessages([]);
        } else if (isOpen && userInfo && messages.length === 0) {
             const welcomeText = userInfo.carOfInterest
                ? `سلام ${userInfo.name} عزیز! در خصوص خودروی ${userInfo.carOfInterest} در خدمتم. چه سوالی دارید؟`
                : `سلام ${userInfo.name} عزیز! چطور میتونم کمکتون کنم؟`;
            setMessages([{ sender: 'bot', text: welcomeText, timestamp: Date.now() }]);
        }
    }, [isOpen, userInfo]);

    const handleToggle = () => {
        if (!isOpen) {
            trackEvent({ category: 'Chatbot', action: 'Open' });
        }
        onToggle();
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !phone || !city || !carOfInterest) {
            setFormError('لطفا تمام فیلدها را پر کنید.');
            return;
        }
        setFormError('');
        const newUserInfo: UserInfo = { name, phone, city, carOfInterest };
        try {
            await onUpdateUserInfo(newUserInfo);
            
            trackEvent({ category: 'Chatbot', action: 'Submit Info' });
            // Fire GTM Lead Generation Event
            trackLeadGeneration(carOfInterest);

            // After successful user info submission, start the chat with a greeting
            setMessages([
                { sender: 'bot', text: `سلام ${name} عزیز! در خصوص خودروی ${carOfInterest} در خدمتم. چه سوالی دارید؟`, timestamp: Date.now() }
            ]);
        } catch (error) {
            setFormError('خطا در ثبت اطلاعات. لطفا دوباره تلاش کنید.');
        }
    };
    
    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const input = form.elements.namedItem('message') as HTMLInputElement;
        const text = input.value.trim();
        if (!text || !userInfo) return;

        trackEvent({ category: 'Chatbot', action: 'Send Message' });

        const newMessage: ChatMessage = { sender: 'user', text, timestamp: Date.now() };
        setMessages(prev => [...prev, newMessage]);
        input.value = '';
        setIsTyping(true);

        try {
            const response = await fetch('https://api.hoseinikhodro.com/webhook/598fae77-5826-4781-8202-74f80e0dc808', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: userInfo.phone, message: text }),
            });
            
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            
            const responseText = await response.text();
            let botReplyText: string;

            try {
                // Attempt to parse the response as JSON
                const data = JSON.parse(responseText);
                botReplyText = data.output || "پاسخی دریافت نشد.";
            } catch (e) {
                // If parsing fails, the response might be plain text (HTML).
                console.warn("Could not parse chat response as JSON. Treating as plain text.", responseText);
                botReplyText = responseText.trim() || "پاسخ نامعتبر از سرور دریافت شد.";
            }

            const botReply: ChatMessage = { sender: 'bot', text: botReplyText, timestamp: Date.now() };
            setMessages(prev => [...prev, botReply]);

        } catch (error) {
            console.error('Chatbot API error:', error);
            const errorReply: ChatMessage = { sender: 'bot', text: 'متاسفانه مشکلی در ارتباط با سرور پیش آمده. لطفا بعدا تلاش کنید.', timestamp: Date.now() };
            setMessages(prev => [...prev, errorReply]);
        } finally {
            setIsTyping(false);
        }
    };
    
    const chatbotUI = (
        <>
            <div className="fixed bottom-20 md:bottom-4 right-4 z-[120]">
                 <button onClick={handleToggle} className="bg-gradient-to-r from-kmc-blue-500 to-kmc-blue-600 text-white w-14 h-14 md:w-16 md:h-16 rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform">
                     {isOpen ? (
                        <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                     ) : (
                        <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                     )}
                </button>
            </div>
            <div className={`fixed bottom-36 md:bottom-24 right-4 w-[calc(100vw-2rem)] sm:w-[350px] h-[60vh] sm:h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col origin-bottom-right z-[120] transition-all duration-300 ease-in-out ${isOpen ? 'opacity-100 translate-y-0 visible' : 'opacity-0 translate-y-4 invisible'}`}>
                {/* Header */}
                <div className="flex items-center justify-between p-4 bg-kmc-dark-grey-700 text-white rounded-t-2xl flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <img src="https://hoseinikhodro.com/wp-content/uploads/sites/150/elementor/thumbs/%DA%A9%D8%AF-%DB%B2%DB%B6%DB%B0%DB%B6-%D8%AD%D8%B3%DB%8C%D9%86%DB%8C-r5bc3861hzh5a9zeiouunil55tzm5gavja54dv3ja4.png" alt="Logo" className="w-10 h-10 rounded-full" />
                        <div>
                            <h3 className="font-bold">مشاور فروش آنلاین</h3>
                            <p className="text-xs opacity-80">نمایندگی حسینی</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-white/20">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>

                {/* Body */}
                {userInfo ? (
                    <>
                        <div className="flex-1 p-4 overflow-y-auto bg-kmc-beige-50">
                            {messages.map((msg, index) => (
                                <div key={index} className={`flex mb-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    {msg.sender === 'user' ? (
                                        <div className="max-w-[80%] p-3 rounded-2xl text-sm break-words bg-kmc-blue-500 text-white rounded-br-none">
                                            {msg.text}
                                        </div>
                                    ) : (
                                        <div 
                                            className="max-w-[80%] p-3 rounded-2xl text-sm break-words bg-kmc-light-grey text-kmc-black rounded-bl-none chat-bubble-bot"
                                            dangerouslySetInnerHTML={{ __html: msg.text }}
                                        />
                                    )}
                                </div>
                            ))}
                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className="p-3 rounded-2xl bg-kmc-light-grey rounded-bl-none">
                                        <div className="flex items-center gap-1">
                                            <span className="w-2 h-2 bg-kmc-mid-grey rounded-full animate-bounce" style={{animationDelay: '0s'}}></span>
                                            <span className="w-2 h-2 bg-kmc-mid-grey rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></span>
                                            <span className="w-2 h-2 bg-kmc-mid-grey rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                        <form onSubmit={handleSendMessage} className="p-4 border-t border-kmc-light-grey flex-shrink-0">
                            <div className="flex items-center gap-2">
                                <input name="message" type="text" placeholder="پیام خود را بنویسید..." className="flex-1 px-4 py-2 border border-kmc-light-grey rounded-full focus:outline-none focus:ring-2 focus:ring-kmc-blue-500" />
                                <button type="submit" className="bg-kmc-blue-500 text-white p-3 rounded-full hover:bg-kmc-blue-600 transition-colors flex-shrink-0">
                                    <svg className="w-5 h-5 -rotate-45" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path></svg>
                                </button>
                            </div>
                        </form>
                    </>
                ) : (
                    <div className="p-6 overflow-y-auto">
                        <h4 className="font-bold text-center mb-1">فرم اطلاعات کاربر</h4>
                        <p className="text-center text-sm text-kmc-mid-grey mb-4">برای شروع گفتگو، لطفا اطلاعات زیر را تکمیل کنید.</p>
                        <form onSubmit={handleFormSubmit} className="space-y-3">
                            <div>
                                <label className="block text-xs font-medium text-kmc-black mb-1">نام و نام خانوادگی</label>
                                <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-3 py-2 border border-kmc-light-grey rounded-lg focus:outline-none focus:ring-2 focus:ring-kmc-blue-500" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-kmc-black mb-1">شماره تماس</label>
                                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required className="w-full px-3 py-2 border border-kmc-light-grey rounded-lg focus:outline-none focus:ring-2 focus:ring-kmc-blue-500" placeholder="09123456789" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-kmc-black mb-1">خودرو انتخابی</label>
                                <select value={carOfInterest} onChange={(e) => setCarOfInterest(e.target.value)} required className="w-full px-3 py-2 border border-kmc-light-grey rounded-lg focus:outline-none focus:ring-2 focus:ring-kmc-blue-500 bg-white">
                                    <option value="" disabled>انتخاب کنید...</option>
                                    {carModels.map(c => <option key={c.CarModel} value={c.CarModel}>{c.CarModel}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-kmc-black mb-1">شهر</label>
                                <input 
                                    list="chatbot-city-options"
                                    type="text" 
                                    value={city} 
                                    onChange={(e) => setCity(e.target.value)} 
                                    required 
                                    className="w-full px-3 py-2 border border-kmc-light-grey rounded-lg focus:outline-none focus:ring-2 focus:ring-kmc-blue-500 bg-white"
                                    placeholder="نام شهر..."
                                />
                                <datalist id="chatbot-city-options">
                                    {cities.map(c => <option key={c} value={c} />)}
                                </datalist>
                            </div>
                            {formError && <p className="text-red-500 text-xs text-center">{formError}</p>}
                            <button type="submit" className="w-full bg-gradient-to-r from-kmc-orange-500 to-kmc-orange-600 text-white py-3 rounded-lg font-medium">
                                شروع گفتگو
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </>
    );

    return createPortal(chatbotUI, document.body);
};

export default React.memo(Chatbot);
