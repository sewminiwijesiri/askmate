import { translateQuestion } from "@/lib/ai/translation";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const { title, description, stuck, enhance } = await req.json();

        if (!title || !description) {
            return NextResponse.json({ error: "Title and description are required for translation." }, { status: 400 });
        }

        console.log(`On-demand advanced translation request for: "${title.substring(0, 30)}..." (Enhance: ${enhance})`);
        
        const translations = await translateQuestion(title, description, stuck || "", enhance);

        if (!translations) {
            return NextResponse.json({ 
                error: "Translation service failed. Check your API configuration, quota, or if the content is being blocked by safety filters." 
            }, { status: 502 });
        }

        return NextResponse.json(translations);
    } catch (error) {
        console.error("Translation API Route Error:", error);
        return NextResponse.json({ error: `Internal server error during translation: ${error.message}` }, { status: 500 });
    }
}
