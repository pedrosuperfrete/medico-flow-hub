// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://xothkxkdxydtvnpmbfgi.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhvdGhreGtkeHlkdHZucG1iZmdpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5MTI4NTksImV4cCI6MjA2NTQ4ODg1OX0.Xr4DdrX6TCGQ9yIzADqjHB-5aA75NhiNwtzqRQ_Nn0o";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);