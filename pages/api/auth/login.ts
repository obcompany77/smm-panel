import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(url, key);
const JWT_SECRET = process.env.JWT_SECRET!;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ msg: "Method Not Allowed" });

  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ msg: "email, password 필수" });

  const { data: user, error } = await supabase
    .from("users")
    .select("id, password, name")
    .eq("email", email)
    .single();

  if (error || !user) return res.status(401).json({ msg: "이메일 또는 비밀번호가 올바르지 않습니다." });

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ msg: "이메일 또는 비밀번호가 올바르지 않습니다." });

  const token = jwt.sign({ uid: user.id, email }, JWT_SECRET, { expiresIn: "7d" });
  return res.status(200).json({ msg: "로그인 성공", token, name: user.name });
}
