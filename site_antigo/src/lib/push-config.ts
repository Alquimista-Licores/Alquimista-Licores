// Public VAPID key — safe to ship to the browser.
export const VAPID_PUBLIC_KEY =
  "BNP8tH5fPUeNrAAeplTHO-fxnkWkMsPATZEwCitTz5faM18BHhChyGTdUZyD4b4TBDR7y2aQRuMwOLUrGtlwxG0";

export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}