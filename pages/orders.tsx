// pages/orders.tsx
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

type Order = { id: number; service_id: number; cost: number; status: string; created_at: string };

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setMsg("로그인이 필요합니다.");
      router.push("/auth");
      return;
    }

    fetch("/api/orders", { headers: { Authorization: "Bearer " + token } })
      .then((res) => res.json())
      .then((data) => {
        if (data.items) setOrders(data.items);
        else setMsg("주문 내역 불러오기 실패");
      })
      .catch(() => setMsg("서버 오류"));
  }, [router]);

  return (
    <main style={wrap}>
      <div style={card}>
        <h1>내 주문 내역</h1>
        {msg && <p style={{ color: "#f87171" }}>{msg}</p>}
        {orders.length > 0 ? (
          <div style={{ marginTop: 16 }}>
            {orders.map((o) => (
              <div key={o.id} style={row}>
                <div>#{o.id}</div>
                <div>서비스 ID: {o.service_id}</div>
                <div>${o.cost}</div>
                <div>{o.status}</div>
                <div>{new Date(o.created_at).toLocaleString()}</div>
              </div>
            ))}
          </div>
        ) : (
          !msg && <p>주문 내역이 없습니다.</p>
        )}
      </div>
    </main>
  );
}

const wrap: React.CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#0b1220",
  color: "#e5e7eb",
  padding: 16,
};
const card: React.CSSProperties = {
  width: "100%",
  maxWidth: 720,
  background: "#111827",
  border: "1px solid #1f2937",
  borderRadius: 12,
  padding: 20,
};
const row: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "80px 1fr 80px 100px 200px",
  gap: 12,
  padding: "8px 0",
  borderBottom: "1px solid #1f2937",
};
