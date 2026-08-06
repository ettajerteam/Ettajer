"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { OrderDetailView } from "@/components/orders/order-detail-view";
import type { OrderDetail } from "@/types/orders";
import { cn } from "@/lib/utils";

interface OrderDetailClientProps {
  orderId: string;
  initialOrder: OrderDetail;
  currency: string;
}

export function OrderDetailClient({
  orderId,
  initialOrder,
  currency,
}: OrderDetailClientProps) {
  const [order, setOrder] = useState(initialOrder);
  const [pending, startTransition] = useTransition();

  const refresh = useCallback(() => {
    startTransition(async () => {
      const res = await fetch(`/api/orders/${orderId}`);
      const data = await res.json();
      if (res.ok) setOrder(data.order);
    });
  }, [orderId]);

  useEffect(() => {
    setOrder(initialOrder);
  }, [initialOrder]);

  return (
    <div className={cn(pending && "opacity-70 transition-opacity")}>
      <OrderDetailView order={order} currency={currency} onRefresh={refresh} />
    </div>
  );
}
