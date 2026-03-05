import React from 'react';
import { X, CheckCircle2, Sparkles, Infinity, KeyRound, Download } from 'lucide-react';

interface UpgradeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpgrade: () => void;
    t: any;
}

export default function UpgradeModal({ isOpen, onClose, onUpgrade, t }: UpgradeModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop Layer */}
            <div
                className="absolute inset-0 bg-[#020617]/80 backdrop-blur-md transition-opacity"
                onClick={onClose}
            />

            {/* Modal Card */}
            <div className="relative w-full max-w-md bg-gradient-to-b from-[#0f172a] to-[#020617] border border-indigo-500/30 rounded-3xl p-8 shadow-2xl shadow-indigo-900/50 animate-in zoom-in-95 duration-200">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                >
                    <X size={20} />
                </button>

                {/* Header */}
                <div className="flex flex-col items-center text-center space-y-4 mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 mb-2">
                        <Sparkles size={32} className="text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-white tracking-tight">{t.title}</h2>
                        <p className="text-sm font-medium text-indigo-300 mt-1">{t.subtitle}</p>
                    </div>
                    <div className="flex items-baseline gap-1 bg-white/5 py-2 px-6 rounded-full border border-white/10">
                        <span className="text-2xl font-black text-white">{t.price}</span>
                        <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">{t.priceUnit}</span>
                    </div>
                </div>

                {/* Benefits List */}
                <div className="space-y-4 mb-8">
                    <div className="flex items-start gap-3">
                        <CheckCircle2 size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-bold text-slate-200 flex items-center gap-1.5"><Infinity size={14} className="text-indigo-400" /> {t.benefit1Title}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">{t.benefit1Sub}</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <CheckCircle2 size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-bold text-slate-200 flex items-center gap-1.5"><KeyRound size={14} className="text-amber-400" /> {t.benefit2Title}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">{t.benefit2Sub}</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3 opacity-60">
                        <CheckCircle2 size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-bold text-slate-200 flex items-center gap-1.5"><Download size={14} className="text-slate-400" /> {t.benefit3Title}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">{t.benefit3Sub}</p>
                        </div>
                    </div>
                </div>

                {/* Call to Action */}
                <button
                    onClick={() => {
                        onUpgrade();
                        onClose();
                    }}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-black text-sm shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:scale-[1.02] transition-all"
                >
                    {t.button}
                </button>
                <p className="text-center text-[9px] text-slate-500 mt-4">
                    {t.demoNote}
                </p>
            </div>
        </div>
    );
}
