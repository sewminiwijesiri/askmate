import { translateText, detectLanguage } from "@/lib/ai/translation";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Conversation from "@/models/Conversation";

/**
 * Interaction Hub API Route
 * Chains: Detection -> Internal Translation -> LLM Reasoning -> Target Translation -> Persistence
 */
export async function POST(req) {
    try {
        await dbConnect();
        const { transcript, moduleId, userId, targetLocale } = await req.json();

        if (!transcript) return NextResponse.json({ error: "No input provided" }, { status: 400 });

        // 1. Ingestion & Detection
        const detectedLang = await detectLanguage(transcript);

        // 2. Internal Translation (to English for LLM reasoning)
        let processedQuestion = transcript;
        if (detectedLang !== "en") {
            processedQuestion = await translateText(transcript, "en");
        }

        // 3. AI-Based Answer Generation (Gemini 2.5 Flash)
        const apiKey = process.env.GEMINI_API_KEY;
        const systemPrompt = `
            You are "ASKmate AI", an intelligent academic assistant at SLIIT University.
            Maintain a helpful, encouraging, and highly academic tone.
            If the student uses a mix of Sinhala and English (code-switching), understand it but respond clearly.
            Current Academic Context: Global SLIIT Curriculum.
            
            Question: ${processedQuestion}
        `;

        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`;
        const aiRes = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: systemPrompt }] }] })
        });

        if (!aiRes.ok) {
            const err = await aiRes.json();
            const errMsg = err.error?.message || JSON.stringify(err);
            console.error("Hub AI Error:", errMsg);
            return NextResponse.json({ error: `Hub AI Error: ${errMsg}` }, { status: 502 });
        }

        const aiData = await aiRes.json();
        const englishAnswer = aiData.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I couldn't generate a response.";

        // 4. Target Translation (Back to student's comfortable language)
        const targetShortCode = targetLocale === 'si-LK' ? 'si' : targetLocale === 'ta-LK' ? 'ta' : 'en';
        let translatedAnswer = englishAnswer;
        if (targetShortCode !== 'en') {
            translatedAnswer = await translateText(englishAnswer, targetShortCode);
        }

        // 5. Persistence
        const newConversation = await Conversation.create({
            userId,
            moduleId,
            locale: targetLocale,
            question: {
                original: transcript,
                translated: detectedLang !== "en" ? processedQuestion : null,
                language: detectedLang
            },
            answer: {
                original: englishAnswer,
                translated: targetShortCode !== 'en' ? translatedAnswer : null
            }
        });

        // 6. Return Response
        return NextResponse.json({
            id: newConversation._id,
            sourceText: transcript,
            targetText: translatedAnswer,
            englishVersion: englishAnswer,
            translatedQuestion: processedQuestion,
            detectedLang
        });

    } catch (error) {
        console.error("Hub API Error:", error);
        return NextResponse.json({ error: "Intelligent Hub failed to process." }, { status: 500 });
    }
}
