import { callGemini } from "./gemini-client";

export async function translateText(text, targetLang = "en") {
    const prompt = `Translate text to ${targetLang === 'en' ? 'English' : targetLang === 'si' ? 'Sinhala' : 'Tamil'}. Text: "${text}" Response: Just translation.`;
    
    try {
        const { text: translatedText } = await callGemini({
            contents: [{ parts: [{ text: prompt }] }]
        });
        return translatedText?.trim() || text;
    } catch (e) { 
        console.error("Translation logic error (translateText):", e.message);
        return text; 
    }
}

export async function translateQuestion(title, description, stuck, enhance = true) {
    const prompt = `
    TASK: You are an Academic Concierge processing a student's question.
    
    1. Identify the input DATA's primary language.
    2. Translate/Convert the input into professional, academic English. 
       CRITICAL: Preserve the student's original meaning, technical details, and specific context exactly. Do not add information they didn't provide.
    3. Translate the input into high-quality Sinhala.
    4. Translate the input into high-quality Tamil.
    
    DATA:
    - Title: "${title}"
    - Description: "${description}"
    - Stuck: "${stuck || "N/A"}"
    
    RESPONSE FORMAT (JSON ONLY):
    {
      "enhancedEnglish": { "title": "...", "description": "...", "stuck": "..." },
      "sinhala": { "title": "...", "description": "...", "stuck": "..." },
      "tamil": { "title": "...", "description": "...", "stuck": "..." }
    }
    `;

    try {
        const { text } = await callGemini({
            contents: [{ parts: [{ text: prompt }] }]
        }, { jsonMode: true });

        if (!text) throw new Error("No content generated");

        try {
            const cleanText = text.replace(/```json/gi, '').replace(/```/g, '').trim();
            return JSON.parse(cleanText);
        } catch (parseError) {
            console.error("JSON Parsing Failed. Raw text:", text);
            throw new Error("AI API Error: Failed to parse generated content");
        }
    } catch (e) {
        console.error("Translation logic error (translateQuestion):", e.message);
        throw e;
    }
}

export async function detectLanguage(text) {
    const prompt = `Detect lang for: "${text}". Only "en", "si", or "ta".`;
    try {
        const { text: lang } = await callGemini({
            contents: [{ parts: [{ text: prompt }] }]
        });
        const detected = lang?.trim().toLowerCase();
        return ["en", "si", "ta"].includes(detected) ? detected : "en";
    } catch (e) { 
        console.error("Language detection error:", e.message);
        return "en"; 
    }
}

