// ── Yardımcılar ──────────────────────────────────────────────────
export const uid = () => Math.random().toString(36).slice(2, 9);

const pad2 = (n) => String(n).padStart(2, "0");
// Yerel tarih → "YYYY-MM-DD" (toISOString'in UTC kaymasını önler)
const ymd = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

export const today = () => ymd(new Date());

export const eur = (n) =>
  (Number(n) || 0).toLocaleString("de-DE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export const intl = (n) => (Number(n) || 0).toLocaleString("de-DE");

export const monthOf = (d) => (d || "").slice(0, 7);

export const fmtDate = (d) => {
  if (!d) return "";
  const p = d.split("-");
  return p.length === 3 ? `${p[2]}.${p[1]}.${p[0]}` : d;
};

export const fmtMonth = (m, lang = "tr") => {
  if (!m) return "";
  const [y, mm] = m.split("-");
  const names = {
    tr: ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"],
    de: ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"],
  };
  const arr = names[lang] || names.tr;
  return `${arr[parseInt(mm, 10) - 1] || mm} ${y}`;
};

export const firstOfMonth = (off = 0) => {
  const d = new Date();
  d.setMonth(d.getMonth() + off, 1);
  return ymd(d);
};

export const lastOfMonth = (off = 0) => {
  const d = new Date();
  d.setMonth(d.getMonth() + off + 1, 0);
  return ymd(d);
};

// Bir tarih aralığının kapsadığı YYYY-MM ayları (string tabanlı, timezone-güvenli)
export const monthsInRange = (from, to) => {
  if (!from || !to) return [];
  let [fy, fm] = from.split("-").map(Number); // fm: 1-12
  const [ty, tm] = to.split("-").map(Number);
  const out = [];
  while (fy < ty || (fy === ty && fm <= tm)) {
    out.push(`${fy}-${pad2(fm)}`);
    fm++;
    if (fm > 12) {
      fm = 1;
      fy++;
    }
  }
  return out;
};

export const readFileAsDataURL = (file) =>
  new Promise((resolve, reject) => {
    const rd = new FileReader();
    rd.onload = () => resolve(rd.result);
    rd.onerror = reject;
    rd.readAsDataURL(file);
  });

export const readFileAsText = (file) =>
  new Promise((resolve, reject) => {
    const rd = new FileReader();
    rd.onload = () => resolve(rd.result);
    rd.onerror = reject;
    rd.readAsText(file);
  });
