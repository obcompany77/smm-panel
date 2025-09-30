// pages/orders.tsx
import { useEffect, useState } from "react";

type Order = { id: number; service_id: number; cost: number; status: string; created_at: string };

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setMsg("로그인이 필요합니다.");
      return (location.href = "/auth");
    }
    fetch("/api/my-orders", { headers: { Authorization: "Bearer " + token } })
      .then(r => r.json())
      .then(d => {
        if (d.items) setOrders(d.items);
        else setMsg(d.msg || "조회 실패");
      });
  }, []);

  return (
    <main style={wrap}>
      <div style={card}>
        <h1>내 주문 내역</h1>
        <p style={{opacity:.8, marginTop:6}}>최근 주문 순서대로 보여집니다.</p>
        <div style={{marginTop:16}}>
          {orders.map(o => (
            <div key={o.id} style={row}>
              <div>#{o.id}</div>
              <div>서비스ID: {o.service_id}</div>
              <div>${o.cost}</div>
              <div>{o.status}</div>
              <div>{new Date(o.created_at).toLocaleString()}</div>
            </div>
          ))}
          {orders.length === 0 && <div style={{opacity:.7}}>주문 내역이 없습니다.</div>}
        </div>
        {msg && <p style={{marginTop:12, color:"#f87171"}}>{msg}</p>}
      </div>
    </main>
  );
}

const wrap: React.CSSProperties = {minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#0b1220", color:"#e5e7eb", padding:16};
const card: React.CSSProperties = {width:"100%", maxWidth:720, background:"#111827", border:"1px solid #1f2937", borderRadius:12, padding:20};
const row: React.CSSProperties = {display:"grid", gridTemplateColumns:"80px 1fr 80px 100px 200px", gap:12, padding:"8px 0", borderBottom:"1px solid #1f2937"};
