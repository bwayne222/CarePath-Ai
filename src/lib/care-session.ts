import { useCallback, useEffect, useState } from "react";
import type { Assessment, Provider } from "./types";

export type CareLocation = {
  lat: number | null;
  lng: number | null;
  label: string;
  mode: "geolocation" | "manual";
};

export type SavedProvider = Provider & { saved_at: string; specialty_context: string };

const ASSESSMENT_KEY = "carepath.assessment";
const LOCATION_KEY = "carepath.location";
const SAVED_KEY = "carepath.saved";
const DEMO_KEY = "carepath.demo";

function read<T>(key: string, storage: "session" | "local"): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = (storage === "session" ? sessionStorage : localStorage).getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown, storage: "session" | "local") {
  if (typeof window === "undefined") return;
  const store = storage === "session" ? sessionStorage : localStorage;
  if (value === null) store.removeItem(key);
  else store.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent("carepath:store", { detail: key }));
}

/** Symptom details stay in sessionStorage only — cleared when the tab closes. */
export const getAssessment = () => read<Assessment>(ASSESSMENT_KEY, "session");
export const setAssessment = (a: Assessment | null) => write(ASSESSMENT_KEY, a, "session");
export const getLocation = () => read<CareLocation>(LOCATION_KEY, "session");
export const setLocation = (l: CareLocation | null) => write(LOCATION_KEY, l, "session");
export const getDemoMode = () => read<boolean>(DEMO_KEY, "local") ?? false;
export const setDemoMode = (v: boolean) => write(DEMO_KEY, v, "local");
export const getSaved = () => read<SavedProvider[]>(SAVED_KEY, "local") ?? [];

export function toggleSaved(provider: Provider, specialty: string) {
  const current = getSaved();
  const exists = current.some((p) => p.place_id === provider.place_id);
  const next = exists
    ? current.filter((p) => p.place_id !== provider.place_id)
    : [
        ...current,
        { ...provider, saved_at: new Date().toISOString(), specialty_context: specialty },
      ];
  write(SAVED_KEY, next, "local");
  return !exists;
}

function useStoreValue<T>(getter: () => T): [T, () => void] {
  const [value, setValue] = useState<T>(getter);
  const refresh = useCallback(() => setValue(getter()), [getter]);
  useEffect(() => {
    refresh();
    const handler = () => refresh();
    window.addEventListener("carepath:store", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("carepath:store", handler);
      window.removeEventListener("storage", handler);
    };
  }, [refresh]);
  return [value, refresh];
}

export function useSavedProviders() {
  const [saved] = useStoreValue<SavedProvider[]>(getSaved);
  return saved;
}

export function useDemoMode() {
  const [demo] = useStoreValue<boolean>(getDemoMode);
  return demo;
}

export function useCareSession() {
  const [assessment] = useStoreValue<Assessment | null>(getAssessment);
  const [location] = useStoreValue<CareLocation | null>(getLocation);
  return { assessment, location };
}

export function requestBrowserLocation(): Promise<CareLocation> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      reject(new Error("Your browser does not support location access."));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          label: "Your current location",
          mode: "geolocation",
        }),
      () => reject(new Error("We couldn't access your location. Try searching by city instead.")),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  });
}