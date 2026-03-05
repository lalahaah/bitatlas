"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, Globe as GlobeIcon } from 'lucide-react';
import { collection, doc, setDoc, onSnapshot, deleteDoc } from 'firebase/firestore';
import { signInAnonymously, onAuthStateChanged, User } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { cn } from '@/lib/utils';

// const appId = process.env.NEXT_PUBLIC_APP_ID || 'bit-atlas-local';
const appId = 'bit-atlas-local'; // 환경변수 없이 로컬 고정 (데모용)
const DEBUG_UID = "local-debug-uid"; // 테스트용 임시 UID

const KLOOK_BASE_AFFILIATE_LINK = "https://tp.media/r?campaign_id=137&marker=707166&p=4110&trs=503396&u=https%3A%2F%2Fwww.klook.com%2Fen-US%2Fsearch%2Fresult%2F%3Fquery%3D";
const FLIGHT_BASE_AFFILIATE_LINK = "https://tp.media/r?campaign_id=100&marker=707166&p=4114&trs=503396&u=https%3A%2F%2Fwww.aviasales.com%2F%3Fdestination_iata%3D";

interface AiDocentChatProps {
    selectedCountry: any;
    activeTopic: any;
    isPro: boolean;
    freeQuestionCount: number;
    setFreeQuestionCount: (count: number | ((prev: number) => number)) => void;
    setIsUpgradeModalOpen: (open: boolean) => void;
    language: string;
    t: any;
    commonT: any;
}

export default function AiDocentChat({
    selectedCountry,
    activeTopic,
    isPro,
    freeQuestionCount,
    setFreeQuestionCount,
    setIsUpgradeModalOpen,
    language,
    t,
    commonT
}: AiDocentChatProps) {
    const [user, setUser] = useState<User | null>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [inputMsg, setInputMsg] = useState("");
    const [isAiTyping, setIsAiTyping] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    // 1. Firebase Auth Initializer
    useEffect(() => {
        if (!auth) return;
        const initAuth = async () => {
            try {
                await signInAnonymously(auth);
            } catch (error) {
                console.error("Auth Error:", error);
            }
        };
        initAuth();

        const unsubscribe = onAuthStateChanged(auth, setUser);
        return () => unsubscribe();
    }, []);

    const uid = user?.uid || DEBUG_UID; // Auth 우회용 (연결되지 않았을 때 대비)

    // 2. Firestore Listener
    useEffect(() => {
        if (!db) return;
        const chatsRef = collection(db, 'artifacts', appId, 'users', uid, 'ai_chats');
        const unsubscribe = onSnapshot(chatsRef, (snapshot) => {
            const msgs: any[] = [];
            snapshot.forEach((doc) => msgs.push({ id: doc.id, ...doc.data() }));
            msgs.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
            setMessages(msgs);
            scrollToBottom();
        });

        return () => unsubscribe();
    }, [uid]);

    const scrollToBottom = () => {
        setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    };

    // 3. Welcome Message on country change (Multilingual)
    useEffect(() => {
        if (!selectedCountry || !db) return;

        const sendWelcomeMessage = async () => {
            const chatsRef = collection(db, 'artifacts', appId, 'users', uid, 'ai_chats');
            const newMsgId = `welcome_${selectedCountry.id}_${Date.now()}`;

            const welcomeText = t.welcome
                .replace("{country}", selectedCountry.name)
                .replace("{topic}", activeTopic.label);

            await setDoc(doc(chatsRef, newMsgId), {
                role: "ai",
                text: welcomeText,
                timestamp: Date.now()
            });
        };

        const clearChat = async () => {
            const chatsRef = collection(db, 'artifacts', appId, 'users', uid, 'ai_chats');
            messages.forEach(async (msg) => {
                try { await deleteDoc(doc(chatsRef, msg.id)); } catch (e) { }
            });
            sendWelcomeMessage();
        };

        if (messages.length > 0) clearChat();
        else sendWelcomeMessage();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedCountry, uid, language]); // language 변경 시에도 웰컴 메시지 갱신

    // 4. API Route Call for Gemini
    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputMsg.trim() || !db) return;

        // 무료버전이고 횟수가 소진된 경우 방어 로직
        if (!isPro && freeQuestionCount <= 0) {
            setIsUpgradeModalOpen(true);
            return;
        }

        const userText = inputMsg;
        setInputMsg("");

        const chatsRef = collection(db, 'artifacts', appId, 'users', uid, 'ai_chats');
        const userMsgId = `user_${Date.now()}`;
        await setDoc(doc(chatsRef, userMsgId), { role: "user", text: userText, timestamp: Date.now() });

        setIsAiTyping(true);
        scrollToBottom();

        // 성공 시 로컬 게이지 차감 (부분 유료화)
        if (!isPro) {
            setFreeQuestionCount(prev => Math.max(0, prev - 1));
        }

        try {
            // 프록시 API 호출 (보안상 Gemini Key 숨김, 언어 정보 추가 전달)
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userText,
                    countryName: selectedCountry.name,
                    topicLabel: activeTopic.label,
                    topicData: selectedCountry.data[activeTopic.id] || commonT.unknown,
                    countryFact: selectedCountry.fact || commonT.noInfo,
                    language // 언어 정보 추가
                })
            });

            if (!res.ok) throw new Error("API call failed");
            const data = await res.json();
            const aiResponseText = data.reply || commonT.error;

            const aiMsgId = `ai_${Date.now()}`;
            await setDoc(doc(chatsRef, aiMsgId), { role: "ai", text: aiResponseText, timestamp: Date.now() });

        } catch (error) {
            console.error("Gemini API Error:", error);
            const errorMsgId = `err_${Date.now()}`;
            await setDoc(doc(chatsRef, errorMsgId), { role: "ai", text: commonT.error, timestamp: Date.now() });
        } finally {
            setIsAiTyping(false);
            scrollToBottom();
        }
    };

    return (
        <aside className="w-full border-l border-white/5 bg-[#020617]/60 backdrop-blur-2xl flex flex-col z-20 shrink-0 h-[50vh] lg:h-full shadow-2xl">
            <div className="p-5 border-b border-white/5 bg-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-500/20 rounded-full flex items-center justify-center border border-indigo-500/30 text-indigo-400">
                        <Bot size={20} />
                    </div>
                    <div>
                        <h2 className="text-sm font-black text-white">{t.title}</h2>
                        <p className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" /> {t.online}
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">

                {/* Affiliate Smart Links (제휴 마케팅) */}
                {selectedCountry && (
                    <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-2">
                        <a
                            href={`${FLIGHT_BASE_AFFILIATE_LINK}${encodeURIComponent(selectedCountry.iataCode || selectedCountry.capitalEn || selectedCountry.nameEn || selectedCountry.name)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            suppressHydrationWarning={true}
                            className="shrink-0 flex items-center gap-2 px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 rounded-full text-indigo-300 text-[10px] font-bold transition-all shadow-lg hover:shadow-indigo-500/20 group"
                        >
                            ✈️ <span className="group-hover:text-white transition-colors">{selectedCountry.name} {t.affiliateFlights}</span>
                        </a>
                        <a href="#" className="shrink-0 flex items-center gap-2 px-4 py-2 bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/20 rounded-full text-pink-300 text-[10px] font-bold transition-all shadow-lg hover:shadow-pink-500/20 group cursor-not-allowed opacity-50">
                            🏨 <span className="group-hover:text-white transition-colors">{t.affiliateHotels}</span>
                        </a>
                        <a
                            href={`${KLOOK_BASE_AFFILIATE_LINK}${encodeURIComponent(selectedCountry.nameEn || selectedCountry.name)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            suppressHydrationWarning={true}
                            className="shrink-0 flex items-center gap-2 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-full text-emerald-400 text-[10px] font-bold transition-all shadow-lg hover:shadow-emerald-500/20 group"
                        >
                            🎫 <span className="group-hover:text-white transition-colors">{t.affiliateActivities}</span>
                        </a>
                    </div>
                )}

                {messages.length === 0 && !isAiTyping && (
                    <div className="h-full flex flex-col items-center justify-center text-slate-600 text-center space-y-3">
                        <GlobeIcon size={32} className="opacity-20" />
                        <p className="text-xs font-bold">{t.emptyState}</p>
                    </div>
                )}

                {messages.map((msg) => (
                    <div key={msg.id} className={cn("flex w-full", msg.role === 'user' ? "justify-end" : "justify-start")}>
                        <div className={cn(
                            "max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed",
                            msg.role === 'user'
                                ? "bg-indigo-600 text-white rounded-tr-sm shadow-lg shadow-indigo-600/10"
                                : "bg-white/10 text-slate-200 rounded-tl-sm border border-white/5"
                        )}>
                            {msg.role === 'ai' && <Bot size={14} className="mb-2 text-indigo-400" />}
                            <p className="whitespace-pre-wrap">{msg.text}</p>
                        </div>
                    </div>
                ))}

                {isAiTyping && (
                    <div className="flex w-full justify-start">
                        <div className="bg-white/10 rounded-2xl rounded-tl-sm p-4 border border-white/5 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>

            <div className="p-4 border-t border-white/5 bg-[#020617] relative">

                {/* Free User Limits Indicator */}
                {!isPro && (
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 w-full max-w-[200px]">
                        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                            <div
                                className={cn("h-full transition-all duration-500", freeQuestionCount > 0 ? "bg-indigo-500" : "bg-rose-500")}
                                style={{ width: `${(freeQuestionCount / 3) * 100}%` }}
                            />
                        </div>
                        <span className="text-[9px] font-bold text-slate-400">
                            {t.freeLimit.replace("{count}", freeQuestionCount.toString())}
                        </span>
                    </div>
                )}

                {!isPro && freeQuestionCount <= 0 ? (
                    <button
                        onClick={() => setIsUpgradeModalOpen(true)}
                        className="w-full relative group overflow-hidden bg-white/5 border border-indigo-500/30 rounded-full py-4 text-sm font-bold text-indigo-300 transition-all hover:bg-indigo-600/20 hover:text-white"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                        {t.upgradePrompt}
                    </button>
                ) : (
                    <form onSubmit={handleSendMessage} className="relative flex items-center mt-2">
                        <input
                            type="text"
                            value={inputMsg}
                            onChange={(e) => setInputMsg(e.target.value)}
                            placeholder={t.placeholder.replace("{country}", selectedCountry.name)}
                            className="w-full bg-white/5 border border-white/10 rounded-full pl-5 pr-12 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-white placeholder:text-slate-500 transition-all"
                            disabled={isAiTyping || (!isPro && freeQuestionCount <= 0)}
                        />
                        <button
                            type="submit"
                            disabled={!inputMsg.trim() || isAiTyping || (!isPro && freeQuestionCount <= 0)}
                            className="absolute right-2 p-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-full transition-colors"
                        >
                            <Send size={16} />
                        </button>
                    </form>
                )}
            </div>
        </aside>
    );
}
