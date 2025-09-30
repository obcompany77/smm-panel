import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { email, password } = req.body;

  // 유저 조회
  const { data: users, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .limit(1);

  if (error || !users || users.length === 0) {
    return res.status(400).json({ message: "User not found" });
  }

  const user = users[0];

  // 비밀번호 검증
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  // JWT 발급
  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET || "secret-key",
    { expiresIn: "7d" }
  );

  return res.status(200).json({ message: "Login successful", token });
}
