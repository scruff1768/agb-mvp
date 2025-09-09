// lib/supabase-browser.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

/**
 * Client-component Supabase instance (auth-helpers).
 * Stores the PKCE code_verifier in a cookie the server callback can read.
 */
export const createBrowserClient = () => createClientComponentClient();
