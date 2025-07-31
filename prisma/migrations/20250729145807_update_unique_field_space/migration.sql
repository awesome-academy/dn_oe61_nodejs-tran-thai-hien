/*
  Warnings:

  - A unique constraint covering the columns `[name,venueId]` on the table `spaces` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `spaces_name_key` ON `spaces`;

-- CreateIndex
CREATE UNIQUE INDEX `spaces_name_venueId_key` ON `spaces`(`name`, `venueId`);
