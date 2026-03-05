"use client";

import React, { useState } from 'react';
import { X, Trophy, ArrowRight, Plane, Sparkles } from 'lucide-react';
import { DAILY_QUIZZES } from '@/data/quizzes';
import { cn } from '@/lib/utils';

interface DailyQuizModalProps {
    isOpen: boolean;
    onClose: () => void;
    language: string;
    onSelectCountry: (countryId: string) => void;
    t: any;
}

export default function DailyQuizModal({ isOpen, onClose, language, onSelectCountry, t }: DailyQuizModalProps) {
    const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
    const [isSubmitted, setIsSubmitted] = useState(false);

    // For demo, just use the first quiz
    const quiz = DAILY_QUIZZES[0];
    const lang = (language === 'ko' || language === 'en' || language === 'es') ? language : 'en';

    if (!isOpen) return null;

    const handleSubmit = () => {
        if (selectedOptionId) {
            setIsSubmitted(true);
        }
    };

    const isCorrect = selectedOptionId === quiz.correctOptionId;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="relative w-full max-w-lg bg-[#020617]/90 border border-indigo-500/20 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-indigo-500/10 flex flex-col max-h-[90vh]">

                {/* Header Decoration */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />

                <div className="p-8 flex flex-col h-full">
                    {/* Top Row */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="bg-indigo-600/20 p-2 rounded-xl border border-indigo-500/30">
                                <Trophy className="text-indigo-400" size={20} />
                            </div>
                            <span className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">{t.quiz.dailyTitle || "오늘의 퀴즈"}</span>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-slate-500 transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                        {/* Question Section */}
                        <div className="mb-8">
                            <h2 className="text-xl md:text-2xl font-black text-white leading-tight">
                                {quiz.question[lang]}
                            </h2>
                        </div>

                        {/* Options Section */}
                        {!isSubmitted ? (
                            <div className="space-y-3">
                                {quiz.options.map((option) => (
                                    <button
                                        key={option.id}
                                        onClick={() => setSelectedOptionId(option.id)}
                                        className={cn(
                                            "w-full text-left px-6 py-5 rounded-2xl border transition-all duration-200 group relative overflow-hidden",
                                            selectedOptionId === option.id
                                                ? "bg-indigo-600/20 border-indigo-500 text-indigo-300"
                                                : "bg-white/5 border-white/5 text-slate-300 hover:bg-white/10 hover:border-white/10"
                                        )}
                                    >
                                        <div className="flex items-center justify-between relative z-10">
                                            <span className="font-bold">{option.text[lang]}</span>
                                            {selectedOptionId === option.id && <ArrowRight size={18} />}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                                {/* Result Feedback */}
                                <div className={cn(
                                    "p-6 rounded-3xl border flex flex-col items-center text-center",
                                    isCorrect ? "bg-emerald-500/10 border-emerald-500/20" : "bg-rose-500/10 border-rose-500/20"
                                )}>
                                    <div className={cn(
                                        "w-16 h-16 rounded-full flex items-center justify-center mb-4 border-2 shadow-lg",
                                        isCorrect ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400" : "bg-rose-500/20 border-rose-500/40 text-rose-400"
                                    )}>
                                        {isCorrect ? <Trophy size={32} /> : <X size={32} />}
                                    </div>
                                    <h3 className={cn("text-2xl font-black mb-2", isCorrect ? "text-emerald-400" : "text-rose-400")}>
                                        {isCorrect ? (t.quiz.correct || "정답입니다!") : (t.quiz.incorrect || "아쉬워요!")}
                                    </h3>
                                    <p className="text-slate-300 text-sm leading-relaxed mb-4">
                                        {quiz.explanation[lang]}
                                    </p>

                                    {/* Action Buttons (Correct Answer Only) */}
                                    {isCorrect && (
                                        <div className="w-full flex flex-col gap-3 mt-4">
                                            <button
                                                onClick={() => {
                                                    onSelectCountry(quiz.countryId);
                                                    onClose();
                                                }}
                                                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 group"
                                            >
                                                <Sparkles size={18} />
                                                <span>{t.quiz.explore || "이 나라 더 알아보기"}</span>
                                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                            </button>
                                            <button
                                                className="w-full bg-white/5 hover:bg-white/10 text-emerald-400 font-bold py-4 rounded-2xl border border-white/10 transition-all flex items-center justify-center gap-2"
                                            >
                                                <Plane size={18} />
                                                <span>{t.quiz.tour || "여행 상품 보기"}</span>
                                            </button>
                                        </div>
                                    )}

                                    {!isCorrect && (
                                        <button
                                            onClick={() => {
                                                setIsSubmitted(false);
                                                setSelectedOptionId(null);
                                            }}
                                            className="text-slate-500 text-xs font-bold underline decoration-dotted underline-offset-4 hover:text-slate-300 transition-colors"
                                        >
                                            {t.quiz.retry || "다시 시도하기"}
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer for non-submitted state */}
                    {!isSubmitted && (
                        <div className="mt-8">
                            <button
                                disabled={!selectedOptionId}
                                onClick={handleSubmit}
                                className={cn(
                                    "w-full py-5 rounded-2xl font-black text-lg transition-all duration-300 shadow-xl",
                                    selectedOptionId
                                        ? "bg-indigo-600 text-white shadow-indigo-600/30 hover:scale-[1.02]"
                                        : "bg-slate-800 text-slate-500 cursor-not-allowed opacity-50"
                                )}
                            >
                                {t.quiz.submit || "답변 제출하기"}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
