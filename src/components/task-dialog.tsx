"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { TaskStatus, TaskPriority, TaskWithTags } from "@/lib/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const formSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    priority: z.nativeEnum(TaskPriority),
    dueDate: z.string().optional(),
    tags: z.string().optional(),
});

interface TaskDialogProps {
    task?: TaskWithTags;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    onSuccess?: () => void;
    children?: React.ReactNode;
}

export function TaskDialog({ task, open, onOpenChange, onSuccess, children }: TaskDialogProps) {
    const { toast } = useToast();
    const [internalOpen, setInternalOpen] = useState(false);

    // Determine effective open state and handler
    const isControlled = open !== undefined;
    const isOpen = isControlled ? open : internalOpen;
    const setIsOpen = isControlled ? onOpenChange! : setInternalOpen;

    const isEdit = !!task;

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            description: "",
            priority: TaskPriority.MEDIUM,
            tags: "",
        },
    });

    // Reset form when task changes or dialog opens
    useEffect(() => {
        if (isOpen) {
            form.reset({
                title: task?.title || "",
                description: task?.description || "",
                priority: (task?.priority as TaskPriority) || TaskPriority.MEDIUM,
                dueDate: task?.dueDate ? format(new Date(task.dueDate), "yyyy-MM-dd") : "",
                tags: task?.tags ? task.tags.map(t => t.name).join(", ") : "",
            });
        }
    }, [task, isOpen, form]);

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            const tagsArray = values.tags ? values.tags.split(",").map(t => t.trim()).filter(Boolean) : [];

            const payload = {
                ...values,
                tags: tagsArray,
                dueDate: values.dueDate ? new Date(values.dueDate).toISOString() : null,
            };

            const url = isEdit ? `/api/tasks/${task.id}` : "/api/tasks";
            const method = isEdit ? "PATCH" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const json = await res.json();

            if (!json.success) {
                throw new Error(json.error || "Operation failed");
            }

            toast({ title: "Success", description: `Task ${isEdit ? "updated" : "created"} successfully` });
            if (!isEdit) form.reset();
            setIsOpen(false);
            onSuccess?.();

        } catch (error) {
            toast({ title: "Error", description: (error as Error).message, variant: "destructive" });
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            {children && <DialogTrigger asChild>{children}</DialogTrigger>}
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{isEdit ? "Edit Task" : "Create New Task"}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Title</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Buy groceries" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Optional details..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="priority"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Priority</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select priority" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value={TaskPriority.LOW}>Low</SelectItem>
                                                <SelectItem value={TaskPriority.MEDIUM}>Medium</SelectItem>
                                                <SelectItem value={TaskPriority.HIGH}>High</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="dueDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Due Date</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <FormField
                            control={form.control}
                            name="tags"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tags (comma separated)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="work, urgent" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="flex justify-end pt-4 space-x-2">
                            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                            <Button type="submit">{isEdit ? "Save Changes" : "Create Task"}</Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
