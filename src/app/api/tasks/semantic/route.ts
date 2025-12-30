import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth();
        
        if (!userId) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { query } = await req.json();

        if (!query) {
            return NextResponse.json({ success: false, error: "Query is required" }, { status: 400 });
        }

        // Fetch only tasks for the current user
        const tasks = await prisma.task.findMany({
            where: { userId },
            include: { tags: true }
        });

        if (tasks.length === 0) {
            return NextResponse.json({ success: true, data: [] });
        }

        // Prepare prompt for ranking
        const taskContext = tasks.map((t, i) => {
            const tags = t.tags.map(tg => tg.name).join(", ");
            return `${i}: [${t.status}] ${t.title} (Tags: ${tags || "none"}) - ${t.description || "No description"}`;
        }).join("\n");

        const prompt = `
You are a task search assistant. Given a user's natural language query and a list of tasks, find the most relevant tasks.
Return ONLY a JSON array of indices (from the provided list) that are relevant, in order of descending relevance.
Example: [2, 0, 5]

USER QUERY: "${query}"

TASKS:
${taskContext}

JSON ARRAY OF INDICES:`;

        const endpoint = process.env.AZURE_GPT4_1_NANO_ENDPOINT;
        const apiKey = process.env.AZURE_GPT4_1_NANO_API_KEY;
        const apiVersion = process.env.AZURE_GPT4_1_NANO_API_VERSION || "2025-01-01-preview";

        if (!endpoint || !apiKey) {
            // Fallback if LLM is not configured, or if we want to mock it.
            // For now, let's just do a simple filter if no LLM configured.
            const keywords = query.toLowerCase().split(" ");
            const simpleMatches = tasks.filter(t =>
                keywords.some((k: string) => t.title.toLowerCase().includes(k) || (t.description || "").toLowerCase().includes(k))
            );
            return NextResponse.json({ success: true, data: simpleMatches });
        }

        const response = await fetch(`${endpoint}/chat/completions?api-version=${apiVersion}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "api-key": apiKey
            },
            body: JSON.stringify({
                messages: [{ role: "user", content: prompt }],
                temperature: 0,
                max_tokens: 100
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Azure LLM Error:", errorText);
            throw new Error(`LLM call failed: ${response.statusText}`);
        }

        const result = await response.json();
        const content = result.choices[0].message.content.trim();

        // Extract array from possible markdown or text
        const match = content.match(/\[.*\]/);
        if (!match) throw new Error("Could not parse LLM response as JSON array");

        const indices: number[] = JSON.parse(match[0]);
        const rankedTasks = indices.map(i => tasks[i]).filter(Boolean);

        return NextResponse.json({ success: true, data: rankedTasks });

    } catch (error) {
        console.error("Semantic Search Error:", error);
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
    }
}
