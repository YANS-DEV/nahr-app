-- DropForeignKey
ALTER TABLE "public"."User" DROP CONSTRAINT "User_restaurantId_fkey";

-- AlterTable
ALTER TABLE "public"."User" ALTER COLUMN "restaurantId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "public"."Restaurant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
