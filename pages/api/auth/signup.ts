import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function pick(req: NextApiRequest) {
  if (req.method === "GET") {
    const { email, password, name } = req.query as any;
    return { email, password, name };
  }
  const { email, password, name } = req.body || {};
  return { email, password, name };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!["POST", "GET"].includes(req.method || "")) {
    return res.status(405).json({ msg: "Method Not Allowed" });
  }

  const { email, password, name } = pick(req);
  if (!email || !password) return res.status(400).json({ msg: "필수값 누락" });

  // 이미 존재?
  const { data: exists } = await supabase.from("users").select("id").eq("email", email).maybeSingle();
  if (exists) return res.status(409).json({ msg: "이미 존재하는 이메일" });

  const { data: user, error: uerr } = await supabase
    .from("users")
    .insert([{ email, password, name: name || null, provider: "local" }])
    .select("id")
    .single();
  if (uerr || !user) return res.status(500).json({ msg: "가입 실패", detail: uerr?.message });

  await supabase.from("wallets").insert([{ user_id: user.id, balance: 0 }]);

  return res.status(200).json({ msg: "가입 완료 (이메일 인증 불필요)" });
}
