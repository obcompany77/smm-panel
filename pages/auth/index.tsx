import { useState } from "react";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [msg, setMsg] = useState<string>("");

  async function req(path: string, body: any) {
    setMsg("요청 중…");
    const res = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    setMsg(res.ok ? JSON.stringify(data, null, 2) : `오류: ${res.status} ${JSON.stringify(data)}`);
  }

  return (
    <div style={{maxWidth: 420, margin: "40px auto", fontFamily: "system-ui"}}>
      <h1>SMM Panel — 로그인/가입 테스트</h1>

      <div style={{border:"1px solid #333", borderRadius:12, padding:16, marginTop:20}}>
        <h2>회원가입</h2>
        <input placeholder="이름" value={name} onChange={e=>setName(e.target.value)} style={ipt}/>
        <input placeholder="이메일" value={email} onChange={e=>setEmail(e.target.value)} style={ipt}/>
        <input placeholder="비밀번호" type="password" value={password} onChange={e=>setPassword(e.target.value)} style={ipt}/>
        <button onClick={()=>req("/api/auth/signup", { email, password, name })} style={btn}>가입</button>
      </div>

      <div style={{border:"1px solid #333", borderRadius:12, padding:16, marginTop:16}}>
        <h2>로그인</h2>
        <input placeholder="이메일" value={email} onChange={e=>setEmail(e.target.value)} style={ipt}/>
        <input placeholder="비밀번호" type="password" value={password} onChange={e=>setPassword(e.target.value)} style={ipt}/>
        <button onClick={()=>req("/api/auth/login", { email, password })} style={btn}>로그인</button>
      </div>

      <pre style={{whiteSpace:"pre-wrap", background:"#111", color:"#0f0", padding:12, borderRadius:8, marginTop:16}}>
        {msg || "결과가 여기 표시됩니다."}
      </pre>
    </div>
  );
}

const ipt: React.CSSProperties = { width:"100%", padding:"10px 12px", margin:"6px 0", borderRadius:8, border:"1px solid #444", background:"#0b0b0b", color:"#fff" };
const btn: React.CSSProperties = { width:"100%", padding:"10px 12px", marginTop:8, borderRadius:8, border:"1px solid #444", background:"#222", color:"#fff", cursor:"pointer" };
