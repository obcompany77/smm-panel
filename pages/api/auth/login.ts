import { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import { supabaseServer } from "@/lib/supabaseClient";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ msg: "허용되지 않은 메소드입니다." });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ msg: "이메일과 비밀번호를 입력하세요." });
    }

    // 유저 찾기
    const { data: user, error } = await supabaseServer
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (error || !user) {
      return res.status(401).json({ msg: "존재하지 않는 계정입니다." });
    }

    // 비밀번호 비교
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ msg: "비밀번호가 올바르지 않습니다." });
    }

    return res.status(200).json({
      msg: "로그인 성공",
      user: { id: user.id, email: user.email }
    });
  } catch (err: any) {
    return res.status(500).json({ msg: "로그인 실패", detail: err.message });
  }
}
