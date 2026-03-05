import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { userText, countryName, topicLabel, topicData, countryFact, language } = await req.json();

        const geminiApiKey = process.env.GEMINI_API_KEY || "";
        if (!geminiApiKey) {
            return NextResponse.json({ reply: "서버에 Gemini API 키가 설정되지 않았습니다." }, { status: 500 });
        }

        // 언어별 시스템 프롬프트 설정
        let systemPrompt = "";
        if (language === 'ko') {
            systemPrompt = `당신은 BitAtlas 플랫폼의 글로벌 AI 도슨트입니다. 
사용자는 현재 국가: '${countryName}'의 주제: '${topicLabel}(${topicData})'에 대해 탐색 중입니다. 
참고 문서: 해당 국가에 대한 흥미로운 사실 - "${countryFact}"
주어진 참고 자료를 자연스럽게 활용하여 친절하고 교육적인 어조로 사용자의 질문에 답해주세요. 
답변은 반드시 한국어로 작성하고, 3문장 이내로 간결하게, 적절한 이모지를 사용해주세요.`;
        } else if (language === 'en') {
            systemPrompt = `You are a Global AI Docent for the BitAtlas platform.
The user is exploring the country: '${countryName}' and topic: '${topicLabel}(${topicData})'.
Reference data (interesting facts): "${countryFact}"
Please answer the user's questions in a friendly, educational, and engaging tone using the provided reference data.
Answer MUST be in English, restricted to 3 sentences, and include appropriate emojis.`;
        } else if (language === 'es') {
            systemPrompt = `Eres un Docente de IA Global para la plataforma BitAtlas.
El usuario está explorando el país: '${countryName}' y el tema: '${topicLabel}(${topicData})'.
Datos de referencia (datos interesantes): "${countryFact}"
Responda a las preguntas del usuario en un tono amable, educativo y atractivo utilizando los datos de referencia proporcionados.
La respuesta DEBE estar en español, limitada a 3 oraciones, e incluir emojis apropiados.`;
        } else {
            // 기본값 (영어)
            systemPrompt = `You are a Global AI Docent for the BitAtlas platform.
The user is exploring the country: '${countryName}' and topic: '${topicLabel}(${topicData})'.
Reference data: "${countryFact}"
Please answer concisely in 3 sentences using appropriate emojis. Use the language the user is speaking.`;
        }

        const payload = {
            contents: [{ parts: [{ text: userText }] }],
            systemInstruction: { parts: [{ text: systemPrompt }] }
        };

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${geminiApiKey}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`Gemini API HTTP Error: ${response.status}`);
        }

        const data = await response.json();
        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "죄송합니다, 답변을 생성할 수 없습니다.";

        return NextResponse.json({ reply });
    } catch (error) {
        console.error('API /chat error:', error);
        return NextResponse.json({ reply: '서버 에러가 발생했습니다.' }, { status: 500 });
    }
}
