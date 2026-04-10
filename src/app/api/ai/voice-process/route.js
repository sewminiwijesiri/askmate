import { translateText, detectLanguage } from "@/lib/ai/translation";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Conversation from "@/models/Conversation";
import { callGemini } from "@/lib/ai/gemini-client";

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
        const systemPrompt = `
            You are "ASKmate AI", an intelligent academic assistant at SLIIT University.
            Maintain a helpful, encouraging, and highly academic tone.
            If the student uses a mix of Sinhala and English (code-switching), understand it but respond clearly.
            Current Academic Context: Global SLIIT Curriculum.
            
            Question: ${processedQuestion}
        `;

        let englishAnswer = "I'm sorry, I couldn't generate a response.";
        try {
            const { text } = await callGemini({
                contents: [{ parts: [{ text: systemPrompt }] }]
            });
            englishAnswer = text;
        } catch (error) {
            console.error("Hub AI Error:", error.message);
            return NextResponse.json({ error: `Hub AI Error: ${error.message}` }, { status: 502 });
        }


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
