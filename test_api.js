const fs = require('fs');
const dotenv = require('dotenv');
dotenv.config({ path: './.env.local' });
dotenv.config({ path: './.env' });

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) { console.error('No API key'); process.exit(1); }

console.log("Using API key starting with: " + apiKey.substring(0, 5));

const prompt = `
TASK: You are an Academic Concierge processing a student's question.
1. Identify the input DATA's primary language (it may be English, Sinhala, or Tamil).
2. Convert/translate the input into professional, academic English and place it in 'enhancedEnglish'.
3. Convert/translate the input into high-quality Sinhala and place it in 'sinhala'.
4. Convert/translate the input into high-quality Tamil and place it in 'tamil'.
5. Use technical academic terms appropriate for Undergraduate level.

DATA:
- Title: "Test"
- Description: "Test"
- Stuck: "N/A"

RESPONSE FORMAT (JSON ONLY):
{
  "enhancedEnglish": { "title": "...", "description": "...", "stuck": "..." },
  "sinhala": { "title": "...", "description": "...", "stuck": "..." },
  "tamil": { "title": "...", "description": "...", "stuck": "..." }
}
`;

const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.2
        }
    })
})
.then(r => r.json())
.then(d => {
    console.log(JSON.stringify(d, null, 2));
})
.catch(console.error);
