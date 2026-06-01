-- Fix 1: Convert Float to Decimal for money fields to prevent rounding errors
-- User.totalSpent
ALTER TABLE "users" ALTER COLUMN "totalSpent" TYPE NUMERIC(10, 2);

-- FarmerProfile.totalRevenue and avgRating
ALTER TABLE "farmer_profiles" ALTER COLUMN "totalRevenue" TYPE NUMERIC(12, 2);
ALTER TABLE "farmer_profiles" ALTER COLUMN "avgRating" TYPE NUMERIC(3, 2);

-- Product.price and avgRating
ALTER TABLE "products" ALTER COLUMN "price" TYPE NUMERIC(10, 2);
ALTER TABLE "products" ALTER COLUMN "avgRating" TYPE NUMERIC(3, 2);

-- Order.total
ALTER TABLE "orders" ALTER COLUMN "total" TYPE NUMERIC(12, 2);

-- OrderItem.price
ALTER TABLE "order_items" ALTER COLUMN "price" TYPE NUMERIC(10, 2);

-- Fix 2: Remove the @unique constraint on StoreFollower.farmerId
-- This allows multiple followers per farmer (the unique constraint should only be on [userId, farmerId])
ALTER TABLE "store_followers" DROP CONSTRAINT IF EXISTS "store_followers_farmerId_key";
