export async function translateQuestion(title, description, stuck) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("Translation failed: GEMINI_API_KEY is missing.");
        return null;
    }

    try {
        console.log(`Requesting Gemini translation for: "${title.substring(0, 20)}..."`);

        const escapedTitle = title.replace(/"/g, '\\"');
        const escapedDesc = description.replace(/"/g, '\\"');
        const escapedStuck = (stuck || "N/A").replace(/"/g, '\\"');

        const prompt = `
            You are a professional translator for an academic platform.
            Translate the following English academic text into BOTH Sinhala and Tamil.
            Ensure technical terms are translated accurately or kept in English where common (e.g. "Algorithm").
            
            Title: "${escapedTitle}"
            Description: "${escapedDesc}"
            What I've Tried: "${escapedStuck}"

            Response must be a valid JSON object in this EXACT format:
            {
                "sinhala": { "title": "...", "description": "...", "stuck": "..." },
                "tamil": { "title": "...", "description": "...", "stuck": "..." }
            }
            Do not include any extra text. Just the JSON object.
        `;

        const geminiPayload = {
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: 0.1,
                responseMimeType: "application/json"
            }
        };

        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;
        const res = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(geminiPayload)
        });

        const data = await res.json();

        if (!res.ok) {
            console.error("Gemini Translation API Error Status:", res.status);
            console.error("Gemini Translation API Error Details:", JSON.stringify(data, null, 2));
            return null;
        }

        const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!responseText) {
            console.error("Empty response from Gemini translation. Full Data:", JSON.stringify(data, null, 2));
            return null;
        }

        const parsed = JSON.parse(responseText.trim());
        console.log("Received translations from Gemini successfully.");
        return parsed;

    } catch (error) {
        console.error("Gemini Translation Logic Error:", error);
        return null;
    }
}
