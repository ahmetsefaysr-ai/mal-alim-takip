import { useStore } from "./store";
import { tr } from "./i18n";

// t(key) — geçerli dile bağlı çeviri fonksiyonu döndürür.
export function useT() {
  const lang = useStore((s) => s.lang);
  const t = (key) => tr(lang, key);
  t.lang = lang;
  return t;
}
