import { Trophy, Compass, Lock } from 'lucide-react';
import { Topic } from '@/data/topics';

// 유틸리티 함수: 클래스 병합
const cn = (...classes: (string | undefined | false | null)[]) => classes.filter(Boolean).join(' ');

interface TopicSidebarProps {
    categories: Record<string, Topic[]>;
    activeTopic: Topic;
    setActiveTopic: (topic: Topic) => void;
    isPro: boolean;
    setIsUpgradeModalOpen: (open: boolean) => void;
    onOpenQuiz: () => void;
    t: any;
}

export default function TopicSidebar({ categories, activeTopic, setActiveTopic, isPro, setIsUpgradeModalOpen, onOpenQuiz, t }: TopicSidebarProps) {
    return (
        <aside className="w-full border-r border-white/5 bg-[#020617]/80 backdrop-blur-xl flex flex-col z-20 shrink-0 h-[30vh] lg:h-full overflow-y-auto custom-scrollbar">
            <div className="p-6 pb-2">
                <h2 className="text-sm font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2 mb-4">
                    <Compass size={16} /> {t.sidebar.explorerTitle}
                </h2>
            </div>

            <div className="px-4 mb-6">
                <button
                    onClick={onOpenQuiz}
                    className="w-full p-4 rounded-2xl bg-gradient-to-br from-indigo-600/20 to-indigo-950/40 border border-indigo-500/30 hover:border-indigo-500/50 transition-all group relative overflow-hidden text-left"
                >
                    <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:scale-110 group-hover:opacity-40 transition-all">
                        <Trophy size={40} className="text-indigo-400" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 text-indigo-400 mb-1">
                            <Trophy size={14} />
                            <span className="text-[10px] font-black uppercase tracking-widest">{t.quiz.dailyTitle}</span>
                        </div>
                        <p className="text-[11px] text-indigo-100 font-bold leading-tight line-clamp-2">
                            {t.quiz.promo}
                        </p>
                    </div>
                </button>
            </div>

            <div className="px-4 space-y-4 pb-6">
                {Object.entries(categories).map(([categoryName, topics]) => {
                    // 카테고리 이름 번역 매핑
                    const translatedCategory =
                        categoryName === "데이터 시각화" ? t.sidebar.categoryData :
                            categoryName === "경제 및 통계" ? t.sidebar.categoryEconomy :
                                categoryName === "문화 및 사회" ? t.sidebar.categoryCulture : categoryName;

                    return (
                        <div key={categoryName}>
                            <h3 className="text-[10px] font-bold text-indigo-400/70 uppercase tracking-widest mb-1.5 px-2">{translatedCategory}</h3>
                            <div className="space-y-1">
                                {topics.map(topic => {
                                    const Icon = topic.icon;
                                    const isLocked = topic.isPremium && !isPro;

                                    const translatedTopic = t.topics ? t.topics[topic.id as keyof typeof t.topics] : null;
                                    const displayLabel = translatedTopic?.label || topic.label;

                                    return (
                                        <button
                                            key={topic.id}
                                            onClick={() => {
                                                if (isLocked) {
                                                    setIsUpgradeModalOpen(true);
                                                } else {
                                                    setActiveTopic(topic);
                                                }
                                            }}
                                            className={cn(
                                                "w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all text-xs font-medium group",
                                                activeTopic.id === topic.id
                                                    ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-inner"
                                                    : "hover:bg-white/5 text-slate-300 border border-transparent"
                                            )}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    "w-7 h-7 rounded-lg flex items-center justify-center",
                                                    activeTopic.id === topic.id ? "bg-indigo-500/30 text-indigo-300" : "bg-white/5 text-slate-400"
                                                )}>
                                                    {Icon && <Icon size={14} />}
                                                </div>
                                                <span className={cn(isLocked && "text-slate-500")}>{displayLabel}</span>
                                            </div>
                                            {isLocked && <Lock size={12} className="text-slate-600 group-hover:text-indigo-400 transition-colors" />}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* FOOTER AREA */}
            <div className="mt-auto p-6 border-t border-white/5 bg-white/[0.02]">
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2 group cursor-pointer">
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600/20 group-hover:text-indigo-400 transition-all">
                            <Compass size={14} />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-white group-hover:text-indigo-300 transition-colors">BitAtlas Explorer</p>
                            <p className="text-[8px] text-slate-500 uppercase tracking-tighter">Premium v1.2</p>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <button className="block text-[10px] text-slate-500 hover:text-white transition-colors">{t.sidebar.terms}</button>
                        <button className="block text-[10px] text-slate-500 hover:text-white transition-colors">{t.sidebar.privacy}</button>
                    </div>

                    <p className="text-[9px] text-slate-600 font-medium">
                        © 2026 BitAtlas Inc.<br />All rights reserved.
                    </p>
                </div>
            </div>
        </aside>
    );
}
