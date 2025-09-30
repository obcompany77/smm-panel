// pages/auth.tsx  (로그인 페이지 파일에 그대로 붙여넣기)
// 파일 이름이 login.tsx 라면 파일 최상단 주석만 바꾸고 내용은 동일하게 쓰면 됩니다.

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/router';

export default function AuthPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState<string>('');

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setMsg('');

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    // 실패/빈 바디 대비: 안전하게 파싱
    let data: any = {};
    try {
      data = await res.json();
    } catch {
      data = {};
    }

    if (!res.ok || !data?.ok) {
      setMsg(data?.msg || `로그인 실패 (${res.status})`);
      return;
    }

    // 최소 토큰 저장 (MVP)
    localStorage.setItem('token', data.token);
    // 필요하면 사용자 정보도: localStorage.setItem('me', JSON.stringify(data.user));

    router.push('/'); // 홈으로 이동
  }

  return (
    <div style={{ maxWidth: 420, margin: '60px auto', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>로그인</h1>

      <form onSubmit={handleLogin} style={{ display: 'grid', gap: 12 }}>
        <input
          type="email"
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: 10, border: '1px solid #ccc', borderRadius: 8 }}
          required
        />
        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ padding: 10, border: '1px solid #ccc', borderRadius: 8 }}
          required
        />
        <button
          type="submit"
          style={{
            padding: 12,
            borderRadius: 10,
            border: 0,
            background: '#2563eb',
            color: '#fff',
            fontWeight: 600,
          }}
        >
          로그인
        </button>
      </form>

      {msg && (
        <p style={{ color: '#e11d48', marginTop: 12 }}>
          {msg}
        </p>
      )}
    </div>
  );
}
