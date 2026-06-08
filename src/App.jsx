import { useState } from "react";
import { useStore } from "./lib/store";
import { useT } from "./lib/useT";
import { cx, Toast } from "./components/ui";
import DataFileBar from "./components/DataFileBar.jsx";
import GoodsInView from "./components/goodsin/GoodsInView.jsx";
import RecordsView from "./components/records/RecordsView.jsx";
import ReportView from "./components/report/ReportView.jsx";
import StammView from "./components/stamm/StammView.jsx";

const NAV = [
  ["heute", "📥"],
  ["eingaenge", "📚"],
  ["bericht", "📊"],
  ["stamm", "⚙️"],
];

export default function App() {
  const t = useT();
  const lang = useStore((s) => s.lang);
  const setLang = useStore((s) => s.setLang);
  const [view, setView] = useState("heute");
  // Mal Girişi → düzenleme için ortak taslak
  const [draft, setDraft] = useState(null);

  const go = (v) => {
    setView(v);
    window.scrollTo(0, 0);
  };
  const editEntry = (entry) => {
    setDraft(entry);
    go("heute");
  };

  return (
    <div className="app-shell">
      <header className="top">
        <div className="container">
          <div className="top-row">
            <div className="brand">
              <div className="logo">🥨</div>
              <div style={{ minWidth: 0 }}>
                <div className="t1">{t("brandT1")}</div>
                <div className="t2">{t("brandT2")}</div>
              </div>
            </div>
            <div className="langbtn">
              <button className={cx(lang === "tr" && "on")} onClick={() => setLang("tr")}>
                TR
              </button>
              <button className={cx(lang === "de" && "on")} onClick={() => setLang("de")}>
                DE
              </button>
            </div>
          </div>
          <nav className="tabs">
            {NAV.map(([v, ic]) => (
              <button key={v} className={cx(view === v && "on")} onClick={() => go(v)}>
                <span className="ic">{ic}</span>
                {t("nav_" + v)}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main>
        <div className="container">
          <DataFileBar />
        </div>
        <div className="container fade-up" key={view}>
          {view === "heute" && (
            <GoodsInView draft={draft} setDraft={setDraft} onSaved={() => go("eingaenge")} />
          )}
          {view === "eingaenge" && <RecordsView onEdit={editEntry} />}
          {view === "bericht" && <ReportView />}
          {view === "stamm" && <StammView />}
        </div>
      </main>

      <Toast />
    </div>
  );
}
