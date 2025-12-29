import { PrismaClient } from "@prisma/client";
import path from "path";

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: `file:${path.join(process.cwd(), 'data/tasks.db')}`
        }
    }
});

async function main() {
    console.log("Seeding database...");

    // Clear existing tasks? Maybe.
    // await prisma.task.deleteMany();

    const data = [
        { title: "Review Q1 Report", status: "PENDING", priority: "HIGH", tags: ["work"] },
        { title: "Buy Groceries", status: "PENDING", priority: "MEDIUM", tags: ["personal"] },
        { title: "Call Contractor", status: "DONE", priority: "HIGH", tags: ["house"] },
        { title: "Update Portfolio", status: "PENDING", priority: "LOW", tags: ["career"] },
        { title: "Book Flights", status: "PENDING", priority: "MEDIUM", tags: ["travel", "fun"] },
        { title: "Fix leak", status: "DONE", priority: "LOW", tags: ["house"] },
        { title: "File Taxes", status: "PENDING", priority: "HIGH", tags: ["finance"] },
        { title: "Read 'Atomic Habits'", status: "PENDING", priority: "LOW", tags: ["learning"] },
        { title: "Dentist Appointment", status: "PENDING", priority: "MEDIUM", tags: ["health"] },
        { title: "Water Plants", status: "DONE", priority: "LOW", tags: ["chore"] },
    ];

    for (const t of data) {
        const task = await prisma.task.create({
            data: {
                title: t.title,
                status: t.status,
                priority: t.priority,
                tags: {
                    connectOrCreate: t.tags.map(tag => ({
                        where: { name: tag },
                        create: { name: tag }
                    }))
                }
            },
            include: { tags: true }
        });
        console.log(`Created task: ${task.title}`);
    }
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
