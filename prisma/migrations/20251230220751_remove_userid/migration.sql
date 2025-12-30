-- Remove userId column from Task table if it exists
-- This migration handles the case where the database was migrated with Clerk authentication
-- but we've rolled back to a version without authentication

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
        IF EXISTS (
            SELECT 1 
            FROM information_schema.table_constraints 
            WHERE constraint_name LIKE '%userId%' 
            AND table_name = 'Task'
        ) THEN
            ALTER TABLE "Task" DROP CONSTRAINT IF EXISTS "Task_userId_fkey";
        END IF;
        
        -- Drop the column
        ALTER TABLE "Task" DROP COLUMN "userId";
    END IF;
END $$;

