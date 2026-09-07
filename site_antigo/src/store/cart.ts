import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartAvulso = {
  tipo: "avulso";
  id: string;
  nome: string;
  sabor: string;
  preco: number;
  foto_url: string | null;
  categoria: "fino" | "cremoso" | "especial";
  qty: number;
};

export type CartKitDegustacao = {
  tipo: "kit-degustacao";
  id: string;
  nome: string; // "Kit Degustação"
  preco: number; // unit price
  qty: number;
  saboresIds: string[];
  saboresLabels: { nome: string; sabor: string }[];
};

export type CartKitPresenteavel = {
  tipo: "kit-presenteavel";
  id: string;
  nome: string; // "Kit Presenteável"
  preco: number; // unit price
  qty: number;
  licor: { id: string; nome: string; sabor: string };
  acompanhamento: string; // label
  embalagem: string; // label
  dedicatoria: string;
};

export type CartItem = CartAvulso | CartKitDegustacao | CartKitPresenteavel;

type State = {
  items: CartItem[];
  open: boolean;
  setOpen: (v: boolean) => void;
  addAvulso: (item: Omit<CartAvulso, "qty" | "tipo">, qty?: number) => void;
  addKit: (kit: CartKitDegustacao | CartKitPresenteavel) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  total: () => number;
  count: () => number;
  usageByProduct: (productId: string) => number;
};

export const useCart = create<State>()(
  persist(
    (set, get) => ({
      items: [],
      open: false,
      setOpen: (v) => set({ open: v }),
      addAvulso: (item, qty = 1) => {
        const items = [...get().items];
        const idx = items.findIndex((i) => i.tipo === "avulso" && i.id === item.id);
        if (idx >= 0) {
          const existing = items[idx] as CartAvulso;
          items[idx] = { ...existing, qty: existing.qty + qty };
        } else {
          items.push({ tipo: "avulso", ...item, qty });
        }
        set({ items });
      },
      addKit: (kit) => {
        set({ items: [...get().items, kit] });
      },
      remove: (id) => set({ items: get().items.filter((i) => i.id !== id) }),
      setQty: (id, qty) => set({
        items: get().items.map((i) => (i.id === id ? { ...i, qty: Math.max(1, qty) } : i)),
      }),
      clear: () => set({ items: [] }),
      total: () => get().items.reduce((s, i) => s + i.preco * i.qty, 0),
      count: () => get().items.reduce((s, i) => s + i.qty, 0),
      usageByProduct: (productId) => {
        return get().items.reduce((sum, i) => {
          if (i.tipo === "avulso") {
            return sum + (i.id === productId ? i.qty : 0);
          }
          if (i.tipo === "kit-degustacao") {
            // Kit Degustação usa mini-garrafas próprias (50ml) e não consome
            // o estoque dos licores de 500ml.
            return sum;
          }
          if (i.tipo === "kit-presenteavel") {
            return sum + (i.licor.id === productId ? i.qty : 0);
          }
          return sum;
        }, 0);
      },
    }),
    { name: "alquimista-cart" }
  )
);