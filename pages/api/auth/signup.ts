import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { email, password, name } = req.body;

  // 비밀번호 해시
  const hashedPassword = await bcrypt.hash(password, 10);

  // DB에 유저 저장
  const { error } = await supabase.from("users").insert([
    { email, password: hashedPassword, name, provider: "local" }
  ]);

  if (error) return res.status(400).json({ message: error.message });
  return res.status(200).json({ message: "Signup successful" });
}
