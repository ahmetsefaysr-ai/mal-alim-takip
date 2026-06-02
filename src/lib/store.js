import { create } from "zustand";
import { persist } from "zustand/middleware";
import { seed } from "./seed";
import { uid } from "./helpers";

const NEW_KEY = "wek_data_v2";
const OLD_KEY = "wek_data_v1";

// Eski tek-dosya (vanilla) uygulamasının düz localStorage verisini taşı.
function initialData() {
  try {
    if (!localStorage.getItem(NEW_KEY)) {
      const old = localStorage.getItem(OLD_KEY);
      if (old) {
        const d = JSON.parse(old);
        if (d && Array.isArray(d.suppliers)) {
          return {
            suppliers: d.suppliers || [],
            products: d.products || [],
            entries: d.entries || [],
            revenues: d.revenues || [],
            lang: d.lang === "de" ? "de" : "tr",
          };
        }
      }
    }
  } catch (e) {
    /* yoksay */
  }
  const s = seed();
  return {
    suppliers: s.suppliers,
    products: s.products,
    entries: s.entries,
    revenues: s.revenues,
    lang: s.lang,
  };
}

export const useStore = create(
  persist(
    (set, get) => ({
      ...initialData(),

      // ── Dil ──
      setLang: (lang) => set({ lang }),

      // ── Tedarikçi ──
      addSupplier: (data) =>
        set((s) => ({
          suppliers: [...s.suppliers, { id: "s_" + uid(), color: "#9A7320", ...data }],
        })),
      updateSupplier: (id, data) =>
        set((s) => ({
          suppliers: s.suppliers.map((x) => (x.id === id ? { ...x, ...data } : x)),
        })),
      deleteSupplier: (id) =>
        set((s) => ({
          suppliers: s.suppliers.filter((x) => x.id !== id),
          products: s.products.filter((p) => p.supplierId !== id),
        })),

      // ── Ürün ──
      addProduct: (supplierId, data) =>
        set((s) => ({
          products: [...s.products, { id: "p_" + uid(), supplierId, ...data }],
        })),
      updateProduct: (id, data) =>
        set((s) => ({
          products: s.products.map((p) => (p.id === id ? { ...p, ...data } : p)),
        })),
      deleteProduct: (id) =>
        set((s) => ({ products: s.products.filter((p) => p.id !== id) })),

      // ── Mal girişi / kayıt ──
      addEntry: (entry) =>
        set((s) => ({
          entries: [{ ...entry, id: "e_" + uid(), createdAt: Date.now() }, ...s.entries],
        })),
      updateEntry: (id, entry) =>
        set((s) => ({
          entries: s.entries.map((e) => (e.id === id ? { ...e, ...entry, id } : e)),
        })),
      deleteEntry: (id) =>
        set((s) => ({ entries: s.entries.filter((e) => e.id !== id) })),

      // ── Ciro (aylık) ──
      setRevenue: (month, amount, note = "") =>
        set((s) => {
          const amt = Number(amount) || 0;
          const exists = s.revenues.find((r) => r.month === month);
          if (exists) {
            return {
              revenues: s.revenues.map((r) =>
                r.month === month ? { ...r, amount: amt, note } : r
              ),
            };
          }
          return {
            revenues: [
              ...s.revenues,
              { id: "r_" + uid(), month, amount: amt, note, createdAt: Date.now() },
            ],
          };
        }),

      // ── Yedek ──
      exportData: () => {
        const { suppliers, products, entries, revenues, lang } = get();
        return { suppliers, products, entries, revenues, lang };
      },
      importData: (d) => {
        if (!d || !Array.isArray(d.suppliers)) return false;
        set({
          suppliers: d.suppliers || [],
          products: d.products || [],
          entries: d.entries || [],
          revenues: d.revenues || [],
          lang: d.lang === "de" ? "de" : "tr",
        });
        return true;
      },
      reset: () => {
        const s = seed();
        set({
          suppliers: s.suppliers,
          products: s.products,
          entries: s.entries,
          revenues: s.revenues,
        });
      },
    }),
    {
      name: NEW_KEY,
      partialize: (s) => ({
        suppliers: s.suppliers,
        products: s.products,
        entries: s.entries,
        revenues: s.revenues,
        lang: s.lang,
      }),
    }
  )
);
