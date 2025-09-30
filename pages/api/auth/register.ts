// /pages/api/auth/register.ts
import { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import { supabase } from "../../lib/supabaseClient";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ msg: "허용되지 않은 메소드입니다." });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ msg: "이메일과 비밀번호를 입력하세요." });
    }

    // 비밀번호 해시
    const hashedPassword = await bcrypt.hash(password, 10);

    // Supabase users 테이블에 저장
    const { error } = await supabase.from("users").insert([
      { email, password: hashedPassword }
    ]);

    if (error) throw error;

    return res.status(200).json({ msg: "회원가입 성공" });
  } catch (err: any) {
    return res.status(500).json({ msg: "회원가입 실패", detail: err.message });
  }
}
