import { useState } from "react";
import { useStore } from "../../lib/store";
import { useT } from "../../lib/useT";
import { monthOf } from "../../lib/helpers";
import { Card, Field, Select, EmptyState } from "../ui";
import EntryCard from "./EntryCard.jsx";

export default function RecordsView({ onEdit }) {
  const t = useT();
  const entries = useStore((s) => s.entries);
  const suppliers = useStore((s) => s.suppliers);
  const [month, setMonth] = useState("");
  const [supplierId, setSupplierId] = useState("");

  const months = [...new Set(entries.map((e) => monthOf(e.date)))].sort().reverse();

  let list = entries.slice();
  if (month) list = list.filter((e) => monthOf(e.date) === month);
  if (supplierId) list = list.filter((e) => e.supplierId === supplierId);
  list.sort((a, b) => (b.date || "").localeCompare(a.date || "") || b.createdAt - a.createdAt);

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
        </div>
      </Card>

      {list.length === 0 ? (
        <EmptyState icon="📚">{t("empty_eing")}</EmptyState>
      ) : (
        list.map((e) => <EntryCard key={e.id} entry={e} onEdit={onEdit} />)
      )}
    </div>
  );
}
