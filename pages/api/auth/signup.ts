import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(url, key);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ msg: "Method Not Allowed" });

  const { email, password, name } = req.body || {};
  if (!email || !password) return res.status(400).json({ msg: "email, password 필수" });

  // 이미 존재하는지 확인
  const { data: exists } = await supabase.from("users").select("id").eq("email", email).maybeSingle();
  if (exists) return res.status(409).json({ msg: "이미 가입된 이메일" });

  const hash = await bcrypt.hash(password, 10);

  // 가입 + 지갑 생성
  const { data: user, error } = await supabase
    .from("users")
    .insert([{ email, password: hash, name: name ?? null, provider: "local" }])
    .select("id")
    .single();

  if (error || !user) return res.status(500).json({ msg: "가입 실패", detail: error?.message });

  await supabase.from("wallets").insert([{ user_id: user.id }]);

  // 이메일 인증 없이 바로 완료
  return res.status(201).json({ msg: "가입 완료 (이메일 인증 불필요)" });
}
