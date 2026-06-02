import { useState } from "react";
import { useStore } from "../../lib/store";
import { useT } from "../../lib/useT";
import { monthOf, eur, intl } from "../../lib/helpers";
import { Card, Field, Input, Select, EmptyState } from "../ui";
import EntryCard from "./EntryCard.jsx";

export default function RecordsView({ onEdit, onCopy }) {
  const t = useT();
  const entries = useStore((s) => s.entries);
  const suppliers = useStore((s) => s.suppliers);
  const [month, setMonth] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [q, setQ] = useState("");

  const months = [...new Set(entries.map((e) => monthOf(e.date)))].sort().reverse();
  const supName = (id) => (suppliers.find((s) => s.id === id) || {}).name || "";

  let list = entries.slice();
  if (month) list = list.filter((e) => monthOf(e.date) === month);
  if (supplierId) list = list.filter((e) => e.supplierId === supplierId);
  const needle = q.trim().toLowerCase();
  if (needle)
    list = list.filter((e) => {
      const hay =
        supName(e.supplierId) + " " + (e.note || "") + " " + (e.lines || []).map((l) => l.name).join(" ");
      return hay.toLowerCase().includes(needle);
    });
  list.sort((a, b) => (b.date || "").localeCompare(a.date || "") || b.createdAt - a.createdAt);

  // Filtrelenen listenin toplamları (özet çubuğu)
  let sumPcs = 0,
    sumEur = 0;
  list.forEach((e) =>
    (e.lines || []).forEach((l) => {
      const pcs = Number(l.received) || 0;
      sumPcs += pcs;
      sumEur += pcs * (Number(l.price) || 0);
    })
  );

  return (
    <div>
      <div className="pagehead">
        <div>
          <h2>{t("eing_h")}</h2>
          <p>{t("eing_sub")}</p>
        </div>
      </div>

      <Card>
        <div className="row">
          <Field label={t("filt_month")}>
            <Select value={month} onChange={(e) => setMonth(e.target.value)}>
              <option value="">{t("filt_all")}</option>
              {months.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={t("filt_supplier")}>
            <Select value={supplierId} onChange={(e) => setSupplierId(e.target.value)}>
              <option value="">{t("filt_all")}</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={t("search")} style={{ flex: 2 }}>
            <Input value={q} placeholder={t("search_ph")} onChange={(e) => setQ(e.target.value)} />
          </Field>
        </div>
      </Card>

      {list.length === 0 ? (
        <EmptyState icon="📚">{needle || month || supplierId ? t("empty_filter") : t("empty_eing")}</EmptyState>
      ) : (
        <>
          <div className="totbar" style={{ marginTop: 12 }}>
            <span className="sub">
              {list.length} {t("records")} · {intl(sumPcs)} {t("pcs")}
            </span>
            <span className="big">€ {eur(sumEur)}</span>
          </div>
          {list.map((e) => (
            <EntryCard key={e.id} entry={e} onEdit={onEdit} onCopy={onCopy} />
          ))}
        </>
      )}
    </div>
  );
}
