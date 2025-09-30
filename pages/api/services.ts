// pages/api/services.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { data, error } = await supabase
    .from("services")
    .select("id, name, description, price")
    .order("id", { ascending: true });
  if (error) return res.status(500).json({ msg: "서비스 조회 실패", detail: error.message });
  return res.status(200).json({ items: data || [] });
}
