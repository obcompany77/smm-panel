import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// 클라이언트 (프론트에서 사용)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 서버 (API 라우트에서 사용, insert/update 가능)
export const supabaseServer = createClient(supabaseUrl, supabaseServiceKey);
