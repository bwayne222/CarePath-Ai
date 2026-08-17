export type Urgency = "emergency" | "urgent" | "routine";

export type ChatTurn = { role: "user" | "assistant"; content: string };

export type PossibleCondition = {
  name: string;
  explanation: string;
  why_relevant: string;
};

export type Assessment = {
  summary: string;
  collected: {
    symptoms: string;
    duration: string;
    severity: string;
    related_symptoms: string;
  };
  possible_conditions: PossibleCondition[];
  recommended_specialty: string;
  urgency: Urgency;
  urgency_reason: string;
  red_flags: string[];
  safety_message: string;
};

export type TriageTurn = {
  reply: string;
  phase: "asking" | "assessment";
  quick_replies: string[];
  assessment: Assessment | null;
};

export type Provider = {
  place_id: string;
  name: string;
  type: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  phone: string | null;
  website: string | null;
  rating: number | null;
  review_count: number | null;
  open_now: boolean | null;
  opening_hours: string[] | null;
  maps_url: string | null;
  photo_names: string[];
  distance_km: number | null;
  specialty_relevance: number;
  source: "google_places";
  last_updated: string;
};

export type ProviderReview = {
  author: string | null;
  rating: number | null;
  text: string | null;
  relative_time: string | null;
  publish_time: string | null;
};

export type ProviderDetails = {
  provider: Provider;
  reviews: ProviderReview[];
  editorial_summary: string | null;
};

export type ReviewInsights = {
  enough_data: boolean;
  message: string;
  liked: string[];
  criticised: string[];
  themes: string[];
  sentiment: string;
  reviews_analyzed: number;
};

export type SearchResult = {
  providers: Provider[];
  center: { lat: number; lng: number } | null;
  resolved_location: string | null;
  query_used: string;
  demo: boolean;
};