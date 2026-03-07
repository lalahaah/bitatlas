"use client";

import React, { useState, useMemo } from 'react';
import { Sparkles, Database, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import TopicSidebar from '@/components/TopicSidebar';
import GlobeEngine from '@/components/GlobeEngine';
import CountrySearchDrawer from '@/components/CountrySearchDrawer';
import AiDocentChat from '@/components/AiDocentChat';
import UpgradeModal from '@/components/UpgradeModal';
import LanguageSelector from '@/components/LanguageSelector';
import DailyQuizModal from '@/components/DailyQuizModal';

import { TOPICS, Topic } from '@/data/topics';
import initialCountriesData from '@/data/countries.json';
import { TRANSLATIONS, Language } from '@/data/translations';

export default function Home() {
  const [activeTopic, setActiveTopic] = useState<Topic>(TOPICS[0]);
  const [selectedCountry, setSelectedCountry] = useState(initialCountriesData[0]);
  const [countriesData] = useState(initialCountriesData);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('All');

  // Freemium State
  const [isPro, setIsPro] = useState(false);
  const [freeQuestionCount, setFreeQuestionCount] = useState(3);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  // i18n State
  const [language, setLanguage] = useState<Language>('ko');
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const t = TRANSLATIONS[language];

  // Resizable Sidebars State (Desktop)
  const [leftWidth, setLeftWidth] = useState(280);
  const [rightWidth, setRightWidth] = useState(380);
  const [isResizingLeft, setIsResizingLeft] = useState(false);
  const [isResizingRight, setIsResizingRight] = useState(false);

  // Mobile State
  const [activeMobilePanel, setActiveMobilePanel] = useState<'main' | 'topics' | 'chat'>('main');
  const [isMounted, setIsMounted] = useState(false);
  const [effectiveLeftWidth, setEffectiveLeftWidth] = useState<string | number>('100%');
  const [effectiveRightWidth, setEffectiveRightWidth] = useState<string | number>('100%');
  const [effectiveGlobeSize, setEffectiveGlobeSize] = useState(800);

  React.useEffect(() => {
    setIsMounted(true);
    const updateSizes = () => {
      const isLarge = window.innerWidth >= 1024;
      setEffectiveLeftWidth(isLarge ? leftWidth : '100%');
      setEffectiveRightWidth(isLarge ? rightWidth : '100%');
      setEffectiveGlobeSize(isLarge ? 800 : 600);
    };
    updateSizes();
    window.addEventListener('resize', updateSizes);
    return () => window.removeEventListener('resize', updateSizes);
  }, [leftWidth, rightWidth]);

  const startResizingLeft = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizingLeft(true);
  };

  const startResizingRight = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizingRight(true);
  };

  const stopResizing = () => {
    setIsResizingLeft(false);
    setIsResizingRight(false);
  };

  const resize = (e: MouseEvent) => {
    if (isResizingLeft) {
      const newWidth = e.clientX;
      if (newWidth > 140 && newWidth < 500) setLeftWidth(newWidth);
    }
    if (isResizingRight) {
      const newWidth = window.innerWidth - e.clientX;
      if (newWidth > 180 && newWidth < 600) setRightWidth(newWidth);
    }
  };

  React.useEffect(() => {
    if (isResizingLeft || isResizingRight) {
      window.addEventListener('mousemove', resize);
      window.addEventListener('mouseup', stopResizing);
    } else {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    }
    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [isResizingLeft, isResizingRight]);

  // 카테고리별 주제 분류 로직 (다국어 지원)
  const categories = useMemo(() => {
    const grouped: Record<string, Topic[]> = {};
    TOPICS.forEach(topic => {
      const translatedTopic = t.topics[topic.id as keyof typeof t.topics];
      const categoryName = translatedTopic?.category || topic.category;
      if (!grouped[categoryName]) grouped[categoryName] = [];
      grouped[categoryName].push(topic);
    });
    return grouped;
  }, [t.topics]);

  // 국가 검색 필터 계산
  const filteredCountries = useMemo(() => {
    return countriesData.filter((c: any) => {
      const nameValues = Object.values(c.name || {}) as string[];
      const matchName = nameValues.some(val =>
        val.toLowerCase().includes(searchQuery.toLowerCase())
      );
      const matchRegion = selectedRegion === 'All' || c.region === selectedRegion;
      return matchName && matchRegion;
    });
  }, [searchQuery, selectedRegion, countriesData]);

  const handleCountrySelect = (country: any) => {
    setSelectedCountry(country);
    setIsSearchOpen(false);

    // GA 이벤트 전송
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', 'select_country', {
        country_name: country.name?.ko || country.name,
        country_id: country.id,
        region: country.region
      });
    }
  };

  const handleRandomCountry = () => {
    const randomIndex = Math.floor(Math.random() * countriesData.length);
    handleCountrySelect(countriesData[randomIndex]);
  };

  const onSelectCountryFromQuiz = (countryId: string) => {
    const country = countriesData.find((c: any) => c.id === countryId);
    if (country) {
      handleCountrySelect(country);
    }
  };

  const localizedSelectedCountry = useMemo(() => {
    if (!selectedCountry) return null;
    const localizedData: Record<string, string> = {};
    Object.entries(selectedCountry.data || {}).forEach(([key, val]: [string, any]) => {
      const langKey = language as keyof typeof val;
      const fallbackKey = 'en' as keyof typeof val;
      localizedData[key] = (val && typeof val === 'object')
        ? ((val as any)[langKey] || (val as any)[fallbackKey] || "")
        : String(val);
    });

    return {
      ...selectedCountry,
      nameEn: (selectedCountry.name && typeof selectedCountry.name === 'object')
        ? ((selectedCountry.name as any)['en'] || selectedCountry.name)
        : selectedCountry.name,
      capitalEn: (selectedCountry.data?.capital && typeof selectedCountry.data.capital === 'object')
        ? ((selectedCountry.data.capital as any)['en'] || selectedCountry.data.capital)
        : selectedCountry.data?.capital,
      name: (selectedCountry.name && typeof selectedCountry.name === 'object')
        ? ((selectedCountry.name as any)[language] || (selectedCountry.name as any)['en'])
        : selectedCountry.name,
      iataCode: selectedCountry.iata,
      data: localizedData,
      fact: (selectedCountry.fact && typeof selectedCountry.fact === 'object')
        ? ((selectedCountry.fact as any)[language] || (selectedCountry.fact as any)['en'])
        : selectedCountry.fact
    };
  }, [selectedCountry, language]);

  const localizedActiveTopic = useMemo(() => {
    const tTopic = t.topics[activeTopic.id as keyof typeof t.topics];
    return {
      ...activeTopic,
      label: tTopic?.label || activeTopic.label,
      question: tTopic?.question || activeTopic.question
    };
  }, [activeTopic, t.topics]);

  return (
    <div className="h-screen w-full bg-[#020617] text-slate-100 font-sans overflow-hidden flex flex-col selection:bg-indigo-500/30">

      {/* HEADER */}
      <header className="h-16 lg:h-20 border-b border-white/5 bg-[#020617]/80 backdrop-blur-md flex items-center justify-between px-4 lg:px-8 z-50 shrink-0">
        <div className="flex items-center gap-4">
          <img src="/logo.svg" alt="BitAtlas Logo" className="h-7 md:h-9 w-auto drop-shadow-[0_0_15px_rgba(79,70,229,0.5)]" />
        </div>
        <div className="flex items-center gap-2 lg:gap-4 font-bold">
          <LanguageSelector currentLang={language} onLanguageChange={setLanguage} />
          {!isPro ? (
            <button
              onClick={() => setIsUpgradeModalOpen(true)}
              className="inline-flex items-center gap-2 text-[9px] md:text-[10px] text-amber-400 bg-amber-500/10 px-2.5 lg:px-4 py-1.5 lg:py-2 rounded-full border border-amber-500/20 hover:bg-amber-500/20 transition-all shadow-lg"
            >
              <Sparkles size={12} className="text-amber-400" />
              <span className="hidden xs:inline">{t.header.upgrade}</span>
            </button>
          ) : (
            <div className="inline-flex items-center gap-2 text-[9px] md:text-[10px] text-indigo-400 bg-indigo-500/10 px-3 lg:px-5 py-2 lg:py-2.5 rounded-full border border-indigo-500/20 shadow-inner">
              <Sparkles size={12} className="text-indigo-400" />
              <span>PRO</span>
            </div>
          )}
          <div className="hidden xs:flex items-center gap-2 text-[9px] md:text-[10px] text-emerald-400 bg-emerald-500/10 px-3 lg:px-5 py-2 lg:py-2.5 rounded-full border border-emerald-500/20">
            <Database size={12} /> {t.header.syncOn}
          </div>
        </div>
      </header>

      {/* WORKSPACE AREA */}
      <div className="flex-1 flex relative overflow-hidden">

        {/* LEFT SIDEBAR (Topics) */}
        <div
          className={cn(
            "fixed inset-0 z-40 lg:relative lg:inset-auto lg:z-auto transition-transform duration-300 pointer-events-auto",
            activeMobilePanel === 'topics' ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          )}
          style={{ width: effectiveLeftWidth }}
        >
          <TopicSidebar
            categories={categories}
            activeTopic={activeTopic}
            setActiveTopic={(t) => {
              setActiveTopic(t);
              if (window.innerWidth < 1024) setActiveMobilePanel('main');
            }}
            isPro={isPro}
            setIsUpgradeModalOpen={setIsUpgradeModalOpen}
            onOpenQuiz={() => setIsQuizModalOpen(true)}
            t={t}
          />
          {/* Resize Handle (Left) */}
          <div
            onMouseDown={startResizingLeft}
            className="hidden lg:block absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-indigo-500/50 transition-colors z-30"
          />
        </div>

        {/* MAIN AREA (Globe) */}
        <main
          className={cn(
            "flex-1 relative bg-[radial-gradient(circle_at_center,rgba(79,70,229,0.08)_0%,transparent_100%)] flex flex-col transition-all duration-300",
            activeMobilePanel !== 'main' && "hidden lg:flex"
          )}
        >
          <div className="absolute inset-0 z-10">
            <GlobeEngine
              size={effectiveGlobeSize}
              activeTopicId={activeTopic.id}
              selectedCountry={selectedCountry}
              countriesData={countriesData.map((c: any) => {
                const localizedData: Record<string, string> = {};
                Object.entries(c.data || {}).forEach(([key, val]: [string, any]) => {
                  const langKey = language as keyof typeof val;
                  const fallbackKey = 'en' as keyof typeof val;
                  localizedData[key] = (val && typeof val === 'object')
                    ? ((val as any)[langKey] || (val as any)[fallbackKey] || "")
                    : String(val);
                });
                return {
                  ...c,
                  name: (c.name && typeof c.name === 'object')
                    ? ((c.name as any)[language] || (c.name as any)['en'])
                    : c.name,
                  data: localizedData
                };
              })}
            />
          </div>

          {/* Active Question Overlay */}
          <div className="absolute top-6 lg:top-8 left-1/2 -translate-x-1/2 z-30 text-center pointer-events-none w-full px-4">
            <div className="inline-flex items-center gap-2 px-3 lg:px-4 py-1.5 lg:py-2 bg-indigo-500/10 backdrop-blur-md border border-indigo-500/30 rounded-full text-indigo-300 text-[10px] font-bold mb-2 shadow-lg">
              {t.common.currentQuestion}
            </div>
            <h1 className="text-lg lg:text-3xl font-black text-white tracking-tight drop-shadow-2xl px-2">
              "{localizedActiveTopic.question}"
            </h1>
          </div>

          <CountrySearchDrawer
            isSearchOpen={isSearchOpen}
            setIsSearchOpen={setIsSearchOpen}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedRegion={selectedRegion}
            setSelectedRegion={setSelectedRegion}
            filteredCountries={filteredCountries.map((c: any) => ({
              ...c,
              name: c.name[language] || c.name['en'] || c.name
            }))}
            setSelectedCountry={(c) => {
              handleCountrySelect(c);
            }}
            handleRandomCountry={handleRandomCountry}
            selectedCountry={localizedSelectedCountry}
            activeTopic={localizedActiveTopic}
            language={language}
            t={t.search}
            commonT={t.common}
          />
        </main>

        {/* RIGHT SIDEBAR (AI Chat) */}
        <div
          className={cn(
            "fixed inset-0 z-40 lg:relative lg:inset-auto lg:z-auto transition-transform duration-300 pointer-events-auto",
            activeMobilePanel === 'chat' ? "translate-x-0" : "translate-x-full lg:translate-x-0"
          )}
          style={{ width: effectiveRightWidth }}
        >
          {/* Resize Handle (Right) */}
          <div
            onMouseDown={startResizingRight}
            className="hidden lg:block absolute top-0 left-0 w-1 h-full cursor-col-resize hover:bg-indigo-500/50 transition-colors z-30"
          />
          <AiDocentChat
            selectedCountry={localizedSelectedCountry}
            activeTopic={localizedActiveTopic}
            isPro={isPro}
            freeQuestionCount={freeQuestionCount}
            setFreeQuestionCount={setFreeQuestionCount}
            setIsUpgradeModalOpen={setIsUpgradeModalOpen}
            language={language}
            t={t.chat}
            commonT={t.common}
          />
        </div>

        {/* MOBILE NAVIGATION BAR */}
        <nav className="lg:hidden absolute bottom-0 left-0 w-full h-16 bg-[#020617]/95 border-t border-white/5 backdrop-blur-xl z-[60] flex items-center justify-around px-6">
          <button
            onClick={() => setActiveMobilePanel('topics')}
            className={cn("flex flex-col items-center gap-1 transition-colors", activeMobilePanel === 'topics' ? "text-indigo-400" : "text-slate-500")}
          >
            <Database size={20} />
            <span className="text-[10px] font-bold uppercase tracking-wider">{t.sidebar.explorerTitle.split(' ')[0]}</span>
          </button>

          <button
            onClick={() => setActiveMobilePanel('main')}
            className={cn("flex flex-col items-center gap-1 transition-colors", activeMobilePanel === 'main' ? "text-indigo-400" : "text-slate-500")}
          >
            <Sparkles size={20} />
            <span className="text-[10px] font-bold uppercase tracking-wider">GLOBE</span>
          </button>

          <button
            onClick={() => setActiveMobilePanel('chat')}
            className={cn("flex flex-col items-center gap-1 transition-colors", activeMobilePanel === 'chat' ? "text-indigo-400" : "text-slate-500")}
          >
            <Loader2 size={20} className={isResizingRight ? "animate-spin" : ""} />
            <span className="text-[10px] font-bold uppercase tracking-wider">{t.chat.title.split(' ')[0]}</span>
          </button>
        </nav>

      </div>

      {/* MODALS */}
      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        onUpgrade={() => setIsPro(true)}
        t={t.upgrade}
      />

      <DailyQuizModal
        isOpen={isQuizModalOpen}
        onClose={() => setIsQuizModalOpen(false)}
        language={language}
        onSelectCountry={onSelectCountryFromQuiz}
        t={t}
      />
    </div>
  );
}
