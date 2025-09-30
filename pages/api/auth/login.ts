import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ msg: "허용되지 않은 메서드입니다." });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ msg: "이메일과 비밀번호를 입력하세요." });
  }

  // 유저 찾기
  const { data: users, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .single();

  if (error || !users) {
    return res.status(401).json({ msg: "존재하지 않는 계정입니다." });
  }

  // 비밀번호 비교
  const isValid = await bcrypt.compare(password, users.password);
  if (!isValid) {
    return res.status(401).json({ msg: "비밀번호가 올바르지 않습니다." });
  }

  // 로그인 성공 → 토큰은 간단히 세션대신 임시 반환
  return res.status(200).json({
    msg: "로그인 성공",
    user: { id: users.id, email: users.email }
  });
}
