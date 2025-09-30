// pages/api/order.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// 클라이언트에서 넘긴 token 형식: "ok.<uuid>" (임시 토큰)
function parseUserIdFromToken(token?: string | null) {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 2 || parts[0] !== "ok") return null;
  return parts[1];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!["POST", "GET"].includes(req.method || "")) return res.status(405).json({ msg: "Method Not Allowed" });

  // GET도 임시 허용 (테스트 용이)
  const body = req.method === "GET" ? req.query : req.body;
  const service_id = Number(body?.service_id);
  const token = (req.headers.authorization?.replace("Bearer ", "") || (body?.token as string)) ?? "";
  const user_id = parseUserIdFromToken(token);

  if (!user_id) return res.status(401).json({ msg: "인증 실패(토큰 없음/형식 오류)" });
  if (!service_id) return res.status(400).json({ msg: "service_id 필요" });

  // 서비스 정보
  const { data: svc, error: serr } = await supabase
    .from("services").select("id, price").eq("id", service_id).maybeSingle();
  if (serr || !svc) return res.status(404).json({ msg: "서비스 없음" });
  const cost = Number(svc.price);

  // 지갑 조회
  const { data: walletRow, error: werr } = await supabase
    .from("wallets").select("id, balance").eq("user_id", user_id).maybeSingle();
  if (werr || !walletRow) return res.status(400).json({ msg: "지갑 없음" });

  const balance = Number(walletRow.balance);
  if (balance < cost) return res.status(400).json({ msg: "잔액 부족", balance });

  // 차감 + 주문 생성 (간단 순차 처리)
  const { error: wupd } = await supabase
    .from("wallets")
    .update({ balance: balance - cost })
    .eq("id", walletRow.id);
  if (wupd) return res.status(500).json({ msg: "잔액 차감 실패", detail: wupd.message });

  const { data: order, error: oerr } = await supabase
    .from("orders")
    .insert([{ user_id, service_id, cost, status: "pending" }])
    .select("id, status, created_at")
    .single();
  if (oerr) return res.status(500).json({ msg: "주문 생성 실패", detail: oerr.message });

  return res.status(200).json({ msg: "주문 성공", order });
}
