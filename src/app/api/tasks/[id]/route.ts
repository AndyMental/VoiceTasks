import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { updateTaskSchema } from "@/lib/validations/tasks";
import { z } from "zod";

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const task = await prisma.task.findUnique({
            where: { id: params.id },
            include: { tags: true },
        });

        if (!task) {
            return NextResponse.json(
                { success: false, error: "Task not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: task });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: "Failed to fetch task" },
            { status: 500 }
        );
    }
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const body = await req.json();
        const validatedData = updateTaskSchema.parse(body);

        // Prepare update data
        const updateData: any = {
            title: validatedData.title,
            description: validatedData.description,
            status: validatedData.status,
            priority: validatedData.priority,
            dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : undefined, // undefined to skip update if absent
        };

        // Explicitly handle null for dueDate if passed as null
        if (validatedData.dueDate === null) {
            updateData.dueDate = null;
        }

        if (validatedData.tags) {
            updateData.tags = {
                set: [], // Clear existing tags
                connectOrCreate: validatedData.tags.map((tag) => ({
                    where: { name: tag },
                    create: { name: tag },
                })),
            };
        }

        const task = await prisma.task.update({
            where: { id: params.id },
            data: updateData,
            include: { tags: true },
        });

        return NextResponse.json({ success: true, data: task });
    } catch (error) {
        if (error instanceof z.ZodError) {
            const zodError = error as z.ZodError;
            return NextResponse.json(
                { success: false, error: zodError.issues },
                { status: 400 }
            );
        }
        // Handle record not found
        if ((error as any).code === 'P2025') {
            return NextResponse.json(
                { success: false, error: "Task not found" },
                { status: 404 }
            );
        }
        console.error("PATCH /api/tasks/[id] error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to update task" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await prisma.task.delete({
            where: { id: params.id },
        });

        return NextResponse.json({ success: true, data: null });
    } catch (error) {
        if ((error as any).code === 'P2025') {
            return NextResponse.json(
                { success: false, error: "Task not found" },
                { status: 404 }
            );
        }
        return NextResponse.json(
            { success: false, error: "Failed to delete task" },
            { status: 500 }
        );
    }
}
