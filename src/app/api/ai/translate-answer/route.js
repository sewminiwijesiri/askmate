import { NextResponse } from "next/server";
import { callGemini } from "@/lib/ai/gemini-client";

export async function POST(req) {
    try {
        const { content, concept, hints, examples, targetLang } = await req.json();

        if (!content && !concept) {
            return NextResponse.json({ error: "Content or concept is required." }, { status: 400 });
        }

        const langName = targetLang === "sinhala" ? "Sinhala" : "Tamil";

        const prompt = `
TASK: Translate the following academic answer/guidance into ${langName}. 
Maintain technical terms where appropriate. Produce professional, academic-quality translations.

INPUT DATA:
- Main Content: "${content || ""}"
- Core Concept: "${concept || ""}"
- Hints: ${JSON.stringify(hints || [])}
- Examples: ${JSON.stringify(examples || [])}

RESPONSE FORMAT (JSON ONLY, no markdown):
{
  "content": "translated main content in ${langName}",
  "concept": "translated concept in ${langName}",
  "hints": ["translated hint 1", "translated hint 2"],
  "examples": ["translated example 1", "translated example 2"]
}

Rules:
- If a field is empty or N/A, return empty string or empty array.
- Keep code snippets, URLs, and technical identifiers unchanged.
- Produce ONLY the JSON object, nothing else.
`;

        let text;
        try {
            const result = await callGemini({
                contents: [{ parts: [{ text: prompt }] }]
            }, { jsonMode: true });
            text = result.text;
        } catch (error) {
            console.error("Answer Translation API Error:", error.message);
            return NextResponse.json({ error: `AI API Error: ${error.message}` }, { status: 502 });
        }

        if (!text) {
            return NextResponse.json({ error: "Translation returned empty response." }, { status: 502 });
        }


        try {
            const cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();
            const parsed = JSON.parse(cleaned);
            return NextResponse.json(parsed);
        } catch (parseError) {
            console.error("Answer Translation Parse Error:", text);
            return NextResponse.json({ error: "Failed to parse translation." }, { status: 502 });
        }
    } catch (error) {
        console.error("Answer Translation Route Error:", error);
        return NextResponse.json({ error: `Translation failed: ${error.message}` }, { status: 500 });
    }
}
