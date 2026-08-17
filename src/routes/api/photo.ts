import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/photo")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const name = url.searchParams.get("name");
        const width = Number(url.searchParams.get("w") ?? 800);
        if (!name || !/^places\/[A-Za-z0-9_\-]+\/photos\/[A-Za-z0-9_\-]+$/.test(name)) {
          return new Response("Invalid photo reference", { status: 400 });
        }
        try {
          const { fetchPlacePhoto } = await import("@/lib/places.server");
          return await fetchPlacePhoto(name, Math.min(1600, Math.max(200, width)));
        } catch (error) {
          console.error("Place photo failed", error);
          return new Response("Photo unavailable", { status: 502 });
        }
      },
    },
  },
});