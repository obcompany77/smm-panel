import { useEffect, useState } from "react";
import { useRouter } from "next/router";

type Order = {
  id: number;
  service_id: number;
  cost: number;
  status: string;
  created_at: string;
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setMsg("로그인이 필요합니다.");
      router.push("/auth");
      return;
    }

    // 주문 내역 가져오기
    fetch("/api/orders", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setOrders(data);
        } else {
          setMsg("주문 내역을 불러오는 데 실패했습니다.");
        }
      })
      .catch(() => {
        setMsg("서버 오류로 주문 내역을 불러올 수 없습니다.");
      });
  }, [router]);

  return (
    <div>
      <h1>주문 내역</h1>
      {msg && <p>{msg}</p>}
      {orders.length > 0 ? (
        <ul>
          {orders.map((order) => (
            <li key={order.id}>
              서비스 ID: {order.service_id} | 비용: {order.cost} | 상태: {order.status} | 주문일:{" "}
              {new Date(order.created_at).toLocaleString()}
            </li>
          ))}
        </ul>
      ) : (
        !msg && <p>주문 내역이 없습니다.</p>
      )}
    </div>
  );
}
