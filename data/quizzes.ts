export interface QuizQuestion {
    id: string;
    question: {
        ko: string;
        en: string;
        es: string;
    };
    options: {
        id: string;
        text: {
            ko: string;
            en: string;
            es: string;
        };
    }[];
    correctOptionId: string;
    countryId: string; // Correct answer country
    explanation: {
        ko: string;
        en: string;
        es: string;
    };
}

export const DAILY_QUIZZES: QuizQuestion[] = [
    {
        id: "q1",
        question: {
            ko: "이 나라는 '사자들의 도시'라는 의미의 산스크리트어에서 유래했으며, 머리는 사자고 몸은 물고기인 '머라이언'이 상징입니다. 어디일까요?",
            en: "This country's name originates from a Sanskrit word meaning 'Lion City', and its symbol is the 'Merlion', a mythical creature with a lion's head and a fish's body. Where is it?",
            es: "El nombre de este país proviene de una palabra sánscrita que significa 'Ciudad de los Leones', y su símbolo es el 'Merlion', una criatura mítica con cabeza de león y cuerpo de pez. ¿Dónde está?"
        },
        options: [
            { id: "a", text: { ko: "홍콩", en: "Hong Kong", es: "Hong Kong" } },
            { id: "b", text: { ko: "싱가포르", en: "Singapore", es: "Singapur" } },
            { id: "c", text: { ko: "말레이시아", en: "Malaysia", es: "Malasia" } },
            { id: "d", text: { ko: "태국", en: "Thailand", es: "Tailandia" } }
        ],
        correctOptionId: "b",
        countryId: "singapore",
        explanation: {
            ko: "싱가포르는 산스크리트어 'Simhapura(심하푸라)'에서 유래되었으며, 이는 '사자의 도시'를 뜻합니다.",
            en: "Singapore originates from the Sanskrit 'Simhapura', which means 'Lion City'.",
            es: "Singapur proviene del sánscrito 'Simhapura', que significa 'Ciudad del León'."
        }
    }
];
