import { createFileRoute } from "@tanstack/react-router";
import { SiteNav } from "@/components/site-nav";
import { setDemoMode, useDemoMode } from "@/lib/care-session";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About CarePath AI — How our symptom guidance works" },
      {
        name: "description",
        content:
          "How CarePath AI guides symptoms to a medical specialty, where provider data and reviews come from, and the limits of AI health guidance.",
      },
      { property: "og:title", content: "About CarePath AI" },
      {
        property: "og:description",
        content:
          "Data sources, AI limitations, privacy and safety behind CarePath AI's healthcare navigation.",
      },
    ],
  }),
  component: AboutPage,
});

const sections = [
  {
    title: "What CarePath AI does",
    body: "CarePath AI is a healthcare navigation assistant. It helps you describe what you are experiencing, suggests the type of medical specialty that may be appropriate, flags how urgent the situation may be, and then helps you discover real healthcare providers near you.",
  },
  {
    title: "How the symptom guidance works",
    body: "Your description is sent to a large language model with strict safety instructions. It asks only the follow-up questions it still needs, then returns a structured assessment: possible health concern categories, a recommended specialty, an urgency level and any emergency red flags. It never produces a diagnosis and never recommends medication or dosages.",
  },
  {
    title: "How provider information is sourced",
    body: "Hospitals, clinics and healthcare providers come from the Google Places API (New), queried server-side through a secured gateway. Names, addresses, phone numbers, websites, opening hours, coordinates, ratings and photos are shown exactly as returned. CarePath AI never invents a provider, a rating or a contact detail. Fields that Google does not return are hidden or shown as unavailable.",
  },
  {
    title: "How reviews are handled",
    body: "Reviews are displayed as provided through Google Maps / Google Places, with their original attribution. The 'Patient Review Insights' panel is an AI-generated summary of only those reviews, clearly labelled as interpretation. When fewer than three usable reviews exist, no summary is generated.",
  },
  {
    title: "AI limitations",
    body: "The assessment is informational. Language models can be wrong, can miss context and cannot examine you. Possible conditions are categories worth discussing with a clinician, not conclusions. Ratings and review themes are not measures of clinical quality.",
  },
  {
    title: "Privacy",
    body: "Symptom conversations are kept in your browser session only and are cleared when you close the tab. Saved providers are stored in your browser's local storage. Your location is requested only at the moment provider discovery needs it, and you can always enter a city manually instead. No account is required and no personal profile is collected.",
  },
  {
    title: "Safety",
    body: "If your description contains potential emergency red flags, CarePath AI stops the questioning immediately and shows emergency guidance before anything else. CarePath AI cannot contact emergency services for you and is not a medical device.",
  },
];

function AboutPage() {
  const demo = useDemoMode();
  return (
    <div className="min-h-screen pb-24 md:pb-0">
      <SiteNav />
      <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
        <h1 className="text-3xl font-bold sm:text-4xl">About CarePath AI</h1>
        <p className="mt-3 text-muted-foreground">
          Understand your symptoms. Find the right care. Here is exactly how it works and where
          every piece of information comes from.
        </p>

        <div className="mt-8 space-y-4">
          {sections.map((s) => (
            <section key={s.title} className="card-soft p-5">
              <h2 className="text-lg font-semibold">{s.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
            </section>
          ))}
        </div>

        <section className="card-soft mt-4 p-5">
          <h2 className="text-lg font-semibold">Demo mode</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            For presentations without live API access, demo mode replaces provider results with a
            handful of records that are explicitly prefixed with “DEMO”. It is never used as real
            data.
          </p>
          <button
            type="button"
            onClick={() => setDemoMode(!demo)}
            className="focus-ring mt-4 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold hover:bg-secondary"
          >
            {demo ? "Switch back to live data" : "Enable demo mode"}
          </button>
        </section>

        <p className="mt-8 rounded-xl bg-surface p-4 text-xs text-muted-foreground">
          AI guidance is informational and does not replace professional medical diagnosis or
          treatment. In an emergency, contact your local emergency service immediately.
        </p>
      </main>
    </div>
  );
}