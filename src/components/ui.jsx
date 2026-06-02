import { useEffect } from "react";
import { create } from "zustand";

export const cx = (...a) => a.filter(Boolean).join(" ");

/* ── Toast ─────────────────────────────────────────────── */
const useToastStore = create((set) => ({
  msg: "",
  show: false,
  _t: null,
  push: (msg) =>
    set((s) => {
      if (s._t) clearTimeout(s._t);
      const _t = setTimeout(() => useToastStore.setState({ show: false }), 1900);
      return { msg, show: true, _t };
    }),
}));
export const toast = (msg) => useToastStore.getState().push(msg);
export function Toast() {
  const { msg, show } = useToastStore();
  return <div className={cx("toast", show && "show")}>{msg}</div>;
}

/* ── Card ──────────────────────────────────────────────── */
export function Card({ children, className, pad, ...rest }) {
  return (
    <div className={cx("card", pad === "sm" && "card-pad-sm", className)} {...rest}>
      {children}
    </div>
  );
}

/* ── Button ────────────────────────────────────────────── */
export function Button({ variant = "ghost", sm, icon, children, className, ...rest }) {
  return (
    <button
      className={cx("btn", `btn-${variant}`, sm && "btn-sm", icon && !children && "btn-icon", className)}
      {...rest}
    >
      {icon && <span aria-hidden>{icon}</span>}
      {children}
    </button>
  );
}

/* ── Field / Input / Select ────────────────────────────── */
export function Field({ label, children, style }) {
  return (
    <label className="field" style={style}>
      {label && <span className="lbl">{label}</span>}
      {children}
    </label>
  );
}
export function Input({ className, ...rest }) {
  return <input className={cx("inp", className)} {...rest} />;
}
export function Select({ className, children, ...rest }) {
  return (
    <select className={cx("inp", className)} {...rest}>
      {children}
    </select>
  );
}

/* ── Pill ──────────────────────────────────────────────── */
export function Pill({ cat, children }) {
  return <span className={cx("pill", `pill-${cat}`)}>{children}</span>;
}

/* ── StatCard ──────────────────────────────────────────── */
export function StatCard({ label, value, tone, sub }) {
  return (
    <div className={cx("stat", tone)}>
      <div className="k">{label}</div>
      <div className={cx("v", sub && "sm")}>{value}</div>
      {sub && <div className="sub" style={{ marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

/* ── EmptyState ────────────────────────────────────────── */
export function EmptyState({ icon, children }) {
  return (
    <div className="empty">
      <span className="ic">{icon}</span>
      {children}
    </div>
  );
}

/* ── Modal ─────────────────────────────────────────────── */
export function Modal({ title, subtitle, onClose, children, footer, maxW = 560 }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div className="ov" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: maxW }}>
        <div className="modal-h">
          <div>
            <h3>{title}</h3>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <button className="modal-x" onClick={onClose} aria-label="Kapat">
            ×
          </button>
        </div>
        <div className="modal-b">{children}</div>
        {footer && <div className="modal-f">{footer}</div>}
      </div>
    </div>
  );
}
