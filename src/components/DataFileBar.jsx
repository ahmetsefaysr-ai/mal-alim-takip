import { useEffect, useRef, useState } from "react";
import { useStore } from "../lib/store";
import { useT } from "../lib/useT";
import { Button, toast } from "./ui";
import {
  fsaSupported,
  getSavedHandle,
  saveHandle,
  clearSavedHandle,
  verifyPermission,
  pickExistingFile,
  createNewFile,
  readJSON,
  writeJSON,
} from "../lib/fileStore";

// Üstte ince bir durum çubuğu: veriyi diskteki gerçek .json dosyasına
// bağlar ve her değişiklikte otomatik kaydeder. Tarayıcı hafızası temizlense
// bile veri dosyada kalır.
export default function DataFileBar() {
  const t = useT();
  const importData = useStore((s) => s.importData);
  const [status, setStatus] = useState("checking"); // checking|unsupported|disconnected|reconnect|connected
  const [fileName, setFileName] = useState("");
  const [lastSaved, setLastSaved] = useState(null);
  const handleRef = useRef(null);
  const timerRef = useRef(null);

  // İlk açılış: daha önce bağlanılan dosya var mı?
  useEffect(() => {
    if (!fsaSupported()) {
      setStatus("unsupported");
      return;
    }
    let alive = true;
    (async () => {
      try {
        const h = await getSavedHandle();
        if (!alive) return;
        if (h) {
          handleRef.current = h;
          setFileName(h.name || "veriler.json");
          // İzin hâlâ veriliyse sessizce bağlan, değilse tek tık iste
          if ((await h.queryPermission({ mode: "readwrite" })) === "granted") {
            await loadFrom(h);
          } else {
            setStatus("reconnect");
          }
        } else {
          setStatus("disconnected");
        }
      } catch {
        if (alive) setStatus("disconnected");
      }
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Bağlıyken: store değişince dosyaya otomatik yaz (debounce)
  useEffect(() => {
    if (status !== "connected") return;
    const unsub = useStore.subscribe(() => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(async () => {
        const h = handleRef.current;
        if (!h) return;
        try {
          await writeJSON(h, useStore.getState().exportData());
          setLastSaved(new Date());
        } catch {
          toast(t("df_saveerr"));
        }
      }, 600);
    });
    return () => {
      unsub();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  async function loadFrom(h) {
    if (!(await verifyPermission(h, true))) {
      setStatus("reconnect");
      return;
    }
    const data = await readJSON(h);
    if (data) importData(data); // dosya = tek doğru kaynak
    handleRef.current = h;
    setFileName(h.name || "veriler.json");
    setLastSaved(new Date());
    setStatus("connected");
  }

  async function onCreate() {
    try {
      const h = await createNewFile();
      if (!(await verifyPermission(h, true))) return;
      await writeJSON(h, useStore.getState().exportData());
      await saveHandle(h).catch(() => {}); // tutamaç saklanamasa da bağlantı sürsün
      handleRef.current = h;
      setFileName(h.name || "veriler.json");
      setLastSaved(new Date());
      setStatus("connected");
      toast(t("saved"));
    } catch (e) {
      if (e?.name !== "AbortError") toast(t("df_saveerr"));
    }
  }

  async function onOpen() {
    try {
      const h = await pickExistingFile();
      await saveHandle(h).catch(() => {});
      await loadFrom(h);
      toast(t("saved"));
    } catch (e) {
      if (e?.name !== "AbortError") toast(t("df_saveerr"));
    }
  }

  async function onReconnect() {
    try {
      await saveHandle(handleRef.current).catch(() => {});
      await loadFrom(handleRef.current);
    } catch (e) {
      if (e?.name !== "AbortError") toast(t("df_saveerr"));
    }
  }

  async function onDisconnect() {
    if (timerRef.current) clearTimeout(timerRef.current);
    await clearSavedHandle();
    handleRef.current = null;
    setFileName("");
    setLastSaved(null);
    setStatus("disconnected");
  }

  if (status === "checking") return null;

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
      }}
    >
      {children}
    </div>
  );
  const msg = (children) => (
    <span style={{ flex: 1, minWidth: 200, fontSize: 13.5 }}>{children}</span>
  );

  if (status === "unsupported") {
    return wrap("var(--amber)", msg(<>⚠️ {t("df_unsupported")}</>));
  }

  if (status === "disconnected") {
    return wrap(
      "var(--amber)",
      <>
        {msg(<>⚠️ {t("df_warn")}</>)}
        <Button sm variant="gold" onClick={onCreate}>
          {t("df_create")}
        </Button>
        <Button sm variant="ghost" onClick={onOpen}>
          {t("df_open")}
        </Button>
      </>
    );
  }

  if (status === "reconnect") {
    return wrap(
      "var(--gold)",
      <>
        {msg(
          <>
            🔌 <b>{fileName}</b> · {t("df_reconnect")}
          </>
        )}
        <Button sm variant="gold" onClick={onReconnect}>
          {t("df_connect")}
        </Button>
        <Button sm variant="ghost" onClick={onOpen}>
          {t("df_other")}
        </Button>
      </>
    );
  }

  // connected
  return wrap(
    "var(--green)",
    <>
      {msg(
        <>
          💾 <b>{fileName}</b> · {t("df_autosave")}
          {lastSaved && (
            <span className="sub">
              {" · "}
              {t("df_last")} {lastSaved.toLocaleTimeString(t.lang === "de" ? "de-DE" : "tr-TR", { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
        </>
      )}
      <Button sm variant="ghost" onClick={onDisconnect}>
        {t("df_disconnect")}
      </Button>
    </>
  );
}
