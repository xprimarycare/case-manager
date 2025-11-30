-- CreateTable
CREATE TABLE "Case" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "patientName" TEXT NOT NULL,
    "summary" TEXT NOT NULL,

    CONSTRAINT "Case_pkey" PRIMARY KEY ("id")
);
