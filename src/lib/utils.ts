import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  }).format(new Date(date));
}

export function formatDateShort(date: Date | string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric", month: "short", year: "numeric",
  }).format(new Date(date));
}

export function formatDateTime(date: Date | string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  }).format(new Date(date));
}

export function formatPoints(n: number) {
  return new Intl.NumberFormat("id-ID").format(n);
}

export function isUpcoming(date: Date | string) {
  return new Date(date) > new Date();
}

export function getAvatarUrl(avatarId: string | null | undefined): string {
  if (!avatarId) return "/avatars/default.png";
  return `/avatars/${avatarId}`;
}
