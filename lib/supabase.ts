import { createClient } from '@supabase/supabase-js'

// Client-side Supabase client (browser)
// This client is used in Client Components (with 'use client')
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    }
  }
)
