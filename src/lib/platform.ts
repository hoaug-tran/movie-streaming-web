"use client";

export function isIOSDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  const isIPhoneIPad = /iPhone|iPad|iPod/i.test(ua);
  const isIPadOSDesktop =
    /Macintosh/i.test(ua) &&
    typeof navigator.maxTouchPoints === "number" &&
    navigator.maxTouchPoints > 1;
  return isIPhoneIPad || isIPadOSDesktop;
}

export function isSafariBrowser(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  const isSafari = /Safari/i.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS|Chrome/i.test(ua);
  return isSafari;
}

export function isIOSStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (window.navigator as { standalone?: boolean }).standalone === true;
}

export function isStandaloneDisplay(): boolean {
  if (typeof window === "undefined") return false;
  if (window.matchMedia?.("(display-mode: standalone)").matches) return true;
  return isIOSStandalone();
}

export function getIOSVersion(): number | null {
  if (typeof navigator === "undefined") return null;
  const ua = navigator.userAgent || "";
  const match = ua.match(/OS (\d+)_/i);
  if (match) return parseInt(match[1], 10);
  return null;
}

export function isIPhoneDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  return /iPhone|iPod/i.test(ua);
}
