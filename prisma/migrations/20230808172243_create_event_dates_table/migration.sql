/*
  Warnings:

  - You are about to drop the column `date` on the `Activity` table. All the data in the column will be lost.
  - You are about to drop the column `venuesId` on the `Activity` table. All the data in the column will be lost.
  - Added the required column `eventDateId` to the `Activity` table without a default value. This is not possible if the table is not empty.
  - Added the required column `venueId` to the `Activity` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Activity" DROP CONSTRAINT "Activity_venuesId_fkey";

-- AlterTable
ALTER TABLE "Activity" DROP COLUMN "date",
DROP COLUMN "venuesId",
ADD COLUMN     "eventDateId" INTEGER NOT NULL,
ADD COLUMN     "venueId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "EventDates" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventDates_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venues"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_eventDateId_fkey" FOREIGN KEY ("eventDateId") REFERENCES "EventDates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
