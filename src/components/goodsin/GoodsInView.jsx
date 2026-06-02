import { useEffect, useMemo, useState } from "react";
import { useStore } from "../../lib/store";
import { useT } from "../../lib/useT";
import { today, eur, readFileAsDataURL } from "../../lib/helpers";
import { Card, Button, Field, Input, Select, EmptyState, toast } from "../ui";

const emptyDraft = () => ({
  supplierId: "",
  date: today(),
  lines: [],
  note: "",
  receipt: null,
  receiptName: "",
  editId: null,
});

export default function GoodsInView({ draft, setDraft, onSaved }) {
  const t = useT();
  const suppliers = useStore((s) => s.suppliers);
  const products = useStore((s) => s.products);
  const addEntry = useStore((s) => s.addEntry);
  const updateEntry = useStore((s) => s.updateEntry);

  const [he, setHe] = useState(emptyDraft);

  // Düzenleme taslağını yükle
  useEffect(() => {
    if (draft) {
      setHe({
        supplierId: draft.supplierId,
        date: draft.date,
        note: draft.note || "",
        receipt: draft.receipt || null,
        receiptName: draft.receiptName || "",
        editId: draft.id,
        lines: (draft.lines || []).map((l) => ({
          productId: l.productId,
          ordered: l.ordered,
          received: l.received,
        })),
      });
      setDraft(null);
    }
  }, [draft, setDraft]);

  const prodById = (id) => products.find((p) => p.id === id) || { name: "?", price: 0, unit: "" };
  const prodsOf = (sid) => products.filter((p) => p.supplierId === sid);

  const pickSupplier = (sid) => {
    if (!sid) {
      setHe((h) => ({ ...h, supplierId: "", lines: [] }));
      return;
    }
    setHe((h) => ({
      ...h,
      supplierId: sid,
      editId: null,
      lines: prodsOf(sid).map((p) => ({ productId: p.id, ordered: p.defaultQty, received: p.defaultQty })),
    }));
  };

  const setQty = (i, key, val) => {
    const n = Math.max(0, parseInt(val, 10) || 0);
    setHe((h) => {
      const lines = h.lines.slice();
      lines[i] = { ...lines[i], [key]: n };
      return { ...h, lines };
    });
  };

  const onFile = async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const data = await readFileAsDataURL(f);
    setHe((h) => ({ ...h, receipt: data, receiptName: f.name }));
  };

  const totals = useMemo(() => {
    let pcs = 0,
      sum = 0;
    he.lines.forEach((ln) => {
      const p = prodById(ln.productId);
      pcs += Number(ln.received) || 0;
      sum += (Number(ln.received) || 0) * (Number(p.price) || 0);
    });
    return { pcs, sum };
  }, [he.lines, products]);

  const save = () => {
    const lines = he.lines
      .filter((l) => (Number(l.received) || 0) > 0 || (Number(l.ordered) || 0) > 0)
      .map((l) => {
        const p = prodById(l.productId);
        return {
          productId: l.productId,
          name: p.name,
          art: p.art,
          unit: p.unit,
          ordered: Number(l.ordered) || 0,
          received: Number(l.received) || 0,
          price: Number(p.price) || 0,
        };
      });
    if (lines.length === 0) {
      toast("—");
      return;
    }
    const payload = {
      date: he.date,
      supplierId: he.supplierId,
      lines,
      receipt: he.receipt,
      receiptName: he.receiptName,
      note: he.note,
    };
    if (he.editId) updateEntry(he.editId, payload);
    else addEntry(payload);
    toast(t("saved"));
    setHe(emptyDraft());
    onSaved();
  };

  return (
    <div>
      <div className="pagehead">
        <div>
          <h2>{t("heute_h")}</h2>
          <p>{t("heute_sub")}</p>
        </div>
      </div>

      {/* tedarikçi + tarih */}
      <Card>
        <div className="row" style={{ alignItems: "flex-end" }}>
          <Field label={t("supplier")} style={{ flex: 2 }}>
            <Select value={he.supplierId} onChange={(e) => pickSupplier(e.target.value)}>
              <option value="">— {t("supplier")} —</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={t("date")}>
            <Input
              type="date"
              value={he.date}
              onChange={(e) => setHe((h) => ({ ...h, date: e.target.value }))}
            />
          </Field>
        </div>
      </Card>

      {!he.supplierId ? (
        <EmptyState icon="📥">{t("must_supplier")}</EmptyState>
      ) : he.lines.length === 0 ? (
        <EmptyState icon="📦">{t("no_products")}</EmptyState>
      ) : (
        <>
          <Card style={{ padding: 0, marginTop: 16 }}>
            <div className="hint gold" style={{ border: "none", borderRadius: 14 }}>
              <span>💡</span>
              <span>{t("heute_tip")}</span>
            </div>
          </Card>

          <Card style={{ marginTop: 16 }}>
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
                  {he.lines.map((ln, i) => {
                    const p = prodById(ln.productId);
                    const diff = Number(ln.ordered) !== Number(ln.received);
                    return (
                      <tr key={ln.productId}>
                        <td>
                          {p.name}{" "}
                          <span className="sub">
                            {p.art ? "· " + p.art : ""} {p.unit || ""}
                          </span>
                        </td>
                        <td className="num">
                          <input
                            className="qin"
                            type="number"
                            min="0"
                            value={ln.ordered}
                            onChange={(e) => setQty(i, "ordered", e.target.value)}
                          />
                        </td>
                        <td className="num">
                          <input
                            className={"qin" + (diff ? " diff" : "")}
                            type="number"
                            min="0"
                            value={ln.received}
                            onChange={(e) => setQty(i, "received", e.target.value)}
                          />
                        </td>
                        <td className="num tnum">{eur(p.price)}</td>
                        <td className="num tnum">{eur((Number(ln.received) || 0) * (Number(p.price) || 0))}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="totbar">
              <span className="sub">
                {totals.pcs} {t("pcs")}
              </span>
              <span className="big">€ {eur(totals.sum)}</span>
            </div>
          </Card>

          {/* fiş + not */}
          <Card style={{ marginTop: 16 }}>
            <Field label={t("receipt")}>
              <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                <label className="btn btn-ghost btn-sm" style={{ marginBottom: 0 }}>
                  📎 {t("pickfile")}
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    style={{ display: "none" }}
                    onChange={onFile}
                  />
                </label>
                {he.receipt ? (
                  <span className="sub" style={{ color: "var(--green)" }}>
                    ✓ {he.receiptName}
                  </span>
                ) : (
                  <span className="sub">{t("nofile")}</span>
                )}
                {he.receipt && (
                  <Button sm variant="subtle" onClick={() => setHe((h) => ({ ...h, receipt: null, receiptName: "" }))}>
                    {t("remove")}
                  </Button>
                )}
              </div>
            </Field>
            <Field label={t("note")} style={{ marginTop: 14 }}>
              <Input value={he.note} onChange={(e) => setHe((h) => ({ ...h, note: e.target.value }))} />
            </Field>
          </Card>

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 18 }}>
            <Button variant="gold" onClick={save}>
              💾 {t("save")}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
