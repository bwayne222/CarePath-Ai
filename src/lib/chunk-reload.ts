// Recovers from stale asset chunks after a new deployment.
// When the browser holds an old page whose hashed JS chunks no longer exist,
// the dynamic import fails and the screen goes blank. Reload once to fetch
// the fresh build.

const RELOAD_KEY = "carepath:chunk-reloaded-at";
const COOLDOWN_MS = 30_000;

function isStaleChunkError(message: string): boolean {
  return (
    /Failed to fetch dynamically imported module/i.test(message) ||
    /error loading dynamically imported module/i.test(message) ||
    /Importing a module script failed/i.test(message) ||
    /ChunkLoadError/i.test(message)
  );
}

function reloadOnce() {
  try {
    const last = Number(sessionStorage.getItem(RELOAD_KEY) ?? "0");
    if (Date.now() - last < COOLDOWN_MS) return;
    sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
  } catch {
    // sessionStorage unavailable — still attempt a single reload
  }
  window.location.reload();
}

export function installChunkReload() {
  if (typeof window === "undefined") return;

  window.addEventListener("vite:preloadError", (event) => {
    event.preventDefault();
    reloadOnce();
  });

  window.addEventListener("error", (event) => {
    const msg = event.message ?? String((event as ErrorEvent).error ?? "");
    if (isStaleChunkError(msg)) reloadOnce();
  });

  window.addEventListener("unhandledrejection", (event) => {
    const reason = event.reason as { message?: string } | string | undefined;
    const msg = typeof reason === "string" ? reason : (reason?.message ?? "");
    if (isStaleChunkError(msg)) reloadOnce();
  });
}
