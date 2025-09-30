// pages/api/order.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function parseUserIdFromToken(token?: string | null) {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 2 || parts[0] !== "ok") return null;
  return parts[1];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ msg: "Method Not Allowed" });

  const { service_id } = req.body;
  const token = (req.headers.authorization?.replace("Bearer ", "") || req.body?.token) ?? "";
  const user_id = parseUserIdFromToken(token);

  if (!user_id) return res.status(401).json({ msg: "인증 실패" });
  if (!service_id) return res.status(400).json({ msg: "service_id 필요" });

  // 서비스 가격 확인
  const { data: svc, error: serr } = await supabase
    .from("services").select("id, price").eq("id", service_id).maybeSingle();
  if (serr || !svc) return res.status(404).json({ msg: "서비스 없음" });
  const cost = Number(svc.price);

  // 지갑 확인
  const { data: wallet, error: werr } = await supabase
    .from("wallets").select("id, balance").eq("user_id", user_id).maybeSingle();
  if (werr || !wallet) return res.status(400).json({ msg: "지갑 없음" });

  if (wallet.balance < cost) return res.status(400).json({ msg: "잔액 부족" });

  // 잔액 차감
  await supabase.from("wallets").update({ balance: wallet.balance - cost }).eq("id", wallet.id);

  // 주문 생성
  const { data: order, error: oerr } = await supabase
    .from("orders")
    .insert([{ user_id, service_id, cost, status: "pending" }])
    .select()
    .single();
  if (oerr) return res.status(500).json({ msg: "주문 실패", detail: oerr.message });

  return res.status(200).json({ msg: "주문 성공", order });
}
