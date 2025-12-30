// Script to remove userId column from Task table
// Run with: node scripts/fix-userid.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixUserId() {
    try {
        // Execute raw SQL to remove userId column if it exists
        await prisma.$executeRawUnsafe(`
            DO $$
            BEGIN
                IF EXISTS (
                    SELECT 1 
                    FROM information_schema.columns 
                    WHERE table_schema = 'public'
                    AND table_name = 'Task' 
                    AND column_name = 'userId'
                ) THEN
                    -- Drop foreign key constraint if it exists
                    ALTER TABLE "Task" DROP CONSTRAINT IF EXISTS "Task_userId_fkey";
                    
                    -- Drop the column
                    ALTER TABLE "Task" DROP COLUMN "userId";
                    
                    RAISE NOTICE 'Removed userId column from Task table';
                ELSE
                    RAISE NOTICE 'userId column does not exist - no action needed';
                END IF;
            END $$;
        `);
        console.log('✅ Database fixed successfully');
    } catch (error) {
        console.error('❌ Error fixing database:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

fixUserId();

