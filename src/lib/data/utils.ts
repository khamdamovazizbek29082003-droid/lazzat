import type { WorkingHours } from "./types";

/** Same shape as the real submissions route: `+998XXXXXXXXX`. */
export const OWNER_PHONE_RE = /^\+998\d{9}$/;

export function isValidOwnerPhone(phone: string) {
  return OWNER_PHONE_RE.test(phone.replace(/[\s-]/g, ""));
}

function todayIndex() {
  return (new Date().getDay() + 6) % 7; // JS: Sun=0..Sat=6 -> Mon=0..Sun=6
}

export function isOpenNow(hours: WorkingHours[]): boolean {
  const today = hours.find((h) => h.dayOfWeek === todayIndex());
  if (!today || today.isClosed) return false;
  if (today.opensAt === null || today.closesAt === null) return true; // 24h
  const now = new Date();
  const cur = now.getHours() * 60 + now.getMinutes();
  const [oh, om] = today.opensAt.split(":").map(Number);
  const [ch, cm] = today.closesAt.split(":").map(Number);
  const openMin = oh * 60 + om;
  const closeMin = ch * 60 + cm;
  if (closeMin <= openMin) return cur >= openMin || cur < closeMin; // spans past midnight
  return cur >= openMin && cur < closeMin;
}

export function closesAtLabel(hours: WorkingHours[]): string | null {
  const today = hours.find((h) => h.dayOfWeek === todayIndex());
  if (!today || today.isClosed || !today.closesAt) return null;
  return today.closesAt;
}

export function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function formatUzs(amount: number) {
  return `${amount.toLocaleString("en-US").replace(/,/g, " ")} so'm`;
}
