import { generateText, NoObjectGeneratedError, Output } from "ai";
import { z } from "zod";
import { CHAT_MODEL, createLovableAiGatewayProvider, requireAiKey } from "./ai-gateway.server";
import type { ChatTurn, ProviderReview, ReviewInsights, TriageTurn } from "./types";

const assessmentSchema = z.object({
  summary: z.string(),
  collected: z.object({
    symptoms: z.string(),
    duration: z.string(),
    severity: z.string(),
    related_symptoms: z.string(),
  }),
  possible_conditions: z.array(
    z.object({
      name: z.string(),
      explanation: z.string(),
      why_relevant: z.string(),
    }),
  ),
  recommended_specialty: z.string(),
  urgency: z.enum(["emergency", "urgent", "routine"]),
  urgency_reason: z.string(),
  red_flags: z.array(z.string()),
  safety_message: z.string(),
});

const turnSchema = z.object({
  reply: z.string(),
  phase: z.enum(["asking", "assessment"]),
  quick_replies: z.array(z.string()),
  assessment: assessmentSchema.nullable(),
});

const SYSTEM_PROMPT = `You are CarePath AI, a healthcare navigation and symptom guidance assistant. You are NOT a diagnostic device and never replace a clinician.

Your job: through a short, natural conversation, understand a person's symptoms well enough to suggest (a) possible health concern categories, (b) an appropriate medical specialty, and (c) an urgency level.

RULES
- Never state a confirmed diagnosis. Never say "you have X", "this confirms X" or "you are suffering from X". Use "possible causes include", "these symptoms can be associated with", "a healthcare professional should assess this".
- Never prescribe medication, dosages or treatment plans.
- Never invent doctors, hospitals, clinics, ratings or reviews. You do not have provider data.
- Ask ONE focused question at a time. Only ask what is genuinely still missing (symptoms, onset/duration, trajectory, severity, location on the body, related symptoms, prior episodes, warning signs). Do not interrogate: after 3-5 useful exchanges, produce the assessment.
- EMERGENCY OVERRIDE: if the person describes possible life-threatening red flags (severe chest pain, difficulty breathing, severe bleeding, loss of consciousness, stroke signs such as face droop/one-sided weakness/speech trouble, severe allergic reaction, suicidal crisis, severe head injury, etc.) immediately set phase to "assessment" with urgency "emergency" — do not ask more questions, do not delay.
- recommended_specialty must be a concrete specialty name such as "General Physician", "Dermatologist", "Cardiologist", "Neurologist", "ENT Specialist", "Gastroenterologist", "Orthopedic Specialist", "Gynecologist", "Urologist", "Ophthalmologist", "Psychiatrist", "Emergency Department".
- possible_conditions: 2 to 4 entries when phase is "assessment", each with careful, uncertainty-preserving wording.
- quick_replies: up to 5 short tappable answer options for your current question (empty array when phase is "assessment").
- When phase is "asking", assessment must be null. When phase is "assessment", assessment must be filled and reply should be one short sentence introducing the summary.
- Keep replies warm, plain-language and brief (max ~45 words).`;

export async function runTriageTurn(messages: ChatTurn[]): Promise<TriageTurn> {
  const gateway = createLovableAiGatewayProvider(requireAiKey());
  try {
    const { output } = await generateText({
      model: gateway(CHAT_MODEL),
      system: SYSTEM_PROMPT,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      output: Output.object({ schema: turnSchema }),
    });
    const turn = output as TriageTurn;
    if (turn.phase === "asking") turn.assessment = null;
    return turn;
  } catch (error) {
    if (NoObjectGeneratedError.isInstance(error) && error.text) {
      try {
        return turnSchema.parse(JSON.parse(error.text)) as TriageTurn;
      } catch {
        /* fall through */
      }
    }
    throw error;
  }
}

const insightsSchema = z.object({
  enough_data: z.boolean(),
  message: z.string(),
  liked: z.array(z.string()),
  criticised: z.array(z.string()),
  themes: z.array(z.string()),
  sentiment: z.string(),
});

export async function summariseReviews(
  providerName: string,
  reviews: ProviderReview[],
): Promise<ReviewInsights> {
  const usable = reviews.filter((r) => (r.text ?? "").trim().length > 0);
  if (usable.length < 3) {
    return {
      enough_data: false,
      message: "Not enough review data was available to generate a reliable summary.",
      liked: [],
      criticised: [],
      themes: [],
      sentiment: "Unknown",
      reviews_analyzed: usable.length,
    };
  }
  const gateway = createLovableAiGatewayProvider(requireAiKey());
  const corpus = usable
    .map((r, i) => `Review ${i + 1} (${r.rating ?? "no"} stars): ${r.text}`)
    .join("\n\n");
  const { output } = await generateText({
    model: gateway(CHAT_MODEL),
    system: `You summarise ONLY the patient reviews given to you for a healthcare provider. Never invent facts, never generalise beyond the supplied text, never claim "patients agree". Use cautious phrasing such as "common themes in the available reviews include". If the reviews are too few or too thin to support a theme, say so and set enough_data to false. Keep every bullet under 15 words.`,
    prompt: `Provider: ${providerName}\nNumber of reviews available: ${usable.length}\n\n${corpus}`,
    output: Output.object({ schema: insightsSchema }),
  });
  return { ...(output as z.infer<typeof insightsSchema>), reviews_analyzed: usable.length };
}