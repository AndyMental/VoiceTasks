import { Task, Tag } from "@prisma/client";

export type TaskWithTags = Task & { tags: Tag[] };

export enum TaskStatus {
    PENDING = "PENDING",
    DONE = "DONE",
}

export enum TaskPriority {
    LOW = "LOW",
    MEDIUM = "MEDIUM",
    HIGH = "HIGH",
}
