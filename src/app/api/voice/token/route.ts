import { NextResponse } from "next/server";

export async function GET() {
    const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
    const apiKey = process.env.AZURE_OPENAI_API_KEY;
    const deployment = process.env.AZURE_OPENAI_DEPLOYMENT || "gpt-4o-realtime-preview"; // Default or specific mapping

    if (!endpoint || !apiKey) {
        return NextResponse.json(
            { error: "Azure OpenAI credentials not configured on server" },
            { status: 500 }
        );
    }

    // In a production app, we would fetch a temporary session token here.
    // Azure OpenAI Realtime API currently accesses via wss://<endpoint>/openai/realtime?api-version=...&api-key=...
    // For this prototype, we return the credentials securely to the client which initialized the connection.
    return NextResponse.json({
        endpoint,
        apiKey,
        deployment
    });
}
