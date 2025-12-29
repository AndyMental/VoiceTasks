"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { TaskWithTags, TaskStatus } from "@/lib/types";
import { TaskItem } from "@/components/task-item";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { TaskDialog } from "@/components/task-dialog";

function TaskPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { toast } = useToast();

    const [tasks, setTasks] = useState<TaskWithTags[]>([]);
    const [loading, setLoading] = useState(true);

    // Filter states
    const statusFilter = searchParams.get("status") || "ALL";
    const searchQuery = searchParams.get("search") || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const order = searchParams.get("order") || "desc";

    const [localSearch, setLocalSearch] = useState(searchQuery);

    useEffect(() => {
        fetchTasks();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [statusFilter, searchQuery, sortBy, order]);

    async function fetchTasks() {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (statusFilter !== "ALL") params.set("status", statusFilter);
            if (searchQuery) params.set("search", searchQuery);
            params.set("sortBy", sortBy);
            params.set("order", order);

            const res = await fetch(`/api/tasks?${params.toString()}`);
            const json = await res.json();
            if (json.success) {
                setTasks(json.data);
            } else {
                toast({ title: "Error", description: json.error, variant: "destructive" });
            }
        } catch (e) {
            toast({ title: "Error", description: "Failed to load tasks", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    }

    function updateParams(key: string, value: string | null) {
        const params = new URLSearchParams(searchParams);
        if (value) params.set(key, value);
        else params.delete(key);
        // For search, default page=1 if we had paging
        router.replace(`${pathname}?${params.toString()}`);
    }

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateParams("search", localSearch || null);
    };

    async function handleToggleStatus(id: string, currentStatus: string) {
        const newStatus = currentStatus === TaskStatus.DONE ? TaskStatus.PENDING : TaskStatus.DONE;

        // Optimistic update
        setTasks(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));

        try {
            const res = await fetch(`/api/tasks/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus })
            });
            const json = await res.json();
            if (!json.success) {
                throw new Error(json.error);
            }
        } catch (e) {
            // Revert on error
            setTasks(prev => prev.map(t => t.id === id ? { ...t, status: currentStatus } : t));
            toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
        }
    }

    async function handleDelete(id: string) {
        try {
            const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete");

            toast({ title: "Deleted", description: "Task deleted successfully" });
            setTasks(prev => prev.filter(t => t.id !== id));
        } catch (e) {
            toast({ title: "Error", description: "Failed to delete task", variant: "destructive" });
        }
    }

    function handleTaskUpdate() {
        fetchTasks(); // Refresh list on edit
    }

    const [createOpen, setCreateOpen] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore if typing in an input or textarea
            if (["INPUT", "TEXTAREA"].includes((e.target as HTMLElement).tagName)) return;

            if (e.key.toLowerCase() === "n") {
                e.preventDefault();
                setCreateOpen(true);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    return (
        <div className="container max-w-4xl mx-auto py-8 space-y-8">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
                    <p className="text-muted-foreground">Manage your daily tasks efficiently.</p>
                </div>
                <div className="flex items-center gap-2">
                    <TaskDialog open={createOpen} onOpenChange={setCreateOpen} onSuccess={handleTaskUpdate}>
                        <Button>New Task</Button>
                    </TaskDialog>
                    <Button variant="outline" onClick={() => router.push("/advanced")}>
                        Advanced (Voice)
                    </Button>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <Tabs value={statusFilter} onValueChange={(v) => updateParams("status", v === "ALL" ? null : v)}>
                    <TabsList>
                        <TabsTrigger value="ALL">All</TabsTrigger>
                        <TabsTrigger value={TaskStatus.PENDING}>Active</TabsTrigger>
                        <TabsTrigger value={TaskStatus.DONE}>Done</TabsTrigger>
                    </TabsList>
                </Tabs>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-64">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search..."
                            className="pl-8"
                            value={localSearch}
                            onChange={(e) => setLocalSearch(e.target.value)}
                        />
                    </form>
                    <Select value={sortBy} onValueChange={(v) => updateParams("sortBy", v)}>
                        <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="createdAt">Created</SelectItem>
                            <SelectItem value="dueDate">Due Date</SelectItem>
                            <SelectItem value="priority">Priority</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="space-y-4">
                {loading ? (
                    <div className="text-center py-20 text-muted-foreground animate-pulse">Loading tasks...</div>
                ) : tasks.length === 0 ? (
                    <div className="text-center py-20 border border-dashed rounded-lg bg-slate-50/50">
                        <p className="text-muted-foreground mb-4">No tasks found.</p>
                        <TaskDialog onSuccess={handleTaskUpdate}>
                            <Button>Create Task</Button>
                        </TaskDialog>
                    </div>
                ) : (
                    tasks.map(task => (
                        <TaskItem
                            key={task.id}
                            task={task}
                            onToggleStatus={handleToggleStatus}
                            onDelete={handleDelete}
                            onUpdate={handleTaskUpdate}
                        />
                    ))
                )}
            </div>
        </div>
    );
}

export default function TaskPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <TaskPageContent />
        </Suspense>
    )
}
