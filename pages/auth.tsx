import { useState } from "react";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    setLoading(true);
    try {
      const path = mode === "signup" ? "/api/auth/signup" : "/api/auth/login";
      const body =
        mode === "signup" ? { email, password, name } : { email, password };

      const res = await fetch(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) setMsg(`오류: ${res.status} ${data.msg || ""}`);
      else {
        setMsg(data.msg || (mode === "signup" ? "가입 완료" : "로그인 성공"));
        if (data.token) {
          localStorage.setItem("token", data.token);
          location.href = "/";
        }
        if (mode === "signup") setMode("login");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={wrap}>
      <div style={card}>
        <h1>SMM Panel</h1>
        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <button
            onClick={() => setMode("signup")}
            style={{ ...tab, ...(mode === "signup" ? tabOn : {}) }}
          >
            회원가입
          </button>
          <button
            onClick={() => setMode("login")}
            style={{ ...tab, ...(mode === "login" ? tabOn : {}) }}
          >
            로그인
          </button>
        </div>

        <form onSubmit={onSubmit} style={{ marginTop: 16 }}>
          {mode === "signup" && (
            <div style={field}>
              <label style={label}>이름(선택)</label>
              <input style={input} value={name} onChange={e=>setName(e.target.value)} />
            </div>
          )}
          <div style={field}>
            <label style={label}>이메일</label>
            <input style={input} type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
          </div>
          <div style={field}>
            <label style={label}>비밀번호</label>
            <input style={input} type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
          </div>
          <button type="submit" disabled={loading} style={submit}>
            {loading ? "처리중..." : mode === "signup" ? "가입" : "로그인"}
          </button>
        </form>

        {msg && <p style={{ marginTop: 10, color: "#16a34a" }}>{msg}</p>}
      </div>
    </div>
  );
}

const wrap: React.CSSProperties = { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background:"#0b1220", color:"#e5e7eb", padding:16 };
const card: React.CSSProperties = { width:"100%", maxWidth:420, background:"#111827", border:"1px solid #1f2937", borderRadius:12, padding:20 };
const tab: React.CSSProperties = { flex:1, background:"#0f172a", color:"#9ca3af", border:"1px solid #1f2937", borderRadius:6, padding:"8px 10px", cursor:"pointer" };
const tabOn: React.CSSProperties = { background:"#1f2937", color:"#fff" };
const field: React.CSSProperties = { marginTop:12 };
const label: React.CSSProperties = { display:"block", marginBottom:6, fontSize:13, color:"#9ca3af" };
const input: React.CSSProperties = { width:"100%", padding:"10px 12px", borderRadius:8, border:"1px solid #374151", background:"#0b1220", color:"#e5e7eb" };
const submit: React.CSSProperties = { width:"100%", marginTop:16, padding:"10px 12px", background:"#2563eb", color:"#fff", border:"none", borderRadius:8, cursor:"pointer" };
