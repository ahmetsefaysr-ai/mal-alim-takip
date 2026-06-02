import { useStore } from "../../lib/store";
import { useT } from "../../lib/useT";
import { computeNet } from "../../lib/report";
import { eur, fmtMonth } from "../../lib/helpers";
import { Card, Input } from "../ui";

export default function NetSummary({ from, to, totalCost }) {
  const t = useT();
  const revenues = useStore((s) => s.revenues);
  const setRevenue = useStore((s) => s.setRevenue);

  const net = computeNet(from, to, totalCost, revenues);
  const netTone = net.net >= 0 ? "var(--green)" : "var(--red)";

  return (
    <Card style={{ marginTop: 16 }}>
      <div className="grp-h" style={{ marginTop: 0 }}>
        {t("net_h")}
        <span className="ln" />
      </div>

      {/* 3 büyük sayı */}
      <div className="row">
        <div className="stat" style={{ minWidth: 150 }}>
          <div className="k">{t("cost")}</div>
          <div className="v sm tnum">€ {eur(net.cost)}</div>
        </div>
        <div className="stat gold" style={{ minWidth: 150 }}>
          <div className="k">{t("revenue")}</div>
          <div className="v sm tnum">€ {eur(net.revenue)}</div>
        </div>
        <div className="stat" style={{ minWidth: 150 }}>
          <div className="k">{t("net")}</div>
          <div className="v sm tnum" style={{ color: netTone }}>
            € {eur(net.net)}
          </div>
        </div>
      </div>

      {/* aylık ciro girişi */}
      <div style={{ marginTop: 16 }}>
        <div className="lbl" style={{ marginBottom: 8 }}>
          {t("per_month")}
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
            gap: 10,
          }}
        >
          {net.perMonth.map((m) => {
            const r = revenues.find((x) => x.month === m.month);
            return (
              <div key={m.month}>
                <div className="sub" style={{ marginBottom: 4 }}>
                  {fmtMonth(m.month, t.lang)}
                </div>
                <div style={{ position: "relative" }}>
                  <span
                    style={{
                      position: "absolute",
                      left: 11,
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "var(--faint)",
                      fontSize: 13,
                    }}
                  >
                    €
                  </span>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    style={{ paddingLeft: 24 }}
                    placeholder="0,00"
                    value={r ? r.amount : ""}
                    onChange={(e) => setRevenue(m.month, e.target.value, r ? r.note : "")}
                  />
                </div>
              </div>
            );
          })}
        </div>
        <div className="hint gold" style={{ marginTop: 12 }}>
          <span>ℹ️</span>
          <span>{t("revenue_hint")}</span>
        </div>
      </div>
    </Card>
  );
}
