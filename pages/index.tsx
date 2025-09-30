// pages/index.tsx
import { useEffect, useState } from "react";

export default function Home() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const t = localStorage.getItem("token");
    setToken(t);
  }, []);

  function logout() {
    localStorage.removeItem("token");
    location.href = "/auth";
  }

  return (
    <main style={wrap}>
      <div style={card}>
        <h1>SMM Panel — 대시보드</h1>
        {token ? (
          <>
            <p style={{marginTop:8, opacity:.8}}>로그인됨</p>
            <div style={{display:"flex", gap:8, marginTop:16}}>
              <a style={btn} href="/services">서비스 주문하기</a>
              <button style={btnOutline} onClick={logout}>로그아웃</button>
            </div>
          </>
        ) : (
          <>
            <p style={{marginTop:8, opacity:.8}}>로그인이 필요합니다.</p>
            <a style={btn} href="/auth">로그인/가입</a>
          </>
        )}
      </div>
    </main>
  );
}

const wrap: React.CSSProperties = {minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#0b1220", color:"#e5e7eb"};
const card: React.CSSProperties = {width:"100%", maxWidth:560, background:"#111827", border:"1px solid #1f2937", borderRadius:12, padding:20};
const btn: React.CSSProperties = {padding:"10px 12px", background:"#2563eb", color:"#fff", border:"none", borderRadius:8, textDecoration:"none"};
const btnOutline: React.CSSProperties = {padding:"10px 12px", background:"transparent", color:"#e5e7eb", border:"1px solid #334155", borderRadius:8, cursor:"pointer"};
