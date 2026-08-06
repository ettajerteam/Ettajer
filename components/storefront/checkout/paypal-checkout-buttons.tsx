"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type PaypalButtonsProps = {
  clientId: string;
  currency: string;
  disabled?: boolean;
  className?: string;
  createOrder: () => Promise<string>;
  onApprove: (paypalOrderId: string) => Promise<void>;
  onError?: (message: string) => void;
};

declare global {
  interface Window {
    paypal?: {
      Buttons: (config: Record<string, unknown>) => {
        render: (el: HTMLElement) => Promise<void>;
        close?: () => Promise<void>;
      };
    };
  }
}

function loadPaypalSdk(clientId: string, currency: string): Promise<void> {
  const existing = document.querySelector<HTMLScriptElement>(
    `script[data-paypal-sdk="${clientId}"]`
  );
  if (existing && window.paypal) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(
      clientId
    )}&currency=${encodeURIComponent(currency.toUpperCase())}&intent=capture`;
    script.async = true;
    script.dataset.paypalSdk = clientId;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Could not load PayPal"));
    document.body.appendChild(script);
  });
}

/** Renders official PayPal Smart Buttons for a merchant Client ID. */
export function PaypalCheckoutButtons({
  clientId,
  currency,
  disabled,
  className,
  createOrder,
  onApprove,
  onError,
}: PaypalButtonsProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const callbacks = useRef({ createOrder, onApprove, onError, disabled });
  callbacks.current = { createOrder, onApprove, onError, disabled };

  useEffect(() => {
    let cancelled = false;
    let buttons: {
      render: (el: HTMLElement) => Promise<void>;
      close?: () => Promise<void>;
    } | null = null;

    async function mount() {
      setLoading(true);
      setError(null);
      try {
        await loadPaypalSdk(clientId, currency);
        if (cancelled || !hostRef.current || !window.paypal) return;

        hostRef.current.innerHTML = "";
        buttons = window.paypal.Buttons({
          style: {
            layout: "vertical",
            color: "gold",
            shape: "rect",
            label: "paypal",
          },
          onClick: (_data: unknown, actions: { reject: () => void; resolve: () => void }) => {
            if (callbacks.current.disabled) return actions.reject();
            return actions.resolve();
          },
          createOrder: async () => {
            const id = await callbacks.current.createOrder();
            if (!id) throw new Error("Missing PayPal order id");
            return id;
          },
          onApprove: async (data: { orderID: string }) => {
            await callbacks.current.onApprove(data.orderID);
          },
          onError: (err: unknown) => {
            const message =
              err instanceof Error ? err.message : "PayPal checkout failed";
            callbacks.current.onError?.(message);
          },
          onCancel: () => {
            callbacks.current.onError?.("PayPal payment was cancelled");
          },
        });
        await buttons.render(hostRef.current);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "PayPal failed to load");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void mount();
    return () => {
      cancelled = true;
      void buttons?.close?.();
    };
  }, [clientId, currency]);

  return (
    <div className={cn("relative min-h-[48px]", className)}>
      {loading ? (
        <div className="flex items-center justify-center gap-2 py-4 text-sm text-neutral-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading PayPal…
        </div>
      ) : null}
      {error ? (
        <p className="rounded-xl bg-amber-50 px-4 py-3 text-[13px] font-medium text-amber-900">
          {error}
        </p>
      ) : null}
      <div
        ref={hostRef}
        className={cn(loading && "invisible absolute inset-x-0 top-0")}
      />
    </div>
  );
}
