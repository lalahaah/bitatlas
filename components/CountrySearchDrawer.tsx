import React, { useState, useEffect } from 'react';
import { Search, X, Globe as GlobeIcon, Dices, RotateCw, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

const KLOOK_BASE_AFFILIATE_LINK = "https://tp.media/r?campaign_id=137&marker=707166&p=4110&trs=503396&u=https%3A%2F%2Fwww.klook.com%2Fen-US%2Fsearch%2Fresult%2F%3Fquery%3D";
const FLIGHT_BASE_AFFILIATE_LINK = "https://tp.media/r?campaign_id=100&marker=707166&p=4114&trs=503396&u=https%3A%2F%2Fwww.aviasales.com%2F%3Fdestination_iata%3D";

interface CountrySearchDrawerProps {
    isSearchOpen: boolean;
    setIsSearchOpen: (open: boolean) => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    selectedRegion: string;
    setSelectedRegion: (region: string) => void;
    filteredCountries: any[];
    setSelectedCountry: (country: any) => void;
    handleRandomCountry: () => void;
    selectedCountry?: any;
    activeTopic?: any;
    language: string;
    t: any;
    commonT: any;
}

export default function CountrySearchDrawer({
    isSearchOpen,
    setIsSearchOpen,
    searchQuery,
    setSearchQuery,
    selectedRegion,
    setSelectedRegion,
    filteredCountries,
    setSelectedCountry,
    handleRandomCountry,
    selectedCountry,
    activeTopic,
    language,
    t,
    commonT
}: CountrySearchDrawerProps) {
    const [isFlipped, setIsFlipped] = useState(false);

    // 검색 모달이 닫히면 항상 앞면(검색 목록)으로 초기화
    useEffect(() => {
        if (!isSearchOpen) {
            setIsFlipped(false);
        }
    }, [isSearchOpen]);

    return (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center w-[90%] md:w-auto">

            {/* Expanded Search Drawer (Flip Container) */}
            {isSearchOpen && (
                <div className="mb-4 w-full md:w-[480px] h-[400px] relative animate-in slide-in-from-bottom-8 duration-300 z-50" style={{ perspective: "1500px" }}>

                    <div
                        className="w-full h-full relative transition-transform duration-700 ease-in-out"
                        style={{ transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateY(-180deg)' : 'rotateY(0deg)' }}
                    >
                        {/* Front (Search Box & List) */}
                        <div
                            className={cn(
                                "absolute inset-0 bg-[#020617]/95 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-5 flex flex-col shadow-2xl shadow-black transition-opacity duration-300",
                                isFlipped ? "opacity-0 pointer-events-none" : "opacity-100 pointer-events-auto"
                            )}
                            style={{ backfaceVisibility: 'hidden', transform: 'translateZ(1px)' }}
                        >
                            {/* Search Header */}
                            <div className="relative mb-4 shrink-0">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder={t.placeholder}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-white placeholder:text-slate-600 transition-all"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    autoFocus
                                />
                                <button onClick={() => setIsSearchOpen(false)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-white/10 rounded-full text-slate-400 transition-colors">
                                    <X size={14} />
                                </button>
                            </div>

                            {/* Region Filters */}
                            <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-2 mb-2 shrink-0">
                                {['All', 'Asia', 'Europe', 'Americas', 'Africa', 'Oceania'].map(region => {
                                    const translatedRegion =
                                        region === 'All' ? t.filterAll :
                                            region === 'Asia' ? (language === 'ko' ? '아시아' : 'Asia') :
                                                region === 'Europe' ? (language === 'ko' ? '유럽' : language === 'es' ? 'Europa' : 'Europe') :
                                                    region === 'Americas' ? (language === 'ko' ? '아메리카' : language === 'es' ? 'América' : 'Americas') :
                                                        region === 'Africa' ? (language === 'ko' ? '아프리카' : language === 'es' ? 'África' : 'Africa') :
                                                            region === 'Oceania' ? (language === 'ko' ? '오세아니아' : language === 'es' ? 'Oceanía' : 'Oceania') : region;

                                    return (
                                        <button
                                            key={region}
                                            onClick={() => setSelectedRegion(region)}
                                            className={cn(
                                                "px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-colors",
                                                selectedRegion === region ? "bg-indigo-600 text-white" : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
                                            )}
                                        >
                                            {translatedRegion}
                                        </button>
                                    )
                                })}
                            </div>

                            {/* Country List - Fixed scroll issue: overscroll-contain and pointer-events assurance */}
                            <div
                                className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-1 overscroll-contain"
                                onWheel={(e) => {
                                    e.stopPropagation();
                                }}
                            >
                                {filteredCountries.length > 0 ? (
                                    filteredCountries.map(country => {
                                        const translatedRegion =
                                            country.region === 'Asia' ? (language === 'ko' ? '아시아' : 'Asia') :
                                                country.region === 'Europe' ? (language === 'ko' ? '유럽' : language === 'es' ? 'Europa' : 'Europe') :
                                                    country.region === 'Americas' ? (language === 'ko' ? '아메리카' : language === 'es' ? 'América' : 'Americas') :
                                                        country.region === 'Africa' ? (language === 'ko' ? '아프리카' : language === 'es' ? 'África' : 'Africa') :
                                                            country.region === 'Oceania' ? (language === 'ko' ? '오세아니아' : language === 'es' ? 'Oceanía' : 'Oceania') : country.region;

                                        return (
                                            <button
                                                key={country.id}
                                                onClick={() => {
                                                    setSelectedCountry(country);
                                                    setIsFlipped(true); // 플립 애니메이션 시작
                                                }}
                                                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors group"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <img src={`https://flagcdn.com/w40/${country.flag.toLowerCase()}.png`} className="w-6 h-4 rounded-sm object-cover" alt="" />
                                                    <span className="font-bold text-sm text-slate-200 group-hover:text-white">{country.name}</span>
                                                </div>
                                                <span className="text-[10px] text-slate-600 uppercase tracking-widest font-bold bg-white/5 px-2 py-0.5 rounded">{translatedRegion}</span>
                                            </button>
                                        )
                                    })
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-slate-600">
                                        <GlobeIcon size={32} className="opacity-20 mb-2" />
                                        <p className="text-xs">{t.noResults}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Back (Country Detail Info) */}
                        <div
                            className={cn(
                                "absolute inset-0 bg-gradient-to-br from-[#020617] to-indigo-950/40 backdrop-blur-3xl border border-indigo-500/20 rounded-[2rem] p-6 flex flex-col shadow-2xl shadow-indigo-900/20",
                                !isFlipped ? "opacity-0 pointer-events-none" : "opacity-100 pointer-events-auto"
                            )}
                            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg) translateZ(1px)' }}
                        >
                            {selectedCountry && (
                                <div className="flex flex-col h-full">
                                    {/* Header: Back & Close Buttons */}
                                    <div className="flex items-center justify-between mb-4">
                                        <button
                                            onClick={() => setIsFlipped(false)}
                                            className="flex items-center gap-2 text-xs font-bold text-indigo-400 hover:text-white transition-colors"
                                        >
                                            <RotateCw size={14} className="-scale-x-100" /> {t.back}
                                        </button>
                                        <button
                                            onClick={() => setIsSearchOpen(false)}
                                            className="p-1 hover:bg-white/10 rounded-full text-slate-400 transition-colors"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>

                                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-5">
                                        {/* Country Title Profile */}
                                        <div className="flex flex-col items-center justify-center text-center space-y-3 pb-4 border-b border-indigo-500/10">
                                            <img
                                                src={`https://flagcdn.com/w160/${selectedCountry.flag.toLowerCase()}.png`}
                                                className="w-24 h-16 rounded-lg object-cover shadow-lg border border-white/10"
                                                alt={selectedCountry.name}
                                            />
                                            <div>
                                                <h2 className="text-2xl font-black text-white tracking-tight">{selectedCountry.name}</h2>
                                                <p className="text-xs text-slate-400 uppercase tracking-widest">{selectedCountry.nativeName} · {selectedCountry.region}</p>
                                            </div>
                                        </div>

                                        {/* Active Topic Card */}
                                        {activeTopic && (
                                            <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-2xl p-4">
                                                <div className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider mb-2 flex justify-between items-center">
                                                    <span>{t.currentTopic}</span>
                                                    <span className="px-2 py-0.5 bg-indigo-500/20 rounded text-indigo-300">{activeTopic.label}</span>
                                                </div>
                                                <p className="text-sm text-indigo-50 leading-relaxed font-medium">
                                                    {selectedCountry.data?.[activeTopic.id] || commonT.noInfo}
                                                </p>
                                            </div>
                                        )}

                                        {/* Additional Basic Info */}
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                                                <div className="text-[10px] text-slate-500 mb-1">{t.capital}</div>
                                                <div className="text-xs font-bold text-slate-200">{selectedCountry.data?.capital || "-"}</div>
                                            </div>
                                            <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                                                <div className="text-[10px] text-slate-500 mb-1">{t.greeting}</div>
                                                <div className="text-xs font-bold text-slate-200">{selectedCountry.data?.greeting || "-"}</div>
                                            </div>
                                        </div>

                                        {/* Interesting Fact */}
                                        {selectedCountry.fact && (
                                            <div className="bg-white/5 rounded-xl p-4 border border-white/5 mt-auto">
                                                <div className="text-[10px] text-emerald-400 font-bold mb-2 flex items-center gap-2">
                                                    <Sparkles size={12} /> {t.factTitle}
                                                </div>
                                                <p className="text-xs text-slate-300 leading-relaxed italic">
                                                    "{selectedCountry.fact}"
                                                </p>
                                            </div>
                                        )}

                                        {/* Affiliate Smart Links (제휴 마케팅) */}
                                        <div className="flex gap-2 overflow-x-auto custom-scrollbar pt-2 pb-2">
                                            <a
                                                href={`${FLIGHT_BASE_AFFILIATE_LINK}${encodeURIComponent(selectedCountry.iataCode || selectedCountry.capitalEn || selectedCountry.nameEn || selectedCountry.name)}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                suppressHydrationWarning={true}
                                                className="shrink-0 flex items-center gap-2 px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 rounded-full text-indigo-300 text-[10px] font-bold transition-all shadow-lg hover:shadow-indigo-500/20 group"
                                            >
                                                ✈️ <span className="group-hover:text-white transition-colors">{selectedCountry.name} {commonT.affiliateFlights || (language === 'ko' ? '항공권 특가' : language === 'en' ? 'Hot Flights' : 'Ofertas Vuelos')}</span>
                                            </a>
                                            <a href="#" className="shrink-0 flex items-center gap-2 px-4 py-2 bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/20 rounded-full text-pink-300 text-[10px] font-bold transition-all shadow-lg hover:shadow-pink-500/20 group cursor-not-allowed opacity-50">
                                                🏨 <span className="group-hover:text-white transition-colors">{(language === 'ko' ? '인기 숙소 최저가' : language === 'en' ? 'Best Hotels' : 'Mejores Hoteles')}</span>
                                            </a>
                                            <a
                                                href={`${KLOOK_BASE_AFFILIATE_LINK}${encodeURIComponent(selectedCountry.nameEn || selectedCountry.name)}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                suppressHydrationWarning={true}
                                                className="shrink-0 flex items-center gap-2 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-full text-emerald-400 text-[10px] font-bold transition-all shadow-lg hover:shadow-emerald-500/20 group"
                                            >
                                                🎫 <span className="group-hover:text-white transition-colors">{(language === 'ko' ? '투어 & 액티비티' : language === 'en' ? 'Tours & Activities' : 'Tours y Actividades')}</span>
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Floating Trigger Bar */}
            <div className={cn(
                "flex items-center p-1.5 bg-[#020617]/80 backdrop-blur-2xl border border-white/10 rounded-full shadow-2xl transition-all duration-300",
                isSearchOpen ? "opacity-0 translate-y-4 pointer-events-none" : "opacity-100 translate-y-0"
            )}>
                <button
                    onClick={() => setIsSearchOpen(true)}
                    className="flex items-center gap-2 px-6 py-3 rounded-full hover:bg-white/5 text-slate-300 transition-colors"
                >
                    <Search size={16} className="text-indigo-400" />
                    <span className="text-sm font-bold">{t.triggerSearch}</span>
                </button>
                <div className="w-px h-6 bg-white/10 mx-1" />
                <button
                    onClick={handleRandomCountry}
                    className="flex items-center gap-2 px-6 py-3 rounded-full hover:bg-indigo-600/20 text-indigo-400 hover:text-indigo-300 transition-colors group"
                >
                    <Dices size={16} className="group-hover:rotate-12 transition-transform" />
                    <span className="text-sm font-bold">{t.triggerRandom}</span>
                </button>
            </div>
        </div>
    );
}
