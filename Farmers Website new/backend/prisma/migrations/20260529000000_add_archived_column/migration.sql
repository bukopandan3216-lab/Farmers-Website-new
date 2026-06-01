-- AddColumn to products table for archived field
ALTER TABLE "products" ADD COLUMN "archived" BOOLEAN NOT NULL DEFAULT false;
