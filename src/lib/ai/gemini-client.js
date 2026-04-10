/**
 * Centralized Gemini API Client with Exponential Backoff and Retry Logic
 * Handles Rate Limiting (429) and Service Busy (503) states.
 */

const MAX_RETRIES = 4;
const INITIAL_RETRY_DELAY = 2000; // 2 seconds

// Model selection: Using 1.5-flash as the stable reliable model for free tier
// gemini-2.5-flash-lite seems to have extremely restrictive quotas (20 requests total)
const DEFAULT_MODEL = "gemini-flash-latest"; 

export async function callGemini(payload, options = {}) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY is not configured.");

    const model = options.model || process.env.GEMINI_MODEL || DEFAULT_MODEL;
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    let attempt = 0;
    
    while (attempt <= MAX_RETRIES) {
        try {
            const response = await fetch(apiUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...payload,
                    generationConfig: {
                        temperature: 0.2,
                        ...payload.generationConfig,
                        ...(options.jsonMode ? { responseMimeType: "application/json" } : {})
                    }
                })
            });

            const data = await response.json();

            if (response.ok) {
                const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
                if (!text && !options.allowEmpty) {
                    throw new Error("Gemini returned an empty response (possible safety block).");
                }
                return { text, data };
            }

            // Handle Rate Limiting (429) and Service Busy (503)
            if ([429, 503].includes(response.status) && attempt < MAX_RETRIES) {
                attempt++;
                const delay = INITIAL_RETRY_DELAY * Math.pow(2, attempt - 1);
                console.warn(`Gemini API ${response.status} (Attempt ${attempt}/${MAX_RETRIES}). Retrying in ${delay}ms...`);
                await new Promise(r => setTimeout(r, delay));
                continue;
            }

            // Other errors
            const errMsg = data.error?.message || JSON.stringify(data.error) || "Unknown API Error";
            throw new Error(`AI API Error: ${errMsg}`);

        } catch (error) {
            if (attempt >= MAX_RETRIES) {
                console.error("Gemini API Final Failure:", error.message);
                throw error;
            }
            
            // For network errors or unexpected throwables, retry with backoff
            attempt++;
            const delay = INITIAL_RETRY_DELAY * Math.pow(2, attempt - 1);
            console.warn(`Gemini API Request Failed (${error.message}). Attempt ${attempt}/${MAX_RETRIES}. Retrying in ${delay}ms...`);
            await new Promise(r => setTimeout(r, delay));
        }
    }
}
