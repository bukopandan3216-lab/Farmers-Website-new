import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Server
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',

  // Database
  databaseUrl: process.env.DATABASE_URL,

  // JWT
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  jwtExpireIn: process.env.JWT_EXPIRE_IN || '7d',

  // Supabase
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY,

  // Stripe
  stripeSecretKey: process.env.STRIPE_SECRET_KEY,
  stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
};

export const validateConfig = (): void => {
  if (!config.databaseUrl) {
    throw new Error('DATABASE_URL is not defined');
  }
  if (!config.jwtSecret) {
    throw new Error('JWT_SECRET is not defined');
  }
};
