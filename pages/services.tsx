// pages/services.tsx
import { useEffect, useState } from "react";

type Service = { id: number; name: string; description: string | null; price: number };

export default function ServicesPage() {
  const [items, setItems] = useState<Service[]>([]);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/services").then(r => r.json()).then(d => setItems(d.items || []));
  }, []);

  async function order(service_id: number) {
    setMsg(null);
    const token = localStorage.getItem("token");
    if (!token) {
      setMsg("로그인이 필요합니다.");
      return (location.href = "/auth");
    }
    const res = await fetch("/api/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // 임시 토큰은 Authorization 헤더 대신 body에 같이 전달(서버도 둘 다 허용)
      body: JSON.stringify({ service_id, token })
    });
    const data = await res.json();
    if (!res.ok) setMsg(`오류: ${data.msg || res.status}`);
    else setMsg(`✅ ${data.msg} (주문번호 ${data.order.id})`);
  }

  return (
    <main style={wrap}>
      <div style={card}>
        <h1>서비스 목록</h1>
        <p style={{opacity:.8, marginTop:6}}>버튼을 누르면 잔액에서 차감되어 주문이 생성됩니다.</p>
        <div style={{marginTop:16}}>
          {items.map(s => (
            <div key={s.id} style={row}>
              <div>
                <div style={{fontWeight:600}}>{s.name}</div>
                <div style={{opacity:.7, fontSize:13}}>{s.description || "-"}</div>
              </div>
              <div style={{display:"flex", alignItems:"center", gap:8}}>
                <div style={{minWidth:70, textAlign:"right"}}>${Number(s.price).toFixed(2)}</div>
                <button onClick={()=>order(s.id)} style={btn}>주문</button>
              </div>
            </div>
          ))}
          {items.length === 0 && <div style={{opacity:.8}}>등록된 서비스가 없습니다.</div>}
        </div>
        {msg && <p style={{marginTop:12, color:"#16a34a"}}>{msg}</p>}
      </div>
    </main>
  );
}

const wrap: React.CSSProperties = {minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#0b1220", color:"#e5e7eb", padding:16};
const card: React.CSSProperties = {width:"100%", maxWidth:720, background:"#111827", border:"1px solid #1f2937", borderRadius:12, padding:20};
const row: React.CSSProperties = {display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 0", borderBottom:"1px solid #1f2937"};
const btn: React.CSSProperties = {padding:"8px 10px", background:"#2563eb", color:"#fff", border:"none", borderRadius:8, cursor:"pointer"};
