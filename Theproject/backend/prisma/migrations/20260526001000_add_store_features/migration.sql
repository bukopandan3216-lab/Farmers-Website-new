-- Add new columns to User table
ALTER TABLE users ADD COLUMN "totalSpent" DECIMAL(10,2) NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN "memberSince" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE users ADD COLUMN "storeFollows" TEXT;

-- Add new columns to FarmerProfile table
ALTER TABLE farmer_profiles ADD COLUMN "followerCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE farmer_profiles ADD COLUMN "totalOrders" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE farmer_profiles ADD COLUMN "totalRevenue" DECIMAL(12,2) NOT NULL DEFAULT 0;
ALTER TABLE farmer_profiles ADD COLUMN "avgRating" DECIMAL(3,2) NOT NULL DEFAULT 0;

-- Create StoreFollower table
CREATE TABLE store_followers (
  id TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "farmerId" TEXT NOT NULL UNIQUE,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "store_followers_userId_fkey" FOREIGN KEY ("userId") REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT "store_followers_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES farmer_profiles (id) ON DELETE CASCADE
);

-- Create unique index for StoreFollower
CREATE UNIQUE INDEX "store_followers_userId_farmerId_key" ON store_followers("userId", "farmerId");
CREATE INDEX "store_followers_userId_idx" ON store_followers("userId");
CREATE INDEX "store_followers_farmerId_idx" ON store_followers("farmerId");

-- Create StoreReview table
CREATE TABLE store_reviews (
  id TEXT NOT NULL PRIMARY KEY,
  "farmerId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  rating INTEGER NOT NULL,
  comment TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "store_reviews_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES farmer_profiles (id) ON DELETE CASCADE,
  CONSTRAINT "store_reviews_userId_fkey" FOREIGN KEY ("userId") REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX "store_reviews_farmerId_idx" ON store_reviews("farmerId");
CREATE INDEX "store_reviews_userId_idx" ON store_reviews("userId");

-- Create OrderTracking table
CREATE TABLE order_tracking (
  id TEXT NOT NULL PRIMARY KEY,
  "orderId" TEXT NOT NULL,
  status TEXT NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedBy" TEXT,
  notes TEXT,
  CONSTRAINT "order_tracking_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES orders (id) ON DELETE CASCADE
);

CREATE INDEX "order_tracking_orderId_idx" ON order_tracking("orderId");
