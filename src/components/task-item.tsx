"use client";

import { useState } from "react";
import { TaskWithTags, TaskStatus, TaskPriority } from "@/lib/types";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { CalendarIcon, TagIcon, MoreHorizontal, Pencil, Trash } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { TaskDialog } from "@/components/task-dialog";

interface TaskItemProps {
    task: TaskWithTags;
    onToggleStatus: (id: string, currentStatus: string) => void;
    onDelete: (id: string) => void;
    onUpdate: () => void;
}

export function TaskItem({ task, onToggleStatus, onDelete, onUpdate }: TaskItemProps) {
    const isDone = task.status === TaskStatus.DONE;
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);

    return (
        <>
            <div className="flex items-start space-x-4 p-4 border rounded-lg bg-card text-card-foreground shadow-sm hover:shadow-md transition-all group">
                <Checkbox
                    checked={isDone}
                    onCheckedChange={() => onToggleStatus(task.id, task.status)}
                    className="mt-1"
                />

                <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                        <h3 className={`font-medium leading-none ${isDone ? "line-through text-muted-foreground" : ""}`}>
                            {task.title}
                        </h3>
                        <div className="flex items-center space-x-2">
                            <Badge variant={getPriorityVariant(task.priority)}>
                                {task.priority}
                            </Badge>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="sr-only">Open menu</span>
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => setEditDialogOpen(true)}>
                                        <Pencil className="mr-2 h-4 w-4" /> Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setDeleteDialogOpen(true)} className="text-destructive focus:text-destructive">
                                        <Trash className="mr-2 h-4 w-4" /> Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>

                    {task.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                            {task.description}
                        </p>
                    )}

                    <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-2 pt-1">
                        {task.dueDate && (
                            <div className="flex items-center">
                                <CalendarIcon className="mr-1 h-3 w-3" />
                                {format(new Date(task.dueDate), "MMM d, yyyy")}
                            </div>
                        )}

                        {task.tags.length > 0 && (
                            <div className="flex items-center space-x-2">
                                <TagIcon className="mr-1 h-3 w-3" />
                                <div className="flex space-x-1">
                                    {task.tags.map(tag => (
                                        <span key={tag.id} className="bg-secondary px-1.5 py-0.5 rounded text-[10px] font-medium">
                                            {tag.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the task &quot;{task.title}&quot;.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => onDelete(task.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <TaskDialog
                task={task}
                open={editDialogOpen}
                onOpenChange={setEditDialogOpen}
                onSuccess={onUpdate}
            />
        </>
    );
}

function getPriorityVariant(priority: string): "default" | "secondary" | "destructive" | "outline" {
    switch (priority) {
        case TaskPriority.HIGH: return "destructive";
        case TaskPriority.MEDIUM: return "default";
        case TaskPriority.LOW: return "secondary";
        default: return "outline";
    }
}
