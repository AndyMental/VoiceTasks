import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createTaskSchema } from "@/lib/validations/tasks";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { TaskStatus } from "@/lib/types";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const status = searchParams.get("status");
        const search = searchParams.get("search");
        const sortBy = searchParams.get("sortBy") || "createdAt";
        const order = searchParams.get("order") || "desc";

        const where: Prisma.TaskWhereInput = {};

        if (status && status !== "ALL") {
            // Ideally validate against Enum, but for now simple check or cast
            if (Object.values(TaskStatus).includes(status as TaskStatus)) {
                where.status = status as TaskStatus;
            }
        }

        if (search) {
            where.OR = [
                { title: { contains: search } },
                { description: { contains: search } },
            ];
        }

        const tasks = await prisma.task.findMany({
            where,
            include: { tags: true },
            orderBy: {
                [sortBy]: order,
            },
        });

        return NextResponse.json({ success: true, data: tasks });
    } catch (error) {
        console.error("GET /api/tasks error:", error);
        return NextResponse.json(
            { success: false, error: (error as Error).message },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        console.log("POST /api/tasks - Received body:", JSON.stringify(body));
        
        const validatedData = createTaskSchema.parse(body);
        console.log("POST /api/tasks - Validated data:", JSON.stringify(validatedData));

        // Ensure tags is always an array
        const tags = validatedData.tags || [];

        const task = await prisma.task.create({
            data: {
                title: validatedData.title,
                description: validatedData.description || null,
                status: validatedData.status || "PENDING",
                priority: validatedData.priority || "MEDIUM",
                dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : null,
                tags: {
                    connectOrCreate: tags.map((tag) => ({
                        where: { name: tag },
                        create: { name: tag },
                    })),
                },
            },
            include: { tags: true },
        });

        return NextResponse.json({ success: true, data: task }, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            const zodError = error as z.ZodError;
            console.error("POST /api/tasks - Validation error:", zodError.issues);
            return NextResponse.json(
                { success: false, error: zodError.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ') },
                { status: 400 }
            );
        }
        console.error("POST /api/tasks error:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to create task";
        return NextResponse.json(
            { success: false, error: errorMessage },
            { status: 500 }
        );
    }
}

export async function DELETE() {
    try {
        await prisma.task.deleteMany({});
        return NextResponse.json({ success: true, message: "All tasks deleted" });
    } catch (error) {
        console.error("DELETE /api/tasks error:", error);
        return NextResponse.json(
            { success: false, error: (error as Error).message },
            { status: 500 }
        );
    }
}
