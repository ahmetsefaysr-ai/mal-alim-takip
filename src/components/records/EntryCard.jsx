import { useState } from "react";
import { useStore } from "../../lib/store";
import { useT } from "../../lib/useT";
import { eur, fmtDate } from "../../lib/helpers";
import { Card, Button, Pill, toast } from "../ui";
import ReceiptViewer from "./ReceiptViewer.jsx";

export default function EntryCard({ entry, onEdit }) {
  const t = useT();
  const suppliers = useStore((s) => s.suppliers);
  const deleteEntry = useStore((s) => s.deleteEntry);
  const [open, setOpen] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);

  const sup = suppliers.find((s) => s.id === entry.supplierId) || {
    name: "?",
    category: "sonstige",
  };
  let pcs = 0,
    sum = 0;
  entry.lines.forEach((l) => {
    pcs += Number(l.received) || 0;
    sum += (Number(l.received) || 0) * (Number(l.price) || 0);
  });

  const isPdf = (entry.receipt || "").startsWith("data:application/pdf");

  return (
    <Card pad="sm" style={{ marginTop: 12 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 12,
          flexWrap: "wrap",
          cursor: "pointer",
        }}
        onClick={() => setOpen((o) => !o)}
      >
        <div style={{ display: "flex", gap: 12, alignItems: "center", minWidth: 0 }}>
          {entry.receipt ? (
            isPdf ? (
              <div
                className="thumb-pdf"
                title={t("view_receipt")}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowReceipt(true);
                }}
              >
                📄
              </div>
            ) : (
              <img
                className="thumb"
                src={entry.receipt}
                alt=""
                title={t("view_receipt")}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowReceipt(true);
                }}
              />
            )
          ) : (
            <div className="thumb-none">—</div>
          )}
          <div style={{ minWidth: 0 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <span className="serif" style={{ fontSize: 17, color: "var(--text)", fontWeight: 600 }}>
                {sup.name}
              </span>
              <Pill cat={sup.category}>{t("c_" + sup.category)}</Pill>
            </div>
            <div className="sub" style={{ marginTop: 3 }}>
              {fmtDate(entry.date)} · {entry.lines.length} {t("items")}
              {entry.note ? " · " + entry.note : ""}
            </div>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div
            className="serif tnum"
            style={{ fontSize: 21, fontWeight: 600, color: "var(--gold)" }}
          >
            € {eur(sum)}
          </div>
          <div className="sub tnum">
            {pcs} {t("pcs")}
          </div>
        </div>
      </div>

      {open && (
        <div style={{ marginTop: 14 }}>
          <div style={{ overflowX: "auto" }}>
            <table className="tb">
              <thead>
                <tr>
                  <th>{t("product")}</th>
                  <th className="num">{t("ordered")}</th>
                  <th className="num">{t("received")}</th>
                  <th className="num">{t("unitprice")}</th>
                  <th className="num">{t("amount")}</th>
                </tr>
              </thead>
              <tbody>
                {entry.lines.map((l, i) => {
                  const diff = Number(l.ordered) !== Number(l.received);
                  return (
                    <tr key={i}>
                      <td>
                        {l.name} <span className="sub">{l.unit || ""}</span>
                      </td>
                      <td className="num tnum" style={{ color: "var(--soft)" }}>
                        {l.ordered}
                      </td>
                      <td
                        className="num tnum"
                        style={diff ? { color: "var(--amber)", fontWeight: 600 } : undefined}
                      >
                        {l.received}
                      </td>
                      <td className="num tnum">{eur(l.price)}</td>
                      <td className="num tnum">{eur((Number(l.received) || 0) * (Number(l.price) || 0))}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 12, flexWrap: "wrap" }}>
            {entry.receipt && (
              <Button sm variant="subtle" onClick={() => setShowReceipt(true)}>
                🧾 {t("view_receipt")}
              </Button>
            )}
            <Button sm variant="ghost" onClick={() => onEdit(entry)}>
              ✏️ {t("edit")}
            </Button>
            <Button
              sm
              variant="red"
              onClick={() => {
                if (confirm(t("del_confirm"))) {
                  deleteEntry(entry.id);
                  toast(t("del"));
                }
              }}
            >
              🗑 {t("del")}
            </Button>
          </div>
        </div>
      )}

      {showReceipt && entry.receipt && (
        <ReceiptViewer entry={entry} onClose={() => setShowReceipt(false)} />
      )}
    </Card>
  );
}
