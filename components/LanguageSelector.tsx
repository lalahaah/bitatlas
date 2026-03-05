"use client";

import React, { useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Language } from '@/data/translations';

interface LanguageSelectorProps {
    currentLang: Language;
    onLanguageChange: (lang: Language) => void;
}

const LANGUAGES: { code: Language; label: string; flag: string }[] = [
    { code: 'ko', label: '한국어', flag: 'KR' },
    { code: 'en', label: 'English', flag: 'US' },
    { code: 'es', label: 'Español', flag: 'ES' },
];

export default function LanguageSelector({ currentLang, onLanguageChange }: LanguageSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const selectedLang = LANGUAGES.find(l => l.code === currentLang) || LANGUAGES[0];

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full hover:bg-white/10 transition-all group"
            >
                <img
                    src={`https://flagcdn.com/w40/${selectedLang.flag.toLowerCase()}.png`}
                    className="w-4 h-3 object-cover rounded-sm shadow-sm"
                    alt={selectedLang.label}
                />
                <span className="text-[10px] font-bold text-slate-300 group-hover:text-white transition-colors">
                    {selectedLang.code.toUpperCase()}
                </span>
                <ChevronDown size={12} className={cn("text-slate-500 transition-transform", isOpen && "rotate-180")} />
            </button>

            {isOpen && (
                <>
                    {/* Backdrop to close */}
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

                    <div className="absolute right-0 mt-2 w-32 bg-[#0f172a]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-1.5 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-200">
                        {LANGUAGES.map(lang => (
                            <button
                                key={lang.code}
                                onClick={() => {
                                    onLanguageChange(lang.code);
                                    setIsOpen(false);
                                }}
                                className={cn(
                                    "w-full flex items-center justify-between px-3 py-2 rounded-xl text-[10px] font-bold transition-all",
                                    currentLang === lang.code
                                        ? "bg-indigo-600/20 text-indigo-300"
                                        : "hover:bg-white/5 text-slate-400 hover:text-white"
                                )}
                            >
                                <div className="flex items-center gap-2">
                                    <img
                                        src={`https://flagcdn.com/w40/${lang.flag.toLowerCase()}.png`}
                                        className="w-4 h-3 object-cover rounded-sm"
                                        alt=""
                                    />
                                    {lang.label}
                                </div>
                                {currentLang === lang.code && <Check size={10} className="text-indigo-400" />}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
