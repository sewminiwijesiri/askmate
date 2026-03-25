import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db";
import Module from "@/models/Module";
import ResourceChunk from "@/models/ResourceChunk";
import Resource from "@/models/Resource";
import AiChat from "@/models/AiChat";
import AiMessage from "@/models/AiMessage";
import { systemPrompt } from "@/lib/ai/prompts";
import { isSolutionSeeking, buildIntegrityResponse } from "@/lib/ai/integrity";

async function getAuthUser(req) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
    const token = authHeader.split(" ")[1];
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
}

export async function POST(req) {
  try {
    const user = await getAuthUser(req);
    if (!user || !["student", "helper", "lecturer", "admin"].includes(user.role)) {
      console.log("Unauthorized AI attempt:", user ? `Role: ${user.role}` : "No User");
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { question, selectedModuleId, chatId } = await req.json();

    if (!question) {
      return NextResponse.json(
        { message: "Question is required" },
        { status: 400 }
      );
    }

    await connectDB();

    let moduleId = selectedModuleId;
    let selectedModule = null;

    if (!moduleId) {
      // Inference logic
      const modules = await Module.find({});
      const scoredModules = modules.map((m) => {
        let score = 0;
        const q = question.toLowerCase();
        if (q.includes(m.moduleName.toLowerCase())) score += 10;
        if (q.includes(m.moduleCode.toLowerCase())) score += 15;
        // Simple token overlap
        const words = q.split(/\s+/);
        words.forEach((w) => {
          if (w.length > 3 && (m.moduleName.toLowerCase().includes(w) || m.moduleCode.toLowerCase().includes(w))) {
            score += 2;
          }
        });
        return { module: m, score };
      });

      scoredModules.sort((a, b) => b.score - a.score);
      const topMatch = scoredModules[0];

      if (!topMatch || topMatch.score < 5) {
        return NextResponse.json({
          needsModule: true,
          suggestions: modules.slice(0, 5).map((m) => ({
            _id: m._id,
            name: m.moduleName,
            code: m.moduleCode,
            year: m.year,
            semester: m.semester,
          })),
        });
      }
      moduleId = topMatch.module._id;
      selectedModule = topMatch.module;
    } else {
      selectedModule = await Module.findById(moduleId);
    }

    if (!selectedModule) {
      return NextResponse.json({ message: "Module not found" }, { status: 404 });
    }

    // Integrity Check
    if (isSolutionSeeking(question)) {
      return NextResponse.json({
        answer: buildIntegrityResponse(selectedModule.moduleName),
        module: {
          _id: selectedModule._id,
          name: selectedModule.moduleName,
          code: selectedModule.moduleCode,
        },
        citations: [],
      });
    }

    // Retrieve Context (Phase 1 Keyword Search)
    const chunks = await ResourceChunk.find({
      moduleId: moduleId,
      $text: { $search: question },
    })
      .limit(8)
      .lean();

    // If no text search results, fallback to simple regex
    let contextChunks = chunks;
    if (contextChunks.length === 0) {
      // Extract keywords: words > 3 chars, removing basic punctuation
      const keywords = question.split(/\s+/)
        .map(w => w.replace(/[^\w]/g, '').toLowerCase())
        .filter(w => w.length > 3);
      
      const regexPattern = keywords.length > 0 ? keywords.join("|") : question.split(" ").slice(0, 3).join("|");

      contextChunks = await ResourceChunk.find({
        moduleId: moduleId,
        chunkText: { $regex: regexPattern, $options: "i" },
      })
        .limit(8)
        .lean();
    }

    const contextText = contextChunks
      .map((c) => `[ID: ${c._id}] ${c.chunkText}`)
      .join("\n\n");

    // Fetch Resource Info for Citations
    const resourceIds = [...new Set(contextChunks.map((c) => c.resourceId))];
    const resources = await Resource.find({ _id: { $in: resourceIds } }).lean();
    const resourceMap = resources.reduce((acc, res) => {
      acc[res._id.toString()] = res;
      return acc;
    }, {});

    // Gemini Call
    const geminiPayload = {
      contents: [
        {
          parts: [
            {
              text: `Context from module resources:\n${contextText}\n\nQuestion: ${question}`,
            },
          ],
        },
      ],
      systemInstruction: {
        parts: [
          {
            text: systemPrompt,
          },
        ],
      },
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
      },
    };

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(geminiPayload),
      }
    );

    const aiData = await response.json();
    if (!response.ok) {
      console.error("Gemini Error:", JSON.stringify(aiData, null, 2));
      throw new Error("AI Service Error");
    }

    const aiAnswer = aiData.candidates[0].content.parts[0].text;

    // Citations extraction from context used
    const usedCitations = contextChunks.map((c) => {
      const res = resourceMap[c.resourceId.toString()];
      return {
        resourceId: c.resourceId,
        title: res?.title || "Unknown Resource",
        page: c.metadata?.page,
        slide: c.metadata?.slide,
        section: c.metadata?.section,
      };
    });

    // Deduplicate citations by resourceId
    const uniqueCitations = [];
    const seenIds = new Set();
    usedCitations.forEach((cit) => {
      if (!seenIds.has(cit.resourceId.toString())) {
        uniqueCitations.push(cit);
        seenIds.add(cit.resourceId.toString());
      }
    });

    // Save Chat & Message
    let currentChatId = chatId;
    if (!currentChatId) {
      const newChat = new AiChat({
        userId: user.id,
        moduleId: moduleId,
      });
      await newChat.save();
      currentChatId = newChat._id;
    }

    const studentMsg = new AiMessage({
      chatId: currentChatId,
      role: "student",
      content: question,
    });
    await studentMsg.save();

    const assistantMsg = new AiMessage({
      chatId: currentChatId,
      role: "assistant",
      content: aiAnswer,
      citations: uniqueCitations,
    });
    await assistantMsg.save();

    return NextResponse.json({
      chatId: currentChatId,
      module: {
        _id: selectedModule._id,
        name: selectedModule.moduleName,
        code: selectedModule.moduleCode,
        year: selectedModule.year,
        semester: selectedModule.semester,
      },
      answer: aiAnswer,
      citations: uniqueCitations,
    });
  } catch (error) {
    console.error("AI Assistant Error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
