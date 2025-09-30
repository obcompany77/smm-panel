// /pages/api/auth/signup.ts
import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import { supabaseServer } from "@/lib/supabaseClient";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ msg: "Method Not Allowed" });

  const { email, password, name } = req.body || {};
  if (!email || !password) return res.status(400).json({ msg: "email, password 필수" });

  // 중복 이메일 체크
  const { data: exists } = await supabaseServer.from("users").select("id").eq("email", email).maybeSingle();
  if (exists) return res.status(409).json({ msg: "이미 가입된 이메일" });

  // 비밀번호 해시
  const hash = await bcrypt.hash(password, 10);

  // 가입 + 지갑 생성
  const { data: user, error: uerr } = await supabaseServer
    .from("users")
    .insert([{ email, password: hash, name: name ?? null, provider: "local" }])
    .select("id")
    .single();

  if (uerr || !user) return res.status(500).json({ msg: "가입 실패", detail: uerr?.message });

  await supabaseServer.from("wallets").insert([{ user_id: user.id }]);

  return res.status(201).json({ msg: "가입 완료 (이메일 인증 불필요)" });
}
