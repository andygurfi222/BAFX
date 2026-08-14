import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartLine = {
  productId: string;
  variantId?: string;
  name: string;
  variantLabel?: string;
  price: number;
  image?: string;
  slug: string;
  quantity: number;
  maxStock: number;
};

type CartState = {
  lines: CartLine[];
  isOpen: boolean;
  open: () => void;
  close: () => void;
  addItem: (line: Omit<CartLine, "quantity">, quantity?: number) => void;
  removeItem: (productId: string, variantId?: string) => void;
  setQuantity: (productId: string, variantId: string | undefined, quantity: number) => void;
  clear: () => void;
};

function lineKey(productId: string, variantId?: string) {
  return `${productId}::${variantId ?? ""}`;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      isOpen: false,
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      addItem: (line, quantity = 1) =>
        set((state) => {
          const key = lineKey(line.productId, line.variantId);
          const existing = state.lines.find(
            (l) => lineKey(l.productId, l.variantId) === key
          );
          if (existing) {
            const nextQty = Math.min(existing.quantity + quantity, existing.maxStock || 9999);
            return {
              lines: state.lines.map((l) =>
                lineKey(l.productId, l.variantId) === key
                  ? { ...l, quantity: nextQty }
                  : l
              ),
              isOpen: true,
            };
          }
          return {
            lines: [...state.lines, { ...line, quantity }],
            isOpen: true,
          };
        }),
      removeItem: (productId, variantId) =>
        set((state) => ({
          lines: state.lines.filter(
            (l) => lineKey(l.productId, l.variantId) !== lineKey(productId, variantId)
          ),
        })),
      setQuantity: (productId, variantId, quantity) =>
        set((state) => {
          if (quantity <= 0) {
            return {
              lines: state.lines.filter(
                (l) => lineKey(l.productId, l.variantId) !== lineKey(productId, variantId)
              ),
            };
          }
          return {
            lines: state.lines.map((l) =>
              lineKey(l.productId, l.variantId) === lineKey(productId, variantId)
                ? { ...l, quantity: Math.min(quantity, l.maxStock || 9999) }
                : l
            ),
          };
        }),
      clear: () => set({ lines: [] }),
    }),
    { name: "bafx-cart", partialize: (state) => ({ lines: state.lines }) }
  )
);

export function cartTotals(lines: CartLine[]) {
  const subtotal = lines.reduce((sum, l) => sum + l.price * l.quantity, 0);
  const itemCount = lines.reduce((sum, l) => sum + l.quantity, 0);
  return { subtotal, itemCount };
}
