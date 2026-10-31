import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number, currency: string = "UZS"): string {
  return (
    new Intl.NumberFormat("uz-UZ", {
      style: "decimal",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount) +
    " " +
    currency
  );
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("uz-UZ", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat("uz-UZ", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    draft: "bg-gray-100 text-gray-800",
    pending: "bg-yellow-100 text-yellow-800",
    approved: "bg-green-100 text-green-800",
    accepted: "bg-green-100 text-green-800",
    scheduled: "bg-blue-100 text-blue-800",
    in_progress: "bg-purple-100 text-purple-800",
    completed: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
    rejected: "bg-red-100 text-red-800",
    revision_needed: "bg-orange-100 text-orange-800",
    suspended: "bg-red-100 text-red-800",
    disputed: "bg-red-100 text-red-800",
    paid: "bg-green-100 text-green-800",
    refunded: "bg-gray-100 text-gray-800",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
}

export const getStatusBadgeClass = getStatusColor;

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    draft: "Qoralama",
    pending: "Kutilmoqda",
    approved: "Tasdiqlangan",
    accepted: "Qabul qilingan",
    scheduled: "Rejalashtirilgan",
    in_progress: "Jarayonda",
    completed: "Yakunlangan",
    cancelled: "Bekor qilingan",
    rejected: "Rad etilgan",
    revision_needed: "Tuzatish kerak",
    suspended: "Cheklangan",
    disputed: "Nizoda",
    paid: "To'langan",
    held: "Band qilingan",
    refund_pending: "Qaytarim kutilmoqda",
    refunded: "Qaytarilgan",
    active: "Faol",
    closed: "Yopilgan",
    open: "Ochiq",
    investigating: "Tekshirilmoqda",
    resolved: "Hal qilingan",
    dismissed: "Rad etilgan",
    verified: "Tekshirilgan",
  };
  return labels[status] || status;
}

