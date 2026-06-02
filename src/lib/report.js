import { monthsInRange } from "./helpers";

// Tarih aralığındaki kayıtları grupla & topla.
// group: 'product' | 'supplier' (her ikisinde de tedarikçi başlığı altında ürün satırları)
export function computeReport(entries, suppliers, { from, to, supplierId }) {
  const supById = (id) => suppliers.find((s) => s.id === id) || {};
  let list = entries.filter((e) => e.date >= from && e.date <= to);
  if (supplierId) list = list.filter((e) => e.supplierId === supplierId);

  let totalPcs = 0,
    totalEur = 0;
  const groups = {};

  list.forEach((e) => {
    (e.lines || []).forEach((l) => {
      const pcs = Number(l.received) || 0;
      const eurv = pcs * (Number(l.price) || 0);
      totalPcs += pcs;
      totalEur += eurv;
      const gKey = e.supplierId;
      const gLabel = supById(e.supplierId).name || "—";
      if (!groups[gKey]) groups[gKey] = { label: gLabel, pcs: 0, eur: 0, rows: {} };
      groups[gKey].pcs += pcs;
      groups[gKey].eur += eurv;
      const rKey = l.productId || l.name;
      if (!groups[gKey].rows[rKey])
        groups[gKey].rows[rKey] = {
          name: l.name,
          unit: l.unit,
          price: Number(l.price) || 0,
          pcs: 0,
          eur: 0,
        };
      groups[gKey].rows[rKey].pcs += pcs;
      groups[gKey].rows[rKey].eur += eurv;
    });
  });

  const gArr = Object.values(groups)
    .map((g) => ({
      label: g.label,
      pcs: g.pcs,
      eur: g.eur,
      rows: Object.values(g.rows).sort((a, b) => b.eur - a.eur),
    }))
    .sort((a, b) => b.eur - a.eur);

  return { groups: gArr, totalPcs, totalEur, count: list.length };
}

// Net: ciro − alım maliyeti. Aralık birden çok ay kapsarsa ayların cirosu toplanır.
export function computeNet(from, to, totalCost, revenues) {
  const months = monthsInRange(from, to);
  let revenue = 0;
  const perMonth = months.map((m) => {
    const r = revenues.find((x) => x.month === m);
    const amt = r ? Number(r.amount) || 0 : 0;
    revenue += amt;
    return { month: m, amount: amt, hasValue: !!r };
  });
  return {
    months,
    perMonth,
    revenue,
    cost: totalCost,
    net: revenue - totalCost,
  };
}
