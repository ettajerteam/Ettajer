"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { OrderDetailView } from "@/components/orders/order-detail-view";
import type { OrderDetail } from "@/types/orders";
import type { TicketPrinter } from "@/lib/ticket-printers";

interface OrderDetailClientProps {
  orderId: string;
  initialOrder: OrderDetail;
  currency: string;
  ticketPrinters: TicketPrinter[];
}

export function OrderDetailClient({
  orderId,
  initialOrder,
  currency,
  ticketPrinters,
}: OrderDetailClientProps) {
  const [order, setOrder] = useState(initialOrder);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`);
      const data = await res.json();
      if (res.ok) setOrder(data.order);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    setOrder(initialOrder);
  }, [initialOrder]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="premium-card flex items-center gap-3 px-6 py-4 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin text-[#007AFF]" />
          Refreshing order details...
        </div>
      </div>
    );
  }

  return (
    <OrderDetailView
      order={order}
      currency={currency}
      ticketPrinters={ticketPrinters}
      onRefresh={refresh}
    />
  );
}
