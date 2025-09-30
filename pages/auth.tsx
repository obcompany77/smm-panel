// pages/auth.tsx
import { useState } from "react";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // ★ 핵심: 반드시 e.preventDefault() 해서 GET 이동을 막고 fetch(POST)로 보낸다
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    setLoading(true);
    try {
      const r = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data?.msg || "로그인 실패");
      localStorage.setItem("token", data.token);
      localStorage.setItem("user_id", data.userId);
      // 로그인 후 이동할 페이지
      window.location.href = "/services";
    } catch (err: any) {
      setMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: "72px auto", color: "#e2e8f0" }}>
      <h1 style={{ marginBottom: 16 }}>로그인</h1>
      <form onSubmit={onSubmit}>
        <input
          type="email"
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ display: "block", width: "100%", marginBottom: 10, padding: 10 }}
        />
        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ display: "block", width: "100%", marginBottom: 12, padding: 10 }}
        />
        <button type="submit" disabled={loading} style={{ padding: "10px 16px" }}>
          {loading ? "로그인 중..." : "로그인"}
        </button>
      </form>
      {msg && <p style={{ color: "#f87171", marginTop: 12 }}>{msg}</p>}
    </div>
  );
}
