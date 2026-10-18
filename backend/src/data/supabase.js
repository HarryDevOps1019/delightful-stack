import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { fileURLToPath } from "node:url";

// Resolve the backend env file from this module instead of process.cwd().
// In local development, prefer this file over stale shell variables so the
// server cannot accidentally use a publishable/anon key for admin writes.
const envPath = fileURLToPath(new URL("../../.env", import.meta.url));
const isLocalRuntime = process.env.NODE_ENV !== "production" && process.env.VERCEL !== "1";
dotenv.config({ path: envPath, override: isLocalRuntime });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("⚠️  Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in .env");
  process.exit(1);
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

/**
 * Creates a short-lived, non-persistent client used only for password
 * sign-ins / verification, so a user session never leaks into the shared
 * service-role client above.
 */
export function createAuthClient() {
  return createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

console.log("✅ Supabase client initialized →", supabaseUrl);
