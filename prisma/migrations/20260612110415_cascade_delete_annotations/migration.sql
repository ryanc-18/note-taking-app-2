-- DropForeignKey
ALTER TABLE "Annotation" DROP CONSTRAINT "Annotation_noteId_fkey";

-- AddForeignKey
ALTER TABLE "Annotation" ADD CONSTRAINT "Annotation_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "Note"("id") ON DELETE CASCADE ON UPDATE CASCADE;
