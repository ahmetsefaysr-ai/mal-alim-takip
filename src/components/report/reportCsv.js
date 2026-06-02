import { eur, intl } from "../../lib/helpers";

// Bir CSV hücresini güvenli hale getir (ayraç/tırnak/yeni satır içerenleri tırnakla).
const cell = (v) => {
  const s = String(v == null ? "" : v);
  return /[";\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

// Raporu CSV olarak indir. printReport ile aynı veri imzasını kullanır.
// Almanca Excel uyumu için ayraç ';' ve başına UTF-8 BOM eklenir.
export function downloadReportCsv({ data, from, to, supplierName, t }) {
  const rows = [];
  rows.push([t("supplier"), t("product"), t("unit"), t("net_pcs"), t("unitprice"), t("amount")]);
  data.groups.forEach((g) => {
    g.rows.forEach((r) => {
      rows.push([g.label, r.name, r.unit || "", intl(r.pcs), eur(r.price), eur(r.eur)]);
    });
  });
  rows.push([]);
  rows.push(["", "", "", intl(data.totalPcs), "", eur(data.totalEur)]);

  const csv = "﻿" + rows.map((r) => r.map(cell).join(";")).join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const tag = supplierName ? "-" + supplierName.replace(/\s+/g, "_") : "";
  a.href = url;
  a.download = `${t("print_title")}_${from}_${to}${tag}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
