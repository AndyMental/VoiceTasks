import { v4 as uuidv4 } from "uuid";

type EventHandler = (data: any) => void;

interface Config {
    endpoint: string;
    apiKey: string;
    deployment: string;
}

export class RealtimeClient {
    private ws: WebSocket | null = null;
    private config: Config | null = null;
    private context: string = "";
    private listeners: Record<string, EventHandler[]> = {};

    constructor() { }

    async connect(config: Config, context?: string) {
        this.config = config;
        this.context = context || "";
        // Convert https:// to wss:// for WebSocket connection
        const wsEndpoint = config.endpoint.replace(/^https:\/\//i, 'wss://');
        const url = `${wsEndpoint}/openai/realtime?api-version=2024-10-01-preview&deployment=${config.deployment}&api-key=${config.apiKey}`;

        // Note: In production, use a token instead of api-key in URL
        this.ws = new WebSocket(url);

        return new Promise<void>((resolve, reject) => {
            if (!this.ws) return reject("WebSocket creation failed");

            this.ws.onopen = () => {
                console.log("Connected to Azure OpenAI Realtime");
                this.sendSessionUpdate();
                resolve();
            };

            this.ws.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    this.handleMessage(message);
                } catch (e) {
                    console.error("Error parsing message:", e);
                }
            };

            this.ws.onerror = (error) => {
                console.error("WebSocket Error:", error);
                reject(error);
            };

            this.ws.onclose = () => {
                console.log("Connection closed");
                this.emit("close", {});
            };
        });
    }

    private sendSessionUpdate() {
        if (!this.ws) return;

        // Initial session config
        const event = {
            type: "session.update",
            session: {
                modalities: ["audio", "text"],
                instructions: `You are a helpful task assistant. You can manage tasks (create, delete, list, deleteAllTasks). Keep responses concise.

URGENT: I have provided the CURRENT state of the user's tasks in the CONTEXT section below. 
Do NOT call 'listTasks' immediately if the information you need is already in the context. 
If the user asks to delete EVERYTHING or ALL tasks, use the 'deleteAllTasks' tool for efficiency.

TAGGING: When creating tasks, try to categorize them using tags if appropriate (e.g., "grocery", "work", "urgent", "personal").

CURRENT CONTEXT:
${this.context}`,
                voice: "alloy",
                input_audio_format: "pcm16",
                output_audio_format: "pcm16",
                input_audio_transcription: {
                    model: "whisper-1"
                },
                turn_detection: {
                    type: "server_vad",
                    threshold: 0.5,
                    prefix_padding_ms: 300,
                    silence_duration_ms: 300
                },
                tools: [
                    {
                        type: "function",
                        name: "createTask",
                        description: "Create a new task",
                        parameters: {
                            type: "object",
                            properties: {
                                title: { type: "string" },
                                priority: { type: "string", enum: ["LOW", "MEDIUM", "HIGH"] },
                                description: { type: "string" },
                                tags: {
                                    type: "array",
                                    items: { type: "string" },
                                    description: "Optional tags for categorization (e.g., ['work', 'urgent'])"
                                }
                            },
                            required: ["title"]
                        }
                    },
                    {
                        type: "function",
                        name: "deleteTask",
                        description: "Delete a task by ID",
                        parameters: {
                            type: "object",
                            properties: {
                                id: { type: "string" }
                            },
                            required: ["id"]
                        }
                    },
                    {
                        type: "function",
                        name: "listTasks",
                        description: "List all tasks. IMPORTANT: Always use this tool first to find the unique task IDs if you need to delete or update specific tasks. Tell the user the IDs if they ask.",
                        parameters: {
                            type: "object",
                            properties: {},
                        }
                    },
                    {
                        type: "function",
                        name: "undo",
                        description: "Undo the last action (like creating or deleting a task). Use this when the user says 'undo that', 'wait stop', or 'revert'.",
                        parameters: {
                            type: "object",
                            properties: {},
                        }
                    },
                    {
                        type: "function",
                        name: "getTaskDigest",
                        description: "Get a smart summary of the user's current workload, priorities, and any urgent items. Use this when the user asks 'how's my day looking?' or 'give me a summary'.",
                        parameters: {
                            type: "object",
                            properties: {},
                        }
                    },
                    {
                        type: "function",
                        name: "semanticSearch",
                        description: "Find tasks using natural language or fuzzy queries. Useful when the user doesn't remember the exact title (e.g., 'find that task about groceries' or 'where is the thing about milk?').",
                        parameters: {
                            type: "object",
                            properties: {
                                query: { type: "string" }
                            },
                            required: ["query"]
                        }
                    },
                    {
                        type: "function",
                        name: "deleteAllTasks",
                        description: "Delete ALL tasks from the database at once. Use this when the user wants to start from scratch or clear everything.",
                        parameters: {
                            type: "object",
                            properties: {},
                        }
                    }
                ]
            }
        };
        this.ws.send(JSON.stringify(event));
    }

    sendAudio(pcm16: Int16Array) {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

        // Convert Int16Array to Base64
        const buffer = pcm16.buffer;
        let binary = '';
        const bytes = new Uint8Array(buffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        const base64Audio = btoa(binary);

        this.ws.send(JSON.stringify({
            type: "input_audio_buffer.append",
            audio: base64Audio
        }));
    }

    commitAudio() {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
        this.ws.send(JSON.stringify({ type: "input_audio_buffer.commit" }));
        this.ws.send(JSON.stringify({ type: "response.create" }));
    }

    sendToolOutput(callId: string, output: string) {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

        this.ws.send(JSON.stringify({
            type: "conversation.item.create",
            item: {
                type: "function_call_output",
                call_id: callId,
                output: output
            }
        }));

        // Trigger response after tool output
        this.ws.send(JSON.stringify({ type: "response.create" }));
    }

    private handleMessage(message: any) {
        switch (message.type) {
            case "response.audio.delta":
                if (message.delta) {
                    // Decode Base64 to Int16
                    const binaryString = atob(message.delta);
                    const bytes = new Uint8Array(binaryString.length);
                    for (let i = 0; i < binaryString.length; i++) {
                        bytes[i] = binaryString.charCodeAt(i);
                    }
                    const pcm16 = new Int16Array(bytes.buffer);
                    this.emit("audio", pcm16);
                }
                break;
            case "response.function_call_arguments.done":
                // Note: Ideally we wait for response.done or item.created, but this works for stream
                // Actually, Realtime API sends `response.function_call_arguments.delta` and then `done`?
                // No, usage is typically: `response.output_item.done` containing the full call.
                break;
            case "response.output_item.done":
                const item = message.item;
                if (item.type === "function_call") {
                    this.emit("functionCall", {
                        callId: item.call_id,
                        name: item.name,
                        arguments: item.arguments
                    });
                }
                break;
            case "response.audio_transcript.delta":
                this.emit("transcript.delta", { delta: message.delta, role: "assistant" });
                break;
            case "conversation.item.input_audio_transcription.completed":
                this.emit("transcript.user", { text: message.transcript });
                break;
            case "response.done":
                this.emit("response.done", {});
                break;
            case "input_audio_buffer.speech_started":
                this.emit("interrupted", message);
                break;
            case "error":
                console.error("Realtime Error:", message);
                break;
        }
    }

    on(event: string, handler: EventHandler) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(handler);
    }

    off(event: string, handler: EventHandler) {
        if (!this.listeners[event]) return;
        this.listeners[event] = this.listeners[event].filter(h => h !== handler);
    }

    private emit(event: string, data: any) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(h => h(data));
        }
    }

    disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }
}
