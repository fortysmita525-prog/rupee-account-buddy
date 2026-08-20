export const inr = (value: number | string | null | undefined) => {
  const n = Number(value ?? 0);
  const safe = Number.isFinite(n) ? n : 0;
  const formatted = new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: safe % 1 === 0 ? 0 : 2,
    minimumFractionDigits: 0,
  }).format(Math.abs(safe));
  return `${safe < 0 ? "-" : ""}₹${formatted}`;
};

export const parseAmount = (raw: string) => {
  const n = Number(String(raw).replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : 0;
};

export const todayISO = () => new Date().toISOString().slice(0, 10);

export const fmtDate = (iso: string | null | undefined) => {
  if (!iso) return "—";
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

export const addMonths = (iso: string, months: number) => {
  const [y, m, d] = iso.split("-").map(Number);
  const base = new Date(Date.UTC(y, (m ?? 1) - 1, 1));
  base.setUTCMonth(base.getUTCMonth() + months);
  const daysInMonth = new Date(
    Date.UTC(base.getUTCFullYear(), base.getUTCMonth() + 1, 0),
  ).getUTCDate();
  base.setUTCDate(Math.min(d ?? 1, daysInMonth));
  return base.toISOString().slice(0, 10);
};

export const daysBetween = (fromISO: string, toISO: string) =>
  Math.round(
    (new Date(`${toISO}T00:00:00`).getTime() - new Date(`${fromISO}T00:00:00`).getTime()) / 86400000,
  );

export const greeting = (date = new Date()) => {
  const h = date.getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
};

export const longToday = (date = new Date()) =>
  date.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
