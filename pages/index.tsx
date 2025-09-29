import React, { useState, useEffect } from "react";
import useSWR from "swr";
import { supabase } from "../lib/supabaseClient";

const fetcher = (url: string, token: string) =>
  fetch(url, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json());

export default function Home() {
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState<string>("");

  useEffect(() => {
    (async () => {
      const s = await supabase.auth.getSession();
      setToken(s.data.session?.access_token ?? null);
      const u = await supabase.auth.getUser();
      setEmail(u.data.user?.email ?? "");
    })();
  }, []);

  const { data } = useSWR(token ? ["/api/wallet", token] : null, ([url, t]) => fetcher(url, t));
  const { data: orders } = useSWR(token ? ["/api/order?recent=1", token] : null, ([url, t]) => fetcher(url, t));

  return (
    <div>
      <h1>대시보드</h1>
      <p>계정: {email || "로그인 필요"}</p>
      <div style={{ display: "flex", gap: 16 }}>
        <div style={{ border: "1px solid #eee", padding: 16, borderRadius: 8 }}>
          <b>지갑 잔액</b>
          <div style={{ fontSize: 24 }}>{data?.balance ?? "-"} 원</div>
        </div>
        <div style={{ border: "1px solid #eee", padding: 16, borderRadius: 8, flex: 1 }}>
          <b>최근 주문</b>
          <ul>
            {(orders?.items ?? []).map((o: any) => (
              <li key={o.id}>#{o.id} • {o.status} • {o.cost}원</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
