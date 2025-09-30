// pages/services.tsx
import { useEffect, useState } from "react";

type Service = { id: number; name: string; description: string | null; price: number };

export default function ServicesPage() {
  const [items, setItems] = useState<Service[]>([]);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/services")
      .then((r) => r.json())
      .then((d) => setItems(d.items || []));
  }, []);

  async function order(service_id: number) {
    setMsg(null);
    const token = localStorage.getItem("token");
    if (!token) {
      setMsg("로그인이 필요합니다.");
      location.href = "/auth";
      return;
    }

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ service_id, token }),
      });
      const data = await res.json();

      if (!res.ok) {
        setMsg(`❌ 주문 실패: ${data.msg || res.status}`);
      } else {
        setMsg(`✅ 주문 성공! 주문번호: ${data.order.id}`);
      }
    } catch (err) {
      setMsg("서버 오류로 주문이 안 됩니다.");
    }
  }

  return (
    <main style={wrap}>
      <div style={card}>
        <h1>서비스 목록</h1>
        <div style={{ marginTop: 16 }}>
          {items.map((s) => (
            <div key={s.id} style={row}>
              <div>
                <strong>{s.name}</strong>
                <p style={{ opacity: 0.7, fontSize: 13 }}>{s.description || "-"}</p>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span>${Number(s.price).toFixed(2)}</span>
                <button style={btn} onClick={() => order(s.id)}>
                  주문하기
                </button>
              </div>
            </div>
          ))}
          {items.length === 0 && <p>등록된 서비스가 없습니다.</p>}
        </div>
        {msg && <p style={{ marginTop: 12 }}>{msg}</p>}
      </div>
    </main>
  );
}

const wrap: React.CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "#0b1220",
  color: "#e5e7eb",
};
const card: React.CSSProperties = {
  width: "100%",
  maxWidth: 600,
  background: "#111827",
  padding: 20,
  borderRadius: 12,
};
const row: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "10px 0",
  borderBottom: "1px solid #1f2937",
};
const btn: React.CSSProperties = {
  padding: "6px 12px",
  background: "#2563eb",
  color: "#fff",
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
};
