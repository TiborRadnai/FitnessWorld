import { createClient } from '@supabase/supabase-js';
import { environment } from './core/environments/environment';

export const supabase = createClient(
  environment.supabaseUrl,
  environment.supabaseAnonKey
);
