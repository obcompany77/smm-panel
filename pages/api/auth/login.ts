i// /pages/api/auth/login.ts
import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import { supabaseServer } from "@/lib/supabaseClient";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ msg: "Method Not Allowed" });

  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ msg: "email, password 필수" });

  const { data: user, error } = await supabaseServer
    .from("users")
    .select("id, email, password, name")
    .eq("email", email)
    .single();

  if (error || !user) return res.status(401).json({ msg: "이메일 또는 비밀번호가 올바르지 않습니다." });

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ msg: "이메일 또는 비밀번호가 올바르지 않습니다." });

  return res.status(200).json({ msg: "로그인 성공", user: { id: user.id, email: user.email, name: user.name ?? null } });
}
