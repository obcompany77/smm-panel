// pages/api/orders.ts
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
  if (req.method !== "GET") return res.status(405).json({ msg: "Method Not Allowed" });

  const token = req.headers.authorization?.replace("Bearer ", "") ?? "";
  const user_id = parseUserIdFromToken(token);
  if (!user_id) return res.status(401).json({ msg: "인증 실패" });

  const { data, error } = await supabase
    .from("orders")
    .select("id, service_id, cost, status, created_at")
    .eq("user_id", user_id)
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json({ msg: "주문 내역 조회 실패", detail: error.message });
  return res.status(200).json({ items: data || [] });
}
