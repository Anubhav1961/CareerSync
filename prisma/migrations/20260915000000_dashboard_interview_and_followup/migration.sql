-- AlterTable
ALTER TABLE "Job" ADD COLUMN "followUpDate" DATETIME;
ALTER TABLE "Job" ADD COLUMN "followUpNotes" TEXT;

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Interview" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME,
    "jobId" TEXT NOT NULL,
    "round" TEXT,
    "interviewDate" DATETIME,
    "location" TEXT,
    "status" TEXT DEFAULT 'scheduled',
    "notes" TEXT,
    "feedback" TEXT,
    CONSTRAINT "Interview_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Interview" ("id", "createdAt", "jobId") SELECT "id", "createdAt", "jobId" FROM "Interview";
DROP TABLE "Interview";
ALTER TABLE "new_Interview" RENAME TO "Interview";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
