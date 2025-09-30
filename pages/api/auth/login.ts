import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function pick(req: NextApiRequest) {
  if (req.method === "GET") {
    const { email, password } = req.query as any;
    return { email, password };
  }
  const { email, password } = req.body || {};
  return { email, password };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!["POST", "GET"].includes(req.method || "")) {
    return res.status(405).json({ msg: "Method Not Allowed" });
  }

  const { email, password } = pick(req);
  if (!email || !password) return res.status(400).json({ msg: "필수값 누락" });

  const { data: user, error } = await supabase
    .from("users")
    .select("id, password")
    .eq("email", email)
    .single();

  if (error || !user) return res.status(401).json({ msg: "존재하지 않는 계정" });
  const ok = user.password === password; // (데모용. 이후 bcrypt로 교체)
  if (!ok) return res.status(401).json({ msg: "비밀번호 불일치" });

  const token = `ok.${user.id}`; // (데모용 토큰)
  return res.status(200).json({ msg: "ok", token, user_id: user.id });
}
