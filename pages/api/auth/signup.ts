// pages/api/auth/signup.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ msg: "Method Not Allowed" });

  try {
    const { email, password, name } = req.body || {};
    if (!email || !password) return res.status(400).json({ msg: "필수값 누락" });

    // 이미 존재하는지 체크
    const { data: exists } = await supabase.from("users").select("id").eq("email", email).maybeSingle();
    if (exists) return res.status(409).json({ msg: "이미 존재하는 이메일" });

    // 사용자 생성
    const { data: user, error: uerr } = await supabase
      .from("users")
      .insert([{ email, password, name: name || null, provider: "local" }])
      .select("id")
      .single();
    if (uerr || !user) return res.status(500).json({ msg: "가입 실패", detail: uerr?.message });

    // 지갑 자동 생성
    const { error: werr } = await supabase.from("wallets").insert([{ user_id: user.id, balance: 0 }]);
    if (werr) return res.status(500).json({ msg: "지갑 생성 실패", detail: werr.message });

    return res.status(200).json({ msg: "가입 완료 (이메일 인증 불필요)" });
  } catch (e: any) {
    return res.status(500).json({ msg: "서버 오류", detail: e.message });
  }
}
