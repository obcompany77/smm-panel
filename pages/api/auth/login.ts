// pages/api/auth/login.ts
import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // GET 등으로 오면 405
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ msg: "Method Not Allowed" });
  }

  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ msg: "이메일/비밀번호가 필요합니다" });
    }

    // provider=local 계정만 조회
    const { data: user, error } = await supabase
      .from("users")
      .select("id, email, password, provider")
      .eq("email", email)
      .eq("provider", "local")
      .single();

    if (error || !user) {
      return res.status(401).json({ msg: "이메일 또는 비밀번호가 올바르지 않습니다" });
    }

    const ok = await bcrypt.compare(password, user.password as string);
    if (!ok) {
      return res.status(401).json({ msg: "이메일 또는 비밀번호가 올바르지 않습니다" });
    }

    // 앱에서 localStorage로 쓰는 간단 토큰
    const token = Math.random().toString(36).slice(2);

    return res.status(200).json({ token, userId: user.id });
  } catch (e: any) {
    return res.status(500).json({ msg: "서버 오류", detail: e.message });
  }
}
