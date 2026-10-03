import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  'https://ehifskiigrfpxeiruyxr.supabase.co',
  'sb_publishable_ne8xIO5aoko5eW4ONLfBRQ_uyfBBhYy',
  { auth: { storageKey: 'sponti-employee-auth', detectSessionInUrl: false } },
);
