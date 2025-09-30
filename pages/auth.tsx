import { useState } from "react";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const resetMsg = () => setMsg(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMsg();
    setLoading(true);

    try {
      if (mode === "signup") {
        // 회원가입: POST /api/auth/signup
        const res = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, name }),
        });
        const data = await res.json();
        if (!res.ok) {
          setMsg(`가입 실패: ${data.msg || res.status}`);
        } else {
          setMsg(data.msg || "가입 완료");
          // 가입 후 로그인 탭으로 전환
          setMode("login");
        }
      } else {
        // 로그인: POST /api/auth/login
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) {
          setMsg(`로그인 실패: ${data.msg || res.status}`);
        } else {
          // 토큰 저장 후 메인으로
          if (data.token) localStorage.setItem("token", data.token);
          setMsg("로그인 성공");
          window.location.href = "/"; // 원하는 페이지로 변경 가능
        }
      }
    } catch (err: any) {
      setMsg(`요청 오류: ${err?.message || "알 수 없음"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrap}>
      <div style={styles.card}>
        <h1 style={{ marginBottom: 16 }}>SMM Panel</h1>

        <div style={styles.tabs}>
          <button
            onClick={() => { setMode("signup"); resetMsg(); }}
            style={{ ...styles.tabBtn, ...(mode === "signup" ? styles.tabActive : {}) }}
          >
            회원가입
          </button>
          <button
            onClick={() => { setMode("login"); resetMsg(); }}
            style={{ ...styles.tabBtn, ...(mode === "login" ? styles.tabActive : {}) }}
          >
            로그인
          </button>
        </div>

        <form onSubmit={onSubmit} style={{ marginTop: 16 }}>
          {mode === "signup" && (
            <div style={styles.field}>
              <label style={styles.label}>이름(선택)</label>
              <input
                style={styles.input}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="홍길동 (선택)"
              />
            </div>
          )}

          <div style={styles.field}>
            <label style={styles.label}>이메일</label>
            <input
              style={styles.input}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>비밀번호</label>
            <input
              style={styles.input}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호"
              required
            />
          </div>

          <button type="submit" disabled={loading} style={styles.submit}>
            {loading ? "처리중..." : mode === "signup" ? "가입하기" : "로그인"}
          </button>
        </form>

        {msg && <p style={{ marginTop: 12, color: "#16a34a" }}>{msg}</p>}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrap: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#0b1220",
    color: "#e5e7eb",
    padding: 16,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    background: "#111827",
    border: "1px solid #1f2937",
    borderRadius: 12,
    padding: 20,
    boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
  },
  tabs: {
    display: "flex",
    gap: 8,
    background: "#0f172a",
    padding: 6,
    borderRadius: 8,
  },
  tabBtn: {
    flex: 1,
    background: "transparent",
    color: "#9ca3af",
    border: "none",
    padding: "10px 8px",
    borderRadius: 6,
    cursor: "pointer",
  },
  tabActive: {
    background: "#1f2937",
    color: "#fff",
  },
  field: { marginTop: 12 },
  label: { display: "block", marginBottom: 6, color: "#9ca3af", fontSize: 13 },
  input: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid #374151",
    background: "#0b1220",
    color: "#e5e7eb",
    outline: "none",
  },
  submit: {
    width: "100%",
    marginTop: 16,
    padding: "10px 12px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
  },
};
