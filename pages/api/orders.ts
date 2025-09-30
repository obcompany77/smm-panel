import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

// Supabase 클라이언트 연결
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Service Role Key 사용 (주의: 클라이언트 키 아님)
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    // 주문 생성
    const { user_id, service_id, cost } = req.body;

    if (!user_id || !service_id || !cost) {
      return res.status(400).json({ msg: "필수 값이 누락되었습니다." });
    }

    const { data, error } = await supabase
      .from("orders")
      .insert([{ user_id, service_id, cost }])
      .select();

    if (error) {
      return res.status(500).json({ msg: "주문 실패", detail: error.message });
    }

    return res.status(200).json({ msg: "주문 성공", order: data[0] });
  }

  if (req.method === "GET") {
    // 주문 내역 불러오기
    const { user_id } = req.query;

    if (!user_id) {
      return res.status(400).json({ msg: "user_id가 필요합니다." });
    }

    const { data, error } = await supabase
      .from("orders")
      .select(
        `
        id,
        service_id,
        cost,
        status,
        created_at,
        services(name)
      `
      )
      .eq("user_id", user_id)
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(500).json({ msg: "주문 내역 불러오기 실패", detail: error.message });
    }

    return res.status(200).json(data);
  }

  // 다른 메서드 처리
  return res.status(405).json({ msg: "허용되지 않은 메서드입니다." });
}
