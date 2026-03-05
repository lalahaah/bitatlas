import { MapPin, MessageCircle, Camera, Utensils, Swords, PawPrint, Sparkles, Music, DollarSign, Users, Banknote, Shield, FileDown } from 'lucide-react';
import React from 'react';

export type TopicId = 'capital' | 'greeting' | 'landmark' | 'dish' | 'martial_art' | 'animal' | 'flower' | 'anthem' | 'gdp' | 'population' | 'exchange_rate' | 'safety' | 'export_csv';

export interface Topic {
    id: TopicId;
    category: string;
    label: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    question: string;
    isPremium?: boolean;
}

export const TOPICS: Topic[] = [
    { id: 'capital', category: 'Basics', label: 'Capital', icon: MapPin, question: '' },
    { id: 'greeting', category: 'Basics', label: 'Greeting', icon: MessageCircle, question: '' },

    { id: 'landmark', category: 'Travel', label: 'Landmark', icon: Camera, question: '' },
    { id: 'dish', category: 'Life', label: 'Dish', icon: Utensils, question: '' },
    { id: 'martial_art', category: 'Life', label: 'Martial Art', icon: Swords, question: '' },

    { id: 'animal', category: 'Symbols', label: 'Animal', icon: PawPrint, question: '' },
    { id: 'flower', category: 'Symbols', label: 'Flower', icon: Sparkles, question: '' },
    { id: 'anthem', category: 'Symbols', label: 'Anthem', icon: Music, question: '' },

    { id: 'gdp', category: 'Economy', label: 'GDP', icon: DollarSign, question: '', isPremium: true },
    { id: 'population', category: 'Economy', label: 'Population', icon: Users, question: '', isPremium: true },
    { id: 'exchange_rate', category: 'Economy', label: 'Rates', icon: Banknote, question: '', isPremium: true },

    { id: 'safety', category: 'Life', label: 'Safety', icon: Shield, question: '', isPremium: true },

    { id: 'export_csv', category: 'Utility', label: 'CSV', icon: FileDown, question: '', isPremium: true },
];
