import { eur, fmtDate, intl, today } from "../../lib/helpers";

const escp = (s) =>
  String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

// Temiz, açık temalı yazdırma çıktısı (yeni pencere → window.print()).
export function printReport({ data, net, from, to, supplierName, t }) {
  const css = `
    *{box-sizing:border-box}
    body{font-family:'Inter',system-ui,sans-serif;color:#1c1917;padding:34px;max-width:780px;margin:auto}
    h1{font-family:Georgia,serif;font-size:23px;margin:0 0 4px}
    .meta{color:#8a847e;font-size:12.5px;margin-bottom:18px}
    .stats{display:flex;gap:14px;margin:14px 0 22px;flex-wrap:wrap}
    .st{flex:1;min-width:130px;border:1px solid #e9e6e1;border-radius:12px;padding:12px 14px}
    .st .k{font-size:11px;color:#8a847e}
    .st .v{font-family:Georgia,serif;font-size:20px;font-weight:600;margin-top:3px;font-variant-numeric:tabular-nums}
    .grp{font-family:Georgia,serif;font-size:15px;font-weight:600;margin:20px 0 6px;border-bottom:2px solid #c9a75a;padding-bottom:4px;display:flex;justify-content:space-between}
    table{width:100%;border-collapse:collapse;margin-bottom:6px;font-size:13px}
    th{text-align:left;border-bottom:1px solid #bbb;padding:6px 8px;font-size:10.5px;text-transform:uppercase;letter-spacing:.05em;color:#8a847e}
    td{padding:6px 8px;border-bottom:1px solid #f1efea}
    .num{text-align:right;font-variant-numeric:tabular-nums}
    .gt{display:flex;justify-content:space-between;margin-top:22px;padding-top:12px;border-top:2px solid #1c1917;font-size:18px;font-weight:700}
    .net{margin-top:6px;color:#15803d}
    .net.neg{color:#b91c1c}
  `;
  let h = `<h1>${escp(t("print_title"))}</h1>`;
  h += `<div class="meta">${escp(t("period"))}: ${fmtDate(from)} – ${fmtDate(to)}`;
  if (supplierName) h += ` · ${escp(supplierName)}`;
  h += ` &nbsp;|&nbsp; ${escp(t("generated"))}: ${fmtDate(today())}</div>`;

  // özet kutuları
  h += `<div class="stats">
    <div class="st"><div class="k">${escp(t("cost"))}</div><div class="v">€ ${eur(net.cost)}</div></div>
    <div class="st"><div class="k">${escp(t("revenue"))}</div><div class="v">€ ${eur(net.revenue)}</div></div>
    <div class="st"><div class="k">${escp(t("net"))}</div><div class="v" style="color:${net.net >= 0 ? "#15803d" : "#b91c1c"}">€ ${eur(net.net)}</div></div>
    <div class="st"><div class="k">${escp(t("net_pcs"))}</div><div class="v">${intl(data.totalPcs)}</div></div>
  </div>`;

  data.groups.forEach((g) => {
    h += `<div class="grp"><span>${escp(g.label)}</span><span>${intl(g.pcs)} ${escp(t("pcs"))} · € ${eur(g.eur)}</span></div>`;
    h += `<table><thead><tr><th>${escp(t("product"))}</th><th class="num">${escp(t("net_pcs"))}</th><th class="num">${escp(t("unitprice"))}</th><th class="num">${escp(t("amount"))}</th></tr></thead><tbody>`;
    g.rows.forEach((r) => {
      h += `<tr><td>${escp(r.name)} ${r.unit ? "(" + escp(r.unit) + ")" : ""}</td><td class="num">${intl(r.pcs)}</td><td class="num">${eur(r.price)}</td><td class="num">€ ${eur(r.eur)}</td></tr>`;
    });
    h += `</tbody></table>`;
  });

  h += `<div class="gt"><span>${escp(t("grand_total"))}</span><span>€ ${eur(data.totalEur)}</span></div>`;

  const w = window.open("", "_blank");
  if (!w) return;
  w.document.write(
    `<!doctype html><html><head><meta charset="utf-8"><title>${escp(t("print_title"))}</title><style>${css}</style></head><body>${h}<script>window.onload=function(){window.print();}<\/script></body></html>`
  );
  w.document.close();
}
