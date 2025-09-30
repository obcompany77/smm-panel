import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function OrdersPage() {
  const [msg, setMsg] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setMsg("로그인이 필요합니다.");
      router.push("/auth"); // ✅ return "/auth" 대신 이렇게 실행
    }
  }, [router]);

  return (
    <div>
      <h1>주문 페이지</h1>
      {msg && <p>{msg}</p>}
    </div>
  );
}
