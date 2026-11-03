import type { Database } from './database.types';
import { createClient } from '@supabase/supabase-js';

// This branch uses an isolated Supabase test project; never use production credentials.
export const supabase = createClient<Database>(
  'https://emqzorrirjbtwerayhtq.supabase.co',
  'sb_publishable_8ezM6zpIRI2E6_pBuDL3ew_54N3ITnU',
  { auth: { storageKey: 'sponti-mfa-test-auth', detectSessionInUrl: false } },
);
