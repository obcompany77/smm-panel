// pages/api/auth/login.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
// bcrypt를 쓰려면 주석 해제하고 `npm i bcryptjs` 후 비교 로직 변경
// import bcrypt from "bcryptjs";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ msg: "Method Not Allowed" });

  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ msg: "필수값 누락" });

    const { data: user, error } = await supabase
      .from("users")
      .select("id, password")
      .eq("email", email)
      .single();

    if (error || !user) return res.status(401).json({ msg: "존재하지 않는 계정" });

    // bcrypt 사용 시:
    // const ok = await bcrypt.compare(password, user.password);
    const ok = user.password === password;
    if (!ok) return res.status(401).json({ msg: "비밀번호 불일치" });

    // 임시 토큰(데모용). 실제 운영은 JWT로 교체.
    const token = `ok.${user.id}`;
    return res.status(200).json({ msg: "ok", token, user_id: user.id });
  } catch (e: any) {
    return res.status(500).json({ msg: "서버 오류", detail: e.message });
  }
}
