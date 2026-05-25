import { createClient } from '@supabase/supabase-js';
import { config } from './index.js';

if (!config.supabaseUrl || !config.supabaseServiceRoleKey) {
  throw new Error(
    'Supabase configuration is missing. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.'
  );
}

export const supabase = createClient(
  config.supabaseUrl,
  config.supabaseServiceRoleKey
);
