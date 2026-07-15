"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, Phone, MapPin, Printer, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { OrderTimeline } from "@/components/orders/order-timeline";
import { OrderStatusUpdate } from "@/components/orders/order-status-update";
import { OrderTicketPrinters } from "@/components/orders/order-ticket-printers";
import { formatCurrency } from "@/lib/utils";
import type { OrderDetail } from "@/types/orders";
import type { TicketPrinter } from "@/lib/ticket-printers";

interface OrderDetailViewProps {
  order: OrderDetail;
  currency: string;
  ticketPrinters: TicketPrinter[];
  onRefresh: () => void;
}

export function OrderDetailView({ order, currency, ticketPrinters, onRefresh }: OrderDetailViewProps) {
  const addr = order.shippingAddress;

  const handlePrintInvoice = () => {
    window.open(`/api/orders/${order.id}/invoice`, "_blank");
  };

  return (
    <div className="space-y-7">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/orders">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-semibold tracking-[-0.02em]">{order.orderNumber}</h2>
              <OrderStatusBadge status={order.status} />
            </div>
            <p className="text-sm text-muted-foreground">
              {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
        <Button variant="outline" className="h-10 rounded-xl" onClick={handlePrintInvoice}>
          <Printer className="h-4 w-4 mr-2" />
          Print invoice
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="premium-card p-6"
          >
            <h3 className="mb-5 text-lg font-semibold tracking-[-0.02em]">Items</h3>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 rounded-xl px-2 py-1.5 transition-colors hover:bg-muted/35">
                  <div className="relative h-16 w-16 rounded-xl overflow-hidden bg-muted border shrink-0">
                    {item.image ? (
                      <Image src={item.image} alt={item.title} fill className="object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-muted-foreground">—</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{item.title}</p>
                    {item.variant && (
                      <p className="text-xs text-muted-foreground">
                        {Object.entries(item.variant).map(([k, v]) => `${k}: ${v}`).join(" · ")}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-medium text-sm shrink-0">
                    {formatCurrency(item.price * item.quantity, currency)}
                  </p>
                </div>
              ))}
            </div>

            <Separator className="my-4" />

            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>{formatCurrency(order.subtotal, currency)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping</span>
                <span>{formatCurrency(order.shipping, currency)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-700">
                  <span>Discount{order.couponCode ? ` (${order.couponCode})` : ""}</span>
                  <span>−{formatCurrency(order.discount, currency)}</span>
                </div>
              )}
              <div className="flex justify-between text-muted-foreground">
                <span>Tax</span>
                <span>{formatCurrency(order.tax, currency)}</span>
              </div>
              <div className="flex justify-between font-semibold text-base pt-2">
                <span>Total</span>
                <span className="text-[#007AFF]">{formatCurrency(order.total, currency)}</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="premium-card p-6"
          >
            <h3 className="mb-5 text-lg font-semibold tracking-[-0.02em]">Customer</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <User className="h-4 w-4 text-muted-foreground shrink-0" />
                <span>{order.customerName}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                <a href={`mailto:${order.customerEmail}`} className="text-[#007AFF] hover:underline">
                  {order.customerEmail}
                </a>
              </div>
              {order.customerPhone && (
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span>{order.customerPhone}</span>
                </div>
              )}
              <div className="flex items-start gap-3 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p>{addr.street}</p>
                  <p>{addr.city}{addr.state ? `, ${addr.state}` : ""} {addr.postalCode}</p>
                  <p>{addr.country}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {(order.utmSource || order.utmMedium || order.utmCampaign) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 }}
              className="premium-card p-6"
            >
              <h3 className="mb-4 text-lg font-semibold tracking-[-0.02em]">Attribution</h3>
              <div className="grid gap-2 text-sm sm:grid-cols-2">
                {order.utmSource && (
                  <div>
                    <p className="text-xs text-muted-foreground">Source</p>
                    <p className="font-medium">{order.utmSource}</p>
                  </div>
                )}
                {order.utmMedium && (
                  <div>
                    <p className="text-xs text-muted-foreground">Medium</p>
                    <p className="font-medium">{order.utmMedium}</p>
                  </div>
                )}
                {order.utmCampaign && (
                  <div>
                    <p className="text-xs text-muted-foreground">Campaign</p>
                    <p className="font-medium">{order.utmCampaign}</p>
                  </div>
                )}
                {order.utmContent && (
                  <div>
                    <p className="text-xs text-muted-foreground">Content</p>
                    <p className="font-medium">{order.utmContent}</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>

        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="premium-card p-6"
          >
            <h3 className="mb-4 text-lg font-semibold tracking-[-0.02em]">Update status</h3>
            <OrderStatusUpdate
              orderId={order.id}
              currentStatus={order.status}
              onUpdated={onRefresh}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="premium-card p-6"
          >
            <h3 className="mb-4 text-lg font-semibold tracking-[-0.02em]">Order timeline</h3>
            <OrderTimeline currentStatus={order.status} history={order.statusHistory} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <OrderTicketPrinters order={order} printers={ticketPrinters} />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
