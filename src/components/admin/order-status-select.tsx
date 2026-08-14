"use client";

import { useState, useTransition } from "react";
import { updateOrderStatus } from "@/lib/actions/orders";
import { ORDER_STATUSES, ORDER_STATUS_LABELS } from "@/lib/constants";
import type { OrderStatus } from "@/lib/constants";

export function OrderStatusSelect({ orderId, status }: { orderId: string; status: OrderStatus }) {
  const [current, setCurrent] = useState(status);
  const [pending, startTransition] = useTransition();

  return (
    <select
      value={current}
      disabled={pending}
      onChange={(e) => {
        const next = e.target.value as OrderStatus;
        setCurrent(next);
        startTransition(async () => {
          await updateOrderStatus(orderId, next);
        });
      }}
      className="rounded-full border border-[var(--color-line)] bg-[var(--color-paper-raised)] px-3 py-2 text-sm font-medium"
    >
      {ORDER_STATUSES.map((s) => (
        <option key={s} value={s}>
          {ORDER_STATUS_LABELS[s]}
        </option>
      ))}
    </select>
  );
}
