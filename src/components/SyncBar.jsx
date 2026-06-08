import { useEffect, useRef, useState } from "react";
import { useStore } from "../lib/store";
import { useT } from "../lib/useT";
import { toast } from "./ui";
import { fetchServerData, saveServerData } from "../lib/serverSync";

// Üstte ince durum çubuğu. Yerel sunucu varsa veriyi diske otomatik kaydeder;
// sunucu yoksa kullanıcıyı uyarır (veri yine tarayıcıda çalışır).
export default function SyncBar() {
  const t = useT();
  const importData = useStore((s) => s.importData);
  const [mode, setMode] = useState("checking"); // checking | server | standalone
  const [lastSaved, setLastSaved] = useState(null);
  const timerRef = useRef(null);

  // İlk açılış: sunucuya bağlan, diskteki veriyi yükle (yoksa ilk veriyi yaz)
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await fetchServerData();
        if (!alive) return;
        if (data && data.empty) {
          // Dosya henüz yok → mevcut (başlangıç) veriyi diske yaz
          await saveServerData(useStore.getState().exportData());
        } else if (data && Array.isArray(data.suppliers)) {
          importData(data); // disk = tek doğru kaynak
        }
        setLastSaved(new Date());
        setMode("server");
      } catch {
        if (alive) setMode("standalone");
      }
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sunucu modunda: her değişiklikte diske otomatik kaydet (debounce)
  useEffect(() => {
    if (mode !== "server") return;
    const unsub = useStore.subscribe(() => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(async () => {
        try {
          await saveServerData(useStore.getState().exportData());
          setLastSaved(new Date());
        } catch {
          toast(t("sync_error"));
        }
      }, 500);
    });
    return () => {
      unsub();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  if (mode === "checking") return null;

  const wrap = (tone, children) => (
    <div
      className="card card-pad-sm"
      style={{
        marginBottom: 14,
        display: "flex",
        alignItems: "center",
        gap: 10,
        flexWrap: "wrap",
        borderLeft: `4px solid ${tone}`,
        fontSize: 13.5,
      }}
    >
      {children}
    </div>
  );

  if (mode === "standalone") {
    return wrap("var(--amber)", <span>⚠️ {t("sync_standalone")}</span>);
  }

  // server
  return wrap(
    "var(--green)",
    <span>
      💾 {t("sync_saved")}
      {lastSaved && (
        <span className="sub">
          {" · "}
          {t("sync_last")}{" "}
          {lastSaved.toLocaleTimeString(t.lang === "de" ? "de-DE" : "tr-TR", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      )}
    </span>
  );
}
