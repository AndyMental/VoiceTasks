"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Mic, MicOff, Activity, ListTodo, Plus, Trash2, CheckCircle2, Clock } from "lucide-react";
import { RealtimeClient } from "@/lib/voice/realtime-client";
import { AudioRecorder } from "@/lib/voice/audio-recorder";
import { AudioPlayer } from "@/lib/voice/audio-player";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { TaskWithTags } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

export default function AdvancedPage() {
    const { toast } = useToast();
    const [isConnected, setIsConnected] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [transcript, setTranscript] = useState<{ role: string, text: string }[]>([]);
    const [assistantResponse, setAssistantResponse] = useState("");
    const [logs, setLogs] = useState<string[]>([]);
    const [tasks, setTasks] = useState<TaskWithTags[]>([]);
    const [history, setHistory] = useState<{ type: 'create' | 'delete', data: any }[]>([]);
    const [isLoadingTasks, setIsLoadingTasks] = useState(false);

    // Refs for persistent instances
    const clientRef = useRef<RealtimeClient | null>(null);
    const recorderRef = useRef<AudioRecorder | null>(null);
    const playerRef = useRef<AudioPlayer | null>(null);
    const transcriptEndRef = useRef<HTMLDivElement>(null);
    const logEndRef = useRef<HTMLDivElement>(null);
    const tasksRef = useRef<TaskWithTags[]>([]);
    const historyRef = useRef<{ type: 'create' | 'delete', data: any }[]>([]);

    // Keep refs in sync with state for use in event handler closures
    useEffect(() => { tasksRef.current = tasks; }, [tasks]);
    useEffect(() => { historyRef.current = history; }, [history]);

    const fetchTasks = useCallback(async () => {
        setIsLoadingTasks(true);
        try {
            const res = await fetch("/api/tasks?sortBy=createdAt&order=desc");
            const data = await res.json();
            if (data.success) {
                setTasks(data.data);
            }
        } catch (error) {
            console.error("Failed to fetch tasks:", error);
        } finally {
            setIsLoadingTasks(false);
        }
    }, []);

    // Scroll to bottom effects
    useEffect(() => {
        transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [transcript, assistantResponse]);

    useEffect(() => {
        logEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [logs]);

    // Initialize client and fetch tasks on mount
    useEffect(() => {
        clientRef.current = new RealtimeClient();
        playerRef.current = new AudioPlayer();
        fetchTasks();

        return () => {
            disconnect();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fetchTasks]);

    function addLog(msg: string) {
        setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 50));
    }

    function addTranscript(role: string, text: string) {
        setTranscript(prev => [...prev, { role, text }]);
    }

    async function connect() {
        if (isConnected) return;

        try {
            addLog("System: Fetching credentials...");
            const res = await fetch("/api/voice/token");
            if (!res.ok) throw new Error("Failed to get credentials");
            const config = await res.json();

            // Gather context for the AI
            const contextMsg = tasks.length > 0
                ? `The user currently has ${tasks.length} tasks. Here is a summary:\n` +
                tasks.map(t => `- [${t.status}] ${t.title} (ID: ${t.id}, Priority: ${t.priority})`).join("\n")
                : "The user currently has no tasks.";

            addLog("System: Connecting to Azure OpenAI Realtime...");
            await clientRef.current?.connect(config, contextMsg);
            setIsConnected(true);
            addLog("System: Connected successfully!");

            // Setup event listeners
            clientRef.current?.on("audio", (data: Int16Array) => {
                playerRef.current?.play(data);
            });

            clientRef.current?.on("transcript.user", (data: any) => {
                addTranscript("user", data.text);
                addLog(`User: ${data.text}`);
                setAssistantResponse(""); // Clear previous assistant response when user speaks
            });

            clientRef.current?.on("transcript.delta", (data: any) => {
                if (data.role === "assistant") {
                    setAssistantResponse(prev => prev + data.delta);
                }
            });

            clientRef.current?.on("response.done", () => {
                setAssistantResponse(current => {
                    if (current) {
                        addTranscript("assistant", current);
                    }
                    return "";
                });
            });

            clientRef.current?.on("functionCall", async (data: any) => {
                addLog(`Action: Bot calling function ${data.name}...`);
                await handleFunctionCall(data);
            });

            clientRef.current?.on("interrupted", () => {
                addLog("System: User interrupted assistant.");
                playerRef.current?.stop();
            });

        } catch (e) {
            addLog(`Error: ${(e as Error).message}`);
            toast({ title: "Connection Failed", description: (e as Error).message, variant: "destructive" });
        }
    }

    async function disconnect() {
        recorderRef.current?.stop();
        setIsRecording(false);
        clientRef.current?.disconnect();
        setIsConnected(false);
        playerRef.current?.reset();
        addLog("System: Disconnected.");
    }

    async function toggleRecording() {
        if (!isConnected) {
            await connect();
        }

        if (isRecording) {
            recorderRef.current?.stop();
            clientRef.current?.commitAudio();
            setIsRecording(false);
            addLog("System: User stopped speaking.");
        } else {
            try {
                recorderRef.current = new AudioRecorder((data) => {
                    clientRef.current?.sendAudio(data);
                });
                await recorderRef.current.start();
                setIsRecording(true);
                addLog("System: Listening...");
            } catch (e) {
                toast({ title: "Mic Error", description: "Could not access microphone", variant: "destructive" });
            }
        }
    }

    async function handleFunctionCall(data: { callId: string, name: string, arguments: string }) {
        try {
            const args = JSON.parse(data.arguments);
            let result = "Success";

            if (data.name === "createTask") {
                addLog(`Tool: Creating task "${args.title}"...`);
                const res = await fetch("/api/tasks", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ...args, status: "PENDING" })
                });
                const json = await res.json();
                if (json.success) {
                    toast({ title: "Voice Action", description: `Created task: ${args.title}` });
                    result = `Created task with ID ${json.data.id}`;
                    fetchTasks(); // Refresh list
                    const newEntry = { type: 'create' as const, data: json.data };
                    historyRef.current = [...historyRef.current.slice(-9), newEntry];
                    setHistory(historyRef.current);
                    addLog(`Tool: Task created successfully.`);
                } else {
                    result = `Error: ${json.error}`;
                    addLog(`Tool Error: ${json.error}`);
                }
            } else if (data.name === "listTasks") {
                addLog("Tool: Fetching task list...");
                const res = await fetch("/api/tasks");
                const json = await res.json();
                if (json.success) {
                    const taskList = json.data.map((t: any) => `ID: ${t.id} - Title: ${t.title} (${t.status})`).join("\n");
                    result = `You have ${json.data.length} tasks:\n${taskList}`;
                    setTasks(json.data);
                    addLog(`Tool: Found ${json.data.length} tasks.`);
                } else {
                    result = `Error: ${json.error}`;
                    addLog(`Tool Error: ${json.error}`);
                }
            } else if (data.name === "deleteAllTasks") {
                addLog("Tool: Deleting all tasks...");
                const res = await fetch("/api/tasks", { method: "DELETE" });
                const json = await res.json();
                if (json.success) {
                    toast({ title: "Voice Action", description: "All tasks deleted" });
                    result = "All tasks have been successfully deleted.";
                    fetchTasks();
                    addLog("Tool: All tasks cleared.");
                } else {
                    result = `Error: ${json.error}`;
                    addLog(`Tool Error: ${json.error}`);
                }
            } else if (data.name === "getTaskDigest") {
                addLog("Tool: Generating task digest...");
                const currentTasks = tasksRef.current;
                const highCount = currentTasks.filter(t => t.priority === "HIGH" && t.status !== "DONE").length;
                const activeCount = currentTasks.filter(t => t.status !== "DONE").length;
                const doneCount = currentTasks.filter(t => t.status === "DONE").length;

                result = `User has ${activeCount} active tasks and ${doneCount} completed tasks. ${highCount} tasks are marked as HIGH priority. What would you like to know more about?`;
                addLog(`Tool: Digest generated.`);
            } else if (data.name === "semanticSearch") {
                addLog(`Tool: Searching for "${args.query}"...`);
                const res = await fetch("/api/tasks/semantic", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ query: args.query })
                });
                const json = await res.json();
                if (json.success) {
                    if (json.data.length === 0) {
                        result = "I couldn't find any tasks matching that description.";
                    } else {
                        const taskList = json.data.map((t: any) => `ID: ${t.id} - Title: ${t.title} (${t.status})`).join("\n");
                        result = `I found ${json.data.length} relevant tasks:\n${taskList}`;
                        addLog(`Tool: Found ${json.data.length} matches.`);
                    }
                } else {
                    result = `Error: ${json.error}`;
                    addLog(`Tool Error: ${json.error}`);
                }
            } else if (data.name === "undo") {
                addLog("Tool: Getting ready to undo...");
                const lastAction = historyRef.current[historyRef.current.length - 1];
                if (!lastAction) {
                    result = "There's nothing to undo.";
                    addLog("Tool Error: History empty.");
                } else {
                    if (lastAction.type === 'create') {
                        addLog(`Tool: Undoing creation of "${lastAction.data.title}"...`);
                        await fetch(`/api/tasks/${lastAction.data.id}`, { method: "DELETE" });
                        result = `Undid creation of "${lastAction.data.title}".`;
                    } else if (lastAction.type === 'delete') {
                        addLog(`Tool: Restoring task "${lastAction.data.title}"...`);
                        // Use POST /api/tasks to restore
                        await fetch("/api/tasks", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                title: lastAction.data.title,
                                description: lastAction.data.description,
                                status: lastAction.data.status,
                                priority: lastAction.data.priority,
                                tags: lastAction.data.tags?.map((t: any) => t.name) || []
                            })
                        });
                        result = `Restored task "${lastAction.data.title}".`;
                    }
                    setHistory(prev => prev.slice(0, -1));
                    fetchTasks();
                    addLog("Tool: Undo complete.");
                }
            } else if (data.name === "deleteTask") {
                addLog(`Tool: Deleting task ID ${args.id}...`);
                const taskToDelete = tasksRef.current.find(t => String(t.id) === String(args.id));
                const res = await fetch(`/api/tasks/${args.id}`, { method: "DELETE" });
                const json = await res.json();
                if (json.success) {
                    if (taskToDelete) {
                        historyRef.current = [...historyRef.current.slice(-9), { type: 'delete', data: taskToDelete }];
                        setHistory(historyRef.current);
                    }
                    toast({ title: "Voice Action", description: "Task deleted" });
                    result = "Task deleted successfully";
                    fetchTasks();
                    addLog("Tool: Task deleted.");
                } else {
                    result = `Error: ${json.error}`;
                    addLog(`Tool Error: ${json.error}`);
                }
            }

            clientRef.current?.sendToolOutput(data.callId, result);

        } catch (e) {
            console.error("Tool Error", e);
            clientRef.current?.sendToolOutput(data.callId, "Error executing tool");
            addLog(`System Error: Tool execution failed`);
        }
    }

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "HIGH": return "bg-red-500/10 text-red-500 hover:bg-red-500/20 shadow-sm transition-all";
            case "MEDIUM": return "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 shadow-sm transition-all";
            case "LOW": return "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 shadow-sm transition-all";
            default: return "bg-slate-500/10 text-slate-500";
        }
    };

    return (
        <div className="h-[calc(100vh-64px)] overflow-hidden bg-slate-50/30">
            <div className="max-w-[1600px] mx-auto h-full p-4 lg:p-6 flex flex-col gap-4 lg:gap-6">
                {/* Header & Control Section */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border shadow-sm">
                    <div className="flex flex-col">
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                            <Activity className="h-6 w-6 text-primary" />
                            Advanced Voice Mode
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {isConnected ? (isRecording ? "Listening to your voice..." : "Voice interaction active. Tap mic to speak.") : "Disconnected. Tap mic to connect and speak."}
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <Button
                            size="lg"
                            className={cn(
                                "h-16 w-16 rounded-full shadow-lg transition-all duration-300 hover:scale-105 active:scale-95",
                                isRecording ? "bg-red-500 hover:bg-red-600 animate-pulse ring-4 ring-red-500/20" : "bg-primary hover:bg-primary/90"
                            )}
                            onClick={toggleRecording}
                        >
                            {isRecording ? <MicOff className="h-8 w-8" /> : <Mic className="h-8 w-8" />}
                        </Button>
                        {isConnected && (
                            <Button variant="outline" onClick={disconnect} className="text-xs h-8 px-2">
                                Reset
                            </Button>
                        )}
                    </div>
                </div>

                {/* Main Content Area - 3 Columns */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 flex-1 min-h-0">
                    {/* Left Column: Tasks (Integrated List) */}
                    <Card className="lg:col-span-4 flex flex-col border shadow-sm overflow-hidden bg-white/50 backdrop-blur-sm">
                        <CardHeader className="py-4 px-5 border-b flex flex-row items-center justify-between bg-slate-50/50">
                            <div className="flex items-center gap-2">
                                <ListTodo className="h-5 w-5 text-primary" />
                                <CardTitle className="text-lg">Live Tasks</CardTitle>
                            </div>
                            <Badge variant="secondary" className="font-mono text-[10px]">{tasks.length} Total</Badge>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-y-auto p-2 space-y-2 scrollbar-none">
                            {isLoadingTasks ? (
                                <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground py-10">
                                    <Clock className="h-6 w-6 animate-spin" />
                                    <span className="text-xs">Syncing tasks...</span>
                                </div>
                            ) : tasks.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground opacity-50 py-10">
                                    <ListTodo className="h-8 w-8" />
                                    <p className="text-sm">No tasks found</p>
                                </div>
                            ) : (
                                tasks.map((task) => (
                                    <div key={task.id} className="p-3 bg-white border border-slate-200 rounded-lg shadow-sm hover:border-primary/30 transition-colors group">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex items-start gap-2 min-w-0">
                                                <div className={cn(
                                                    "mt-1 rounded-full p-0.5",
                                                    task.status === "DONE" ? "text-emerald-500 bg-emerald-50" : "text-slate-300 bg-slate-50"
                                                )}>
                                                    <CheckCircle2 className="h-4 w-4" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className={cn(
                                                        "text-sm font-medium leading-none mb-1 truncate",
                                                        task.status === "DONE" && "line-through text-muted-foreground"
                                                    )}>
                                                        {task.title}
                                                    </p>
                                                    <div className="flex flex-wrap gap-1 mt-1">
                                                        {task.tags?.map((tag) => (
                                                            <Badge key={tag.id} variant="outline" className="text-[9px] h-3.5 px-1 py-0 font-normal">
                                                                #{tag.name}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                    {task.priority !== "MEDIUM" && (
                                                        <Badge variant="outline" className={cn("text-[10px] h-4 px-1 leading-none border-none", getPriorityColor(task.priority))}>
                                                            {task.priority}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>

                    {/* Middle Column: Transcript */}
                    <Card className="lg:col-span-5 flex flex-col border shadow-sm overflow-hidden bg-white/50 backdrop-blur-sm">
                        <CardHeader className="py-4 px-5 border-b bg-slate-50/50">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Activity className="h-5 w-5 text-primary" />
                                Conversation
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30">
                            {transcript.length === 0 && !assistantResponse && (
                                <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground py-10 text-center">
                                    <div className="h-12 w-12 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center">
                                        <Mic className="h-6 w-6 opacity-30" />
                                    </div>
                                    <p className="text-sm max-w-[200px]">Transcript will appear here as you speak.</p>
                                </div>
                            )}
                            {transcript.map((t, i) => (
                                <div key={i} className={cn(
                                    "flex flex-col gap-1 max-w-[85%]",
                                    t.role === "user" ? "ml-auto items-end" : "mr-auto items-start"
                                )}>
                                    <span className="text-[10px] font-bold uppercase tracking-wider opacity-40 px-1">
                                        {t.role === "user" ? "You" : "Assistant"}
                                    </span>
                                    <div className={cn(
                                        "px-4 py-2.5 rounded-2xl text-sm shadow-sm",
                                        t.role === "user"
                                            ? "bg-primary text-primary-foreground rounded-tr-none"
                                            : "bg-white border text-slate-800 rounded-tl-none"
                                    )}>
                                        {t.text}
                                    </div>
                                </div>
                            ))}
                            {assistantResponse && (
                                <div className="flex flex-col gap-1 max-w-[80%] mr-auto items-start">
                                    <span className="text-[10px] font-bold uppercase tracking-wider opacity-40 px-1 animate-pulse">
                                        Assistant is typing...
                                    </span>
                                    <div className="px-4 py-2.5 rounded-2xl rounded-tl-none bg-white border text-slate-800 text-sm shadow-sm">
                                        {assistantResponse}
                                        <span className="inline-block w-2 h-4 bg-primary/40 ml-1 animate-blink" />
                                    </div>
                                </div>
                            )}
                            <div ref={transcriptEndRef} />
                        </CardContent>
                    </Card>

                    {/* Right Column: Logs */}
                    <Card className="lg:col-span-3 flex flex-col border shadow-sm overflow-hidden bg-slate-900 text-slate-300">
                        <CardHeader className="py-4 px-5 border-b border-slate-800">
                            <CardTitle className="text-sm font-mono uppercase tracking-widest text-slate-500">System Logs</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-y-auto p-4 font-mono text-[11px] leading-relaxed">
                            <div className="flex flex-col-reverse gap-2">
                                {logs.length === 0 && <span className="text-slate-600 italic">No logs recorded</span>}
                                {logs.map((log, i) => (
                                    <div key={i} className={cn(
                                        "border-l-2 pl-2",
                                        log.includes("Error") ? "border-red-500 text-red-400" :
                                            log.includes("Tool") ? "border-amber-500 text-amber-300" :
                                                log.includes("Action") ? "border-blue-500 text-blue-300" : "border-slate-700"
                                    )}>
                                        {log}
                                    </div>
                                ))}
                                <div ref={logEndRef} />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
            <style jsx global>{`
                @keyframes blink {
                    0%, 100% { opacity: 0; }
                    50% { opacity: 1; }
                }
                .animate-blink {
                    animation: blink 1s step-end infinite;
                }
                .scrollbar-none::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-none {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
}
