export async function translateText(text, targetLang = "en") {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY not found");
    const prompt = `Translate text to ${targetLang === 'en' ? 'English' : targetLang === 'si' ? 'Sinhala' : 'Tamil'}. Text: "${text}" Response: Just translation.`;
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`;
    try {
        const res = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }) });
        
        if (!res.ok) {
            const err = await res.json();
            console.error("Translate Text Error:", err);
            return text;
        }

        const data = await res.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || text;
    } catch (e) { return text; }
}

export async function translateQuestion(title, description, stuck, enhance = true) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return null;

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

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`;
    try {
        const res = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    responseMimeType: "application/json",
                    temperature: 0.2
                }
            })
        });

        if (!res.ok) {
            const err = await res.json();
            const errMsg = err.error?.message || JSON.stringify(err);
            console.error("Advanced Translate API Error:", errMsg);
            throw new Error(`AI API Error: ${errMsg}`);
        }

        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (!text) {
             console.error("Advanced Translate Error - No Text Component. Full API Response:", JSON.stringify(data, null, 2));
             throw new Error("AI API Error: No content generated (possible safety block)");
        }

        try {
            const cleanText = text.replace(/```json/gi, '').replace(/```/g, '').trim();
            return JSON.parse(cleanText);
        } catch (parseError) {
            console.error("Advanced Translate Error - JSON Parsing Failed. Raw text was:", text);
            throw new Error("AI API Error: Failed to parse generated content");
        }
    } catch (e) {
        console.error("Advanced Translate Error:", e.message);
        throw e;
    }
}

export async function detectLanguage(text) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return "en";
    const prompt = `Detect lang for: "${text}". Only "en", "si", or "ta".`;
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`;
    try {
        const res = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }) });
        if (!res.ok) return "en";
        const data = await res.json();
        const lang = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim().toLowerCase();
        return ["en", "si", "ta"].includes(lang) ? lang : "en";
    } catch (e) { return "en"; }
}
