-- Add featured column to farmer_profiles for featured farmer profiles
ALTER TABLE "farmer_profiles" ADD COLUMN "featured" BOOLEAN NOT NULL DEFAULT false;
