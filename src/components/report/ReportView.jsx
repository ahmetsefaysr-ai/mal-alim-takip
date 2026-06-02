import { useMemo, useState } from "react";
import { useStore } from "../../lib/store";
import { useT } from "../../lib/useT";
import { computeReport, computeNet } from "../../lib/report";
import { eur, intl, firstOfMonth, lastOfMonth } from "../../lib/helpers";
import { Card, Button, Field, Input, Select, EmptyState } from "../ui";
import NetSummary from "./NetSummary.jsx";
import { printReport } from "./printReport.js";

export default function ReportView() {
  const t = useT();
  const entries = useStore((s) => s.entries);
  const suppliers = useStore((s) => s.suppliers);
  const revenues = useStore((s) => s.revenues);

  const [from, setFrom] = useState(firstOfMonth(0));
  const [to, setTo] = useState(lastOfMonth(0));
  const [group, setGroup] = useState("product");
  const [supplierId, setSupplierId] = useState("");

  const data = useMemo(
    () => computeReport(entries, suppliers, { from, to, supplierId }),
    [entries, suppliers, from, to, supplierId]
  );

  const supplierName = supplierId ? (suppliers.find((s) => s.id === supplierId) || {}).name : "";

  const doPrint = () => {
    const net = computeNet(from, to, data.totalEur, revenues);
    printReport({ data, net, from, to, supplierName, t });
  };

  return (
    <div>
      <div className="pagehead">
        <div>
          <h2>{t("ber_h")}</h2>
          <p>{t("ber_sub")}</p>
        </div>
        <Button variant="ghost" className="no-print" onClick={doPrint}>
          🖨 {t("print")}
        </Button>
      </div>

      {/* filtreler */}
      <Card>
        <div className="row" style={{ alignItems: "flex-end" }}>
          <Field label={t("from")}>
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </Field>
          <Field label={t("to")}>
            <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </Field>
          <Field label={t("groupby")}>
            <Select value={group} onChange={(e) => setGroup(e.target.value)}>
              <option value="product">{t("g_product")}</option>
              <option value="supplier">{t("g_supplier")}</option>
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
        <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
          <Button
            sm
            variant="subtle"
            onClick={() => {
              setFrom(firstOfMonth(0));
              setTo(lastOfMonth(0));
            }}
          >
            {t("thismonth")}
          </Button>
          <Button
            sm
            variant="subtle"
            onClick={() => {
              setFrom(firstOfMonth(-1));
              setTo(lastOfMonth(-1));
            }}
          >
            {t("lastmonth")}
          </Button>
        </div>
      </Card>

      {/* Net özeti (ciro − maliyet) */}
      <NetSummary from={from} to={to} totalCost={data.totalEur} />

      {/* istatistikler */}
      <div className="row" style={{ marginTop: 16 }}>
        <div className="stat">
          <div className="k">{t("net_pcs")}</div>
          <div className="v tnum">{intl(data.totalPcs)}</div>
        </div>
        <div className="stat gold">
          <div className="k">{t("net_eur")}</div>
          <div className="v tnum">€ {eur(data.totalEur)}</div>
        </div>
        <div className="stat">
          <div className="k">{t("records")}</div>
          <div className="v sm tnum">{data.count}</div>
        </div>
      </div>

      {data.count === 0 ? (
        <EmptyState icon="📊">{t("empty_ber")}</EmptyState>
      ) : (
        <Card style={{ marginTop: 16 }}>
          {data.groups.map((g, gi) => (
            <div key={gi}>
              <div className="grp-h">
                {g.label}
                <span className="ln" />
                <span className="tot">
                  {intl(g.pcs)} {t("pcs")} · € {eur(g.eur)}
                </span>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table className="tb">
                  <thead>
                    <tr>
                      <th>{t("product")}</th>
                      <th className="num">{t("net_pcs")}</th>
                      <th className="num">{t("unitprice")}</th>
                      <th className="num">{t("amount")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {g.rows.map((r, ri) => (
                      <tr key={ri}>
                        <td>
                          {r.name} <span className="sub">{r.unit || ""}</span>
                        </td>
                        <td className="num tnum">{intl(r.pcs)}</td>
                        <td className="num tnum">{eur(r.price)}</td>
                        <td className="num tnum">€ {eur(r.eur)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 20,
              paddingTop: 16,
              borderTop: "2px solid var(--gold)",
            }}
          >
            <span className="serif" style={{ fontSize: 16, color: "var(--gold)", letterSpacing: ".03em" }}>
              {t("grand_total")}
            </span>
            <span
              className="serif tnum"
              style={{ fontSize: 25, fontWeight: 600, color: "var(--gold)" }}
            >
              € {eur(data.totalEur)}
            </span>
          </div>
        </Card>
      )}
    </div>
  );
}
