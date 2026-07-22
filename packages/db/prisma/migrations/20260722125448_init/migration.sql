-- CreateEnum
CREATE TYPE "submission_status" AS ENUM ('SUCCESS', 'FAILURE', 'PENDING');

-- CreateTable
CREATE TABLE "Submissions" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "output" TEXT,
    "status" "submission_status" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "Submissions_pkey" PRIMARY KEY ("id")
);
