-- CreateTable
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");

-- Add userId column to Task table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public'
        AND table_name = 'Task' 
        AND column_name = 'userId'
    ) THEN
        ALTER TABLE "Task" ADD COLUMN "userId" TEXT;
        
        -- Set a default userId for existing tasks (optional - you may want to delete them instead)
        -- UPDATE "Task" SET "userId" = 'system' WHERE "userId" IS NULL;
        
        -- Make userId required after setting defaults
        ALTER TABLE "Task" ALTER COLUMN "userId" SET NOT NULL;
        
        -- Add foreign key constraint
        ALTER TABLE "Task" ADD CONSTRAINT "Task_userId_fkey" 
            FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

