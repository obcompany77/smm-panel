# Project Structure

```
smm-panel/
├─ package.json
├─ next.config.mjs
├─ tsconfig.json
├─ .env.local        # (local only; on Vercel use Project Settings → Environment Variables)
├─ lib/
│  ├─ supabaseClient.ts
│  └─ serverSupabase.ts
├─ pages/
│  ├─ _app.tsx
│  ├─ index.tsx
│  ├─ auth.tsx
│  ├─ services.tsx
│  ├─ order.tsx
│  ├─ deposit.tsx
│  ├─ admin.tsx
│  └─ api/
│     ├─ auth-user.ts
│     ├─ services.ts
│     ├─ wallet.ts
│     ├─ deposit.ts
│     └─ order.ts
├─ public/
│  └─ logo.svg
└─ README.md
```

---

## package.json
```json
{
  "name": "smm-panel",
  "private": true,
  "version": "0.1.0",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "14.2.5",
    "react": "18.3.1",
    "react-dom": "18.3.1",
    "@supabase/supabase-js": "2.45.4",
    "swr": "2.2.5"
  },
  "devDependencies": {
    "@types/node": "20.14.9",
    "@types/react": "18.3.3",
    "@types/react-dom": "18.3.0",
    "typescript": "5.5.4"
  }
}
```

## next.config.mjs
```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};
export default nextConfig;
```

## tsconfig.json
```json
{
  "compilerOptions": {
    "target": "es2020",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
```

## lib/supabaseClient.ts
```ts
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```

## lib/serverSupabase.ts
```ts
import { createClient } from "@supabase/supabase-js";

export function supabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!; // Server only
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

export async function getUserFromAuthHeader(req: Request | any) {
  const authHeader = req.headers?.authorization || req.headers?.get?.("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : undefined;
  if (!token) return null;
  const admin = supabaseAdmin();
  // Validate and get user
  const { data } = await admin.auth.getUser(token);
  return data.user ?? null;
}
```

## pages/_app.tsx
```tsx
import type { AppProps } from "next/app";
import Link from "next/link";
import "./globals.css";

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <div style={{ fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif" }}>
      <nav style={{ display: "flex", gap: 16, padding: 16, borderBottom: "1px solid #eee" }}>
        <Link href="/">대시보드</Link>
        <Link href="/services">서비스</Link>
        <Link href="/order">주문</Link>
        <Link href="/deposit">입금</Link>
        <Link href="/admin">관리자</Link>
        <span style={{ marginLeft: "auto" }}><Link href="/auth">로그인/계정</Link></span>
      </nav>
      <main style={{ maxWidth: 960, margin: "24px auto", padding: "0 16px" }}>
        <Component {...pageProps} />
      </main>
    </div>
  );
}
```

## pages/index.tsx (대시보드)
```tsx
import useSWR from "swr";
import { supabase } from "@/lib/supabaseClient";

const fetcher = (url: string, token: string) => fetch(url, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json());

export default function Home() {
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState<string>("");
  const { data } = useSWR(token ? ["/api/wallet", token] : null, ([url, t]) => fetcher(url, t));
  const { data: orders } = useSWR(token ? ["/api/order?recent=1", token] : null, ([url, t]) => fetcher(url, t));

  async function init() {
    const s = await supabase.auth.getSession();
    setToken(s.data.session?.access_token ?? null);
    const u = await supabase.auth.getUser();
    setEmail(u.data.user?.email ?? "");
  }

  React.useEffect(() => { init(); }, []);

  return (
    <div>
      <h1>대시보드</h1>
      <p>계정: {email || "로그인 필요"}</p>
      <div style={{ display: "flex", gap: 16 }}>
        <div style={{ border: "1px solid #eee", padding: 16, borderRadius: 8 }}>
          <b>지갑 잔액</b>
          <div style={{ fontSize: 24 }}>{data?.balance ?? "-"} 원</div>
        </div>
        <div style={{ border: "1px solid #eee", padding: 16, borderRadius: 8, flex: 1 }}>
          <b>최근 주문</b>
          <ul>
            {(orders?.items ?? []).map((o: any) => (
              <li key={o.id}>#{o.id} • {o.status} • {o.cost}원</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
import React, { useState } from "react";
```

## pages/auth.tsx
```tsx
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserEmail(data.user?.email ?? null));
  }, []);

  async function signInEmail() {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
    else location.href = "/";
  }
  async function signUpEmail() {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) alert(error.message);
    else alert("가입 완료! 이메일을 확인하세요.");
  }
  async function signInGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({ provider: "google" });
    if (error) alert(error.message);
  }
  async function signOut() { await supabase.auth.signOut(); location.reload(); }

  return (
    <div>
      <h1>로그인 / 계정</h1>
      {userEmail ? (
        <>
          <p>현재 로그인: {userEmail}</p>
          <button onClick={signOut}>로그아웃</button>
        </>
      ) : (
        <div style={{ display: "grid", gap: 8, maxWidth: 360 }}>
          <input placeholder="이메일" value={email} onChange={e=>setEmail(e.target.value)} />
          <input placeholder="비밀번호" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
          <button onClick={signInEmail}>이메일 로그인</button>
          <button onClick={signUpEmail}>이메일 가입</button>
          <hr />
          <button onClick={signInGoogle}>구글로 로그인</button>
        </div>
      )}
    </div>
  );
}
```

## pages/services.tsx
```tsx
import useSWR from "swr";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const fetcher = (url: string, token: string) => fetch(url, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json());

export default function Services() {
  const [token, setToken] = useState<string | null>(null);
  useEffect(() => { supabase.auth.getSession().then(s => setToken(s.data.session?.access_token ?? null)); }, []);
  const { data } = useSWR(token ? ["/api/services", token] : null, ([u,t]) => fetcher(u,t));

  return (
    <div>
      <h1>서비스</h1>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr><th align="left">카테고리</th><th align="left">서비스</th><th>단가(1000)</th><th>최소/최대</th></tr>
        </thead>
        <tbody>
          {(data?.items ?? []).map((s: any) => (
            <tr key={s.id} style={{ borderTop: "1px solid #eee" }}>
              <td>{s.category}</td>
              <td>{s.name}</td>
              <td align="center">{s.rate_per_1000}</td>
              <td align="center">{s.min}~{s.max}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

## pages/order.tsx
```tsx
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function OrderPage() {
  const [token, setToken] = useState<string | null>(null);
  const [serviceId, setServiceId] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(100);
  const [link, setLink] = useState<string>("");
  const [services, setServices] = useState<any[]>([]);
  const [cost, setCost] = useState<number>(0);

  useEffect(() => {
    supabase.auth.getSession().then(s => setToken(s.data.session?.access_token ?? null));
    // fetch services
    (async () => {
      const t = (await supabase.auth.getSession()).data.session?.access_token;
      const r = await fetch("/api/services", { headers: { Authorization: `Bearer ${t}` } });
      const j = await r.json(); setServices(j.items ?? []);
    })();
  }, []);

  useEffect(() => {
    const svc = services.find(s => String(s.id) === String(serviceId));
    if (svc) setCost(Math.ceil((svc.rate_per_1000 * quantity) / 1000));
  }, [serviceId, quantity, services]);

  async function submit() {
    if (!token) return alert("로그인이 필요합니다");
    const r = await fetch("/api/order", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ serviceId, link, quantity }) });
    const j = await r.json();
    if (!r.ok) return alert(j.error || "에러");
    alert(`주문 완료! 공급사 주문번호: ${j.provider_order_id}`);
  }

  return (
    <div>
      <h1>주문</h1>
      <div style={{ display: "grid", gap: 8, maxWidth: 480 }}>
        <select value={serviceId} onChange={e=>setServiceId(e.target.value)}>
          <option value="">서비스 선택</option>
          {services.map(s => <option key={s.id} value={s.id}>{s.category} / {s.name}</option>)}
        </select>
        <input placeholder="링크(URL)" value={link} onChange={e=>setLink(e.target.value)} />
        <input type="number" placeholder="수량" value={quantity} onChange={e=>setQuantity(Number(e.target.value))} />
        <div>예상 비용: <b>{cost}</b> 원</div>
        <button onClick={submit}>주문하기</button>
      </div>
    </div>
  );
}
```

## pages/deposit.tsx
```tsx
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function DepositPage() {
  const [token, setToken] = useState<string | null>(null);
  const [amount, setAmount] = useState<number>(10000);
  const [method, setMethod] = useState<string>("bank");
  const [receiptUrl, setReceiptUrl] = useState<string>("");

  useEffect(() => { supabase.auth.getSession().then(s => setToken(s.data.session?.access_token ?? null)); }, []);

  async function submit() {
    const r = await fetch("/api/deposit", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ amount, method, receipt_url: receiptUrl }) });
    const j = await r.json();
    if (!r.ok) return alert(j.error || "에러");
    alert("입금요청 접수! 관리자 확인 후 충전됩니다.");
  }

  return (
    <div>
      <h1>입금/충전</h1>
      <p>안내: 무통장/카카오/토스 송금 후 영수증 URL을 남겨주세요.</p>
      <div style={{ display: "grid", gap: 8, maxWidth: 420 }}>
        <input type="number" value={amount} onChange={e=>setAmount(Number(e.target.value))} />
        <select value={method} onChange={e=>setMethod(e.target.value)}>
          <option value="bank">무통장(계좌)</option>
          <option value="kakao">카카오 송금</option>
          <option value="toss">토스 송금</option>
        </select>
        <input placeholder="영수증/송금내역 이미지 URL" value={receiptUrl} onChange={e=>setReceiptUrl(e.target.value)} />
        <button onClick={submit}>충전 요청</button>
      </div>
    </div>
  );
}
```

## pages/admin.tsx (아주 간단한 승인 UI – 관리자만 사용)
```tsx
import { useEffect, useState } from "react";
import useSWR from "swr";
import { supabase } from "@/lib/supabaseClient";

const fetcher = (url: string, token: string) => fetch(url, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json());

export default function AdminPage() {
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<string>("user");
  useEffect(() => {
    (async () => {
      const s = await supabase.auth.getSession();
      setToken(s.data.session?.access_token ?? null);
      const r = await fetch("/api/auth-user", { headers: { Authorization: `Bearer ${s.data.session?.access_token}` } });
      const j = await r.json();
      setRole(j.role);
    })();
  }, []);

  const { data: deposits, mutate } = useSWR(token && role === "admin" ? ["/api/deposit", token] : null, ([u,t]) => fetcher(u,t));

  async function approve(id: number) {
    await fetch("/api/deposit?id=" + id + "&action=approve", { method: "POST", headers: { Authorization: `Bearer ${token}` } });
    mutate();
  }
  async function reject(id: number) {
    await fetch("/api/deposit?id=" + id + "&action=reject", { method: "POST", headers: { Authorization: `Bearer ${token}` } });
    mutate();
  }

  if (role !== "admin") return <p>관리자만 접근 가능합니다.</p>;

  return (
    <div>
      <h1>관리자: 입금 승인</h1>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead><tr><th>ID</th><th>유저</th><th>금액</th><th>방법</th><th>영수증</th><th>상태</th><th>액션</th></tr></thead>
        <tbody>
          {(deposits?.items ?? []).map((d: any) => (
            <tr key={d.id} style={{ borderTop: "1px solid #eee" }}>
              <td>#{d.id}</td>
              <td>{d.user_email}</td>
              <td>{d.amount}</td>
              <td>{d.method}</td>
              <td><a href={d.receipt_url} target="_blank">보기</a></td>
              <td>{d.status}</td>
              <td>
                {d.status === "pending" && (
                  <>
                    <button onClick={() => approve(d.id)}>승인</button>
                    <button onClick={() => reject(d.id)} style={{ marginLeft: 8 }}>거절</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

## pages/api/auth-user.ts
```ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getUserFromAuthHeader, supabaseAdmin } from "@/lib/serverSupabase";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await getUserFromAuthHeader(req);
  if (!user) return res.status(401).json({ error: "unauthorized" });
  const admin = supabaseAdmin();
  const { data } = await admin.from("users").select("email, role").eq("id", user.id).single();
  res.json({ email: data?.email ?? user.email, role: data?.role ?? "user" });
}
```

## pages/api/services.ts
```ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getUserFromAuthHeader, supabaseAdmin } from "@/lib/serverSupabase";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await getUserFromAuthHeader(req);
  if (!user) return res.status(401).json({ error: "unauthorized" });
  const db = supabaseAdmin();

  if (req.method === "GET") {
    const { data, error } = await db.from("services").select("*").eq("enabled", true).order("category");
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ items: data });
  }

  // (선택) 관리자만 POST로 서비스 추가
  if (req.method === "POST") {
    const { data: me } = await db.from("users").select("role").eq("id", user.id).single();
    if (me?.role !== "admin") return res.status(403).json({ error: "forbidden" });
    const { name, category, rate_per_1000, min, max, provider_service_id } = req.body;
    const { error } = await db.from("services").insert({ name, category, rate_per_1000, min, max, provider_service_id });
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ ok: true });
  }

  res.setHeader("Allow", "GET,POST");
  res.status(405).end("Method Not Allowed");
}
```

## pages/api/wallet.ts
```ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getUserFromAuthHeader, supabaseAdmin } from "@/lib/serverSupabase";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await getUserFromAuthHeader(req);
  if (!user) return res.status(401).json({ error: "unauthorized" });
  const db = supabaseAdmin();
  const { data } = await db.from("wallets").select("balance").eq("user_id", user.id).single();
  res.json({ balance: data?.balance ?? 0 });
}
```

## pages/api/deposit.ts
```ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getUserFromAuthHeader, supabaseAdmin } from "@/lib/serverSupabase";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await getUserFromAuthHeader(req);
  if (!user) return res.status(401).json({ error: "unauthorized" });
  const db = supabaseAdmin();

  if (req.method === "POST") {
    const { amount, method, receipt_url } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ error: "invalid amount" });
    const { error } = await db.from("deposits").insert({ user_id: user.id, amount, method, receipt_url });
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ ok: true });
  }

  if (req.method === "GET") {
    // 관리자 목록 보기
    const { data: me } = await db.from("users").select("role, email").eq("id", user.id).single();
    if (me?.role !== "admin") return res.status(403).json({ error: "forbidden" });
    const { data, error } = await db.rpc("admin_list_deposits_with_user");
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ items: data });
  }

  if (req.method === "POST" && (req.query.action === "approve" || req.query.action === "reject")) {
    // not reached; Next.js routes treat query+method same; kept for clarity
  }

  if (req.method === "POST" && req.query.action) {
    const action = String(req.query.action);
    const id = Number(req.query.id);
    const { data: me } = await db.from("users").select("role").eq("id", user.id).single();
    if (me?.role !== "admin") return res.status(403).json({ error: "forbidden" });

    if (action === "approve") {
      // 1) 상태 업데이트
      const { data: dep } = await db.from("deposits").update({ status: "approved" }).eq("id", id).select("user_id, amount").single();
      if (dep) {
        // 2) 잔액 증가 & 거래내역 기록
        await db.rpc("increase_balance", { uid: dep.user_id, amt: dep.amount });
        await db.from("transactions").insert({ user_id: dep.user_id, amount: dep.amount, type: "credit", memo: `deposit:${id}` });
      }
      return res.json({ ok: true });
    }
    if (action === "reject") {
      await db.from("deposits").update({ status: "rejected" }).eq("id", id);
      return res.json({ ok: true });
    }
  }

  res.setHeader("Allow", "GET,POST");
  res.status(405).end("Method Not Allowed");
}
```

## pages/api/order.ts
```ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getUserFromAuthHeader, supabaseAdmin } from "@/lib/serverSupabase";

async function createProviderOrder(service_provider_id: string, link: string, quantity: number) {
  // 실제 공급사 API가 없으면 로컬 모드로 동작
  if (!process.env.SMM_API_URL || !process.env.SMM_API_KEY) {
    return { order: `LOCAL-${Date.now()}` };
  }
  const r = await fetch(process.env.SMM_API_URL + "/order", {
    method: "POST",
    headers: { "Content-Type": "application/json", "API-KEY": process.env.SMM_API_KEY },
    body: JSON.stringify({ service: service_provider_id, link, quantity })
  });
  const j = await r.json();
  return j; // {order: "..."}
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await getUserFromAuthHeader(req);
  if (!user) return res.status(401).json({ error: "unauthorized" });
  const db = supabaseAdmin();

  if (req.method === "GET" && req.query.recent) {
    const { data } = await db.from("orders").select("id, status, cost").eq("user_id", user.id).order("created_at", { ascending: false }).limit(5);
    return res.json({ items: data ?? [] });
  }

  if (req.method === "POST") {
    const { serviceId, link, quantity } = req.body as { serviceId: number; link: string; quantity: number };
    if (!serviceId || !link || !quantity) return res.status(400).json({ error: "missing fields" });

    // 서비스 조회
    const { data: service } = await db.from("services").select("id, rate_per_1000, provider_service_id").eq("id", serviceId).single();
    if (!service) return res.status(400).json({ error: "invalid service" });

    const cost = Math.ceil((service.rate_per_1000 * quantity) / 1000);

    // 지갑 확인
    const { data: wallet } = await db.from("wallets").select("balance").eq("user_id", user.id).single();
    if ((wallet?.balance ?? 0) < cost) return res.status(400).json({ error: "잔액 부족" });

    // 공급사 발주
    const pr = await createProviderOrder(service.provider_service_id ?? "", link, quantity);

    // 주문/거래 기록 + 잔액 차감
    await db.from("orders").insert({ user_id: user.id, service_id: serviceId, link, quantity, cost, provider_order_id: pr.order, status: "processing" });
    await db.from("transactions").insert({ user_id: user.id, amount: -cost, type: "debit", memo: `order:${pr.order}` });
    await db.rpc("decrease_balance", { uid: user.id, amt: cost });

    return res.json({ ok: true, provider_order_id: pr.order });
  }

  res.setHeader("Allow", "GET,POST");
  res.status(405).end("Method Not Allowed");
}
```

## public/logo.svg
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 40"><text x="0" y="28" font-size="28" font-family="Arial" fill="#111">SMM Panel</text></svg>
```

## pages/globals.css
```css
html,body{margin:0;padding:0}
button{padding:8px 12px;border:1px solid #ddd;background:#111;color:#fff;border-radius:6px;cursor:pointer}
input,select{padding:8px;border:1px solid #ddd;border-radius:6px}
hr{border:none;border-top:1px solid #eee}
```

## README.md
```md
# SMM Panel – Next.js + Supabase Starter

## 환경변수
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY (서버 전용)
- SMM_API_URL (선택)
- SMM_API_KEY (선택)

## 로컬 실행
```bash
pnpm i # 또는 npm i / yarn
pnpm dev
```

## 배포
Vercel에 이 리포를 Import → Env 변수 설정 → Deploy
```
```

---

# 📌 Supabase SQL (DB 스키마)
아래를 Supabase SQL Editor에서 실행하세요.

```sql
create table if not exists users (
  id uuid primary key default auth.uid(),
  email text unique,
  name text,
  role text default 'user',
  created_at timestamp default now()
);
create table if not exists wallets (
  user_id uuid primary key references users(id) on delete cascade,
  balance integer default 0
);
create table if not exists transactions (
  id bigserial primary key,
  user_id uuid references users(id) on delete cascade,
  amount integer not null,
  type text not null,
  memo text,
  created_at timestamp default now()
);
create table if not exists services (
  id bigserial primary key,
  provider_service_id text,
  name text,
  category text,
  rate_per_1000 integer not null,
  min integer,
  max integer,
  enabled boolean default true,
  metadata jsonb default '{}'::jsonb
);
create table if not exists orders (
  id bigserial primary key,
  user_id uuid references users(id) on delete set null,
  service_id bigint references services(id) on delete set null,
  link text,
  quantity integer,
  cost integer,
  provider_order_id text,
  status text default 'processing',
  created_at timestamp default now(),
  updated_at timestamp default now()
);
create table if not exists deposits (
  id bigserial primary key,
  user_id uuid references users(id) on delete cascade,
  amount integer not null,
  method text,
  receipt_url text,
  status text default 'pending',
  created_at timestamp default now()
);
create or replace function increase_balance(uid uuid, amt int)
returns void language sql as $$
  update wallets set balance = balance + amt where user_id = uid;
$$;
create or replace function decrease_balance(uid uuid, amt int)
returns void language sql as $$
  update wallets set balance = balance - amt where user_id = uid and balance >= amt;
$$;
-- 관리자용: 입금요청 + 유저 이메일 join 뷰/함수
create or replace view admin_deposits_v as
select d.*, u.email as user_email
from deposits d
join users u on u.id = d.user_id
order by d.created_at desc;
create or replace function admin_list_deposits_with_user()
returns setof admin_deposits_v language sql as $$
  select * from admin_deposits_v;
$$;
