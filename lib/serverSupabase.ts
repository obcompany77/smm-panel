import { createClient } from "@supabase/supabase-js";
export function supabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}
export async function getUserFromAuthHeader(req: any) {
  const authHeader = req.headers?.authorization || req.headers?.get?.("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : undefined;
  if (!token) return null;
  const admin = supabaseAdmin();
  const { data } = await admin.auth.getUser(token);
  return data.user ?? null;
}
