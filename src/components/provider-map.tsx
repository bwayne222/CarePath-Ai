import { useEffect, useRef, useState } from "react";
import { Crosshair, RefreshCw } from "lucide-react";
import type { Provider } from "@/lib/types";

declare global {
  interface Window {
    google?: typeof google;
    __carePathMapReady?: () => void;
  }
}

let loaderPromise: Promise<void> | null = null;

function loadMaps(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("no window"));
  if (window.google?.maps) return Promise.resolve();
  if (loaderPromise) return loaderPromise;
  const key = import.meta.env["VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY"];
  const channel = import.meta.env["VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_TRACKING_ID"] ?? "";
  if (!key) return Promise.reject(new Error("Map is not configured."));
  loaderPromise = new Promise<void>((resolve, reject) => {
    window.__carePathMapReady = () => resolve();
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&loading=async&callback=__carePathMapReady&channel=${channel}`;
    script.async = true;
    script.onerror = () => reject(new Error("The map could not be loaded."));
    document.head.appendChild(script);
  });
  return loaderPromise;
}

type Props = {
  providers: Provider[];
  center: { lat: number; lng: number } | null;
  selectedId: string | null;
  onSelect: (placeId: string) => void;
  onSearchArea?: (center: { lat: number; lng: number }) => void;
  onRecenter?: () => void;
};

export function ProviderMap({
  providers,
  center,
  selectedId,
  onSelect,
  onSearchArea,
  onRecenter,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadMaps()
      .then(() => {
        if (cancelled || !containerRef.current || !window.google) return;
        mapRef.current = new window.google.maps.Map(containerRef.current, {
          center: center ?? { lat: 33.6844, lng: 73.0479 },
          zoom: 12,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });
        setReady(true);
      })
      .catch((e: Error) => !cancelled && setError(e.message));
    return () => {
      cancelled = true;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!ready || !mapRef.current || !window.google) return;
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];
    const bounds = new window.google.maps.LatLngBounds();
    providers.forEach((p, i) => {
      if (p.latitude === null || p.longitude === null) return;
      const position = { lat: p.latitude, lng: p.longitude };
      const marker = new window.google!.maps.Marker({
        position,
        map: mapRef.current,
        title: p.name,
        label: {
          text: String(i + 1),
          color: "#ffffff",
          fontSize: "11px",
          fontWeight: "700",
        },
        icon: {
          path: window.google!.maps.SymbolPath.CIRCLE,
          scale: p.place_id === selectedId ? 15 : 12,
          fillColor: p.place_id === selectedId ? "#0f766e" : "#1e3a5f",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 2,
        },
      });
      marker.addListener("click", () => onSelect(p.place_id));
      markersRef.current.push(marker);
      bounds.extend(position);
    });
    if (center) bounds.extend(center);
    if (!bounds.isEmpty()) mapRef.current.fitBounds(bounds, 48);
  }, [providers, ready, selectedId, center, onSelect]);

  if (error) {
    return (
      <div className="card-soft grid h-full min-h-64 place-items-center p-6 text-center text-sm text-muted-foreground">
        {error} Provider results are still listed on the left.
      </div>
    );
  }

  return (
    <div className="relative h-full min-h-64 overflow-hidden rounded-2xl border border-border shadow-soft">
      <div ref={containerRef} className="size-full" role="application" aria-label="Provider map" />
      {!ready ? <div className="absolute inset-0 animate-pulse bg-surface" /> : null}
      <div className="absolute top-3 left-1/2 flex -translate-x-1/2 gap-2">
        {onSearchArea ? (
          <button
            type="button"
            onClick={() => {
              const c = mapRef.current?.getCenter();
              if (c) onSearchArea({ lat: c.lat(), lng: c.lng() });
            }}
            className="focus-ring inline-flex items-center gap-1.5 rounded-full bg-background px-3 py-2 text-xs font-semibold shadow-lift"
          >
            <RefreshCw className="size-3.5" aria-hidden /> Search this area
          </button>
        ) : null}
        {onRecenter ? (
          <button
            type="button"
            onClick={onRecenter}
            className="focus-ring inline-flex items-center gap-1.5 rounded-full bg-background px-3 py-2 text-xs font-semibold shadow-lift"
          >
            <Crosshair className="size-3.5" aria-hidden /> Recenter on me
          </button>
        ) : null}
      </div>
    </div>
  );
}