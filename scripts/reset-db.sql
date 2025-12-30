-- Reset database schema to match our current schema (no userId)
-- Run this if you need to remove userId column from Task table

-- Check if userId column exists and remove it if it does
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'Task' 
        AND column_name = 'userId'
    ) THEN
        ALTER TABLE "Task" DROP COLUMN "userId";
        RAISE NOTICE 'Removed userId column from Task table';
    ELSE
        RAISE NOTICE 'userId column does not exist in Task table';
    END IF;
END $$;

