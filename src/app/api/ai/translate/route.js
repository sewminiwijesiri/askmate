import { translateQuestion } from "@/lib/ai/translation";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const { title, description, stuck } = await req.json();

        if (!title || !description) {
            return NextResponse.json({ error: "Title and description are required for translation." }, { status: 400 });
        }

        console.log("On-demand translation request received for:", title.substring(0, 30));
        
        const translations = await translateQuestion(title, description, stuck || "");

        if (!translations) {
            return NextResponse.json({ error: "Translation failed. Check API key and configuration." }, { status: 502 });
        }

        return NextResponse.json(translations);
    } catch (error) {
        console.error("Translation API Error:", error);
        return NextResponse.json({ error: "Failed to process translation request." }, { status: 500 });
    }
}
