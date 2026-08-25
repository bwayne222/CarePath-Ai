# CarePath AI

Build a production-quality AI healthcare discovery and symptom guidance web application called "CarePath AI".

This is a student hackathon project for UnivaBio, a global student health-tech competition. The goal is to create an impressive, functional, real-data healthcare platform that helps a person understand which type of medical care they may need and discover real nearby doctors, hospitals and clinics.

IMPORTANT:

This must NOT be a generic chatbot.

This must NOT use fake doctors, fake hospitals, fake ratings, fake phone numbers or invented reviews.

The healthcare provider discovery system must be designed around real external location/place data APIs.

Do not fabricate medical facts, provider information, reviews, ratings, addresses or contact information.

CORE PRODUCT CONCEPT

A user may have symptoms but may not know:

- what kind of medical problem they may be experiencing

- how urgent the situation could be

- which medical specialty they should visit

- which real doctors, hospitals or clinics are nearby

- which healthcare providers have good ratings

- what patients commonly mention in reviews

- where the healthcare provider is located

- how to contact or navigate to the provider

CarePath AI should guide the user through this process.

PRIMARY USER FLOW

1. Landing page

2. User starts "Check My Symptoms"

3. AI asks conversational follow-up questions

4. AI identifies possible health categories, not a definitive diagnosis

5. AI determines an appropriate medical specialty

6. AI determines urgency:

   - Emergency

   - Urgent

   - Routine

7. Ask for location permission

8. If location permission is unavailable, allow manual city/location search

9. Search real nearby healthcare providers using external Places/location APIs

10. Show hospitals, clinics and healthcare providers relevant to the recommended specialty

11. Show real provider information:

   - Name

   - Type

   - Address

   - Phone number

   - Distance when available

   - Rating

   - Number of reviews when available

   - Opening hours when available

   - Website when available

   - Google Maps link

   - Available photos

   - Real reviews when available

12. Analyze available review information to generate a clearly labeled review summary

13. Show positive themes and negative themes found in reviews

14. Let the user compare providers

15. Let the user open directions

16. Let the user call the provider

17. Let the user open the provider website

18. Clearly distinguish verified external data from AI-generated interpretation.

MEDICAL SAFETY

The application must never present an AI-generated response as a confirmed medical diagnosis.

Use wording such as:

"Based on the symptoms you described, these are possible conditions or health concerns that may be relevant. A qualified healthcare professional should evaluate you for an actual diagnosis."

Never say:

"You definitely have X."

"You are suffering from X."

"This confirms that you have X."

Instead use:

"Possible causes include..."

"These symptoms can be associated with..."

"A healthcare professional should assess this."

The system should identify emergency red flags.

If symptoms suggest a potentially life-threatening emergency, prioritize emergency guidance rather than ordinary doctor discovery.

For example, if the user describes severe chest pain, difficulty breathing, severe bleeding, loss of consciousness, signs of stroke, severe allergic reaction, suicidal emergency, or another potentially life-threatening situation, display a highly visible emergency warning and advise the user to contact their local emergency service or seek immediate emergency care.

Do not delay emergency guidance while performing provider recommendations.

Do not provide medication prescriptions or personalized medication dosages.

Do not replace a doctor.

The product is a healthcare navigation and symptom guidance assistant, not a diagnostic medical device.

DESIGN DIRECTION

Create a premium modern medical technology interface.

Visual identity:

- Deep navy

- White / very light backgrounds

- Teal / emerald healthcare accent

- Subtle blue secondary accents

- Soft shadows

- Rounded cards

- Clean typography

- Professional medical iconography

- Generous whitespace

- Smooth micro-interactions

- Modern dashboard feel

- Responsive on desktop, tablet and mobile

Avoid:

- childish medical graphics

- excessive gradients

- overly bright colors

- clutter

- generic AI chatbot appearance

- excessive glassmorphism

- fake statistics

- stock-looking healthcare dashboards

The design should look like a serious health-tech startup product.

BRAND

Name:

CarePath AI

Tagline:

"Understand your symptoms. Find the right care."

Alternative supporting message:

"From symptoms to the right healthcare provider, with real local information."

LANDING PAGE

Create a visually impressive landing page.

Hero section:

CAREPATH AI

Understand your symptoms.

Find the right care.

Supporting text:

"CarePath AI helps you understand what type of medical care may be appropriate and discover real healthcare providers near you using live location and place information."

Primary CTA:

"Check My Symptoms"

Secondary CTA:

"Find Healthcare Near Me"

Include a clean healthcare illustration or abstract medical-tech visual.

Show three core benefits:

1. AI Symptom Guidance

"Describe what you're experiencing and receive structured guidance about possible health concerns and the appropriate medical specialty."

2. Real Local Providers

"Discover real hospitals, clinics and healthcare providers near your location."

3. Review Intelligence

"Understand common themes in available patient reviews before choosing where to go."

Add a small trust/safety section:

"AI guidance is informational and does not replace professional medical diagnosis or treatment."

APP NAVIGATION

Create a clean navigation:

Home

Symptom Check

Find Care

Saved Providers

About

On mobile use a bottom navigation where appropriate.

SYMPTOM CHECK EXPERIENCE

Build a conversational AI interface.

Opening message:

"Hi, I'm CarePath AI. Tell me what you're experiencing, and I'll help you understand what type of medical care may be appropriate."

Ask structured follow-up questions.

Potential questions:

- What symptoms are you experiencing?

- When did they start?

- Are they getting better, worse, or staying the same?

- How severe are they?

- Where exactly are you experiencing the problem?

- Do you have any other symptoms?

- Have you experienced this before?

- Are there any warning signs such as severe pain, difficulty breathing, fainting, severe bleeding, confusion or sudden weakness?

Do not ask every question unnecessarily.

The AI should dynamically ask only relevant questions.

Use a conversational interface with:

- user message bubbles

- AI message bubbles

- quick-select options where useful

- severity selector

- symptom chips

- progress indicator

- "Edit answer" capability

- "Start over" capability

At the end show:

SYMPTOM SUMMARY

What you told us:

- Symptoms

- Duration

- Severity

- Related symptoms

POSSIBLE HEALTH CONCERNS

Show 2-4 possible categories/conditions when appropriate.

For each:

- Name

- Short explanation

- Why it may relate to the described symptoms

- Important uncertainty statement

Never claim certainty.

RECOMMENDED CARE

Show:

Recommended specialty:

Example:

"General Physician"

"Dermatologist"

"Cardiologist"

"Neurologist"

"ENT Specialist"

"Gastroenterologist"

"Orthopedic Specialist"

"Gynecologist"

"Urologist"

"Ophthalmologist"

"Psychiatrist"

etc.

Also show:

Urgency:

Emergency / Urgent / Routine

Reason:

A concise explanation.

LOCATION FLOW

After symptom assessment ask:

"Where would you like to find care?"

Options:

"Use my current location"

"Search by city"

"Search by area"

If the browser supports geolocation, request location permission.

If permission is denied:

show manual location search.

Do not block the user permanently if location permission is denied.

Allow examples:

Rawalpindi

Islamabad

Lahore

Karachi

Peshawar

etc.

REAL HEALTHCARE PROVIDER SEARCH

Integrate a real places/location API.

Preferred source:

Google Places API (New), where available and legally/technically appropriate.

Use:

- Nearby Search

- Text Search

- Place Details

- Place Photos

- Place IDs

- Maps links

Use secure backend/API configuration.

Never expose private API credentials in frontend code.

The search should use:

- user coordinates OR searched city/area

- recommended medical specialty

- hospital/clinic/doctor-related search terms

- appropriate radius

- ranking/relevance

Examples:

If specialty = dermatologist:

search for dermatologists, dermatology clinics and relevant hospitals.

If specialty = cardiologist:

search for cardiologists, cardiology clinics and hospitals with cardiology services.

If emergency:

prioritize emergency departments and hospitals.

PROVIDER RESULTS PAGE

Create a beautiful split-screen healthcare discovery experience.

Desktop:

Left:

Provider list

Right:

Interactive map

Mobile:

Provider list first

Map toggle button

Provider card should include:

Provider name

Provider type

Rating

Review count

Address

Distance if available

Open/closed status if available

Phone

Website

Photo

Specialty relevance

"View Details"

"Directions"

"Call"

Never invent missing fields.

If a field is unavailable:

hide it or display "Not available".

MAP

Show real provider locations.

Use provider coordinates from the location API.

Use numbered or specialty-colored markers.

Clicking a marker should highlight the corresponding provider card.

Add:

- Search this area

- Recenter on me

- Zoom controls

PROVIDER DETAILS PAGE

Create an excellent provider detail screen.

Header:

Provider image/photo

Provider name

Provider category

Rating

Review count

Information:

Address

Phone

Website

Opening hours

Distance

Specialty relevance

Actions:

Call

Directions

Website

Save

REVIEWS

Display real reviews returned by the external place/review API where permitted.

Never fabricate reviews.

Show:

- Rating

- Review text

- Review date when available

- Reviewer attribution when required by the API/platform

Include a source indicator such as:

"Reviews provided through Google Maps / Google Places."

Do not present copied reviews as original CarePath AI content.

REVIEW INTELLIGENCE

Create an AI-generated review analysis section based ONLY on reviews actually available from the external data source.

Title:

"Patient Review Insights"

Sections:

What patients commonly liked

What patients commonly mentioned negatively

Common themes

Overall sentiment

Important:

This is an AI-generated summary of available reviews.

Do not claim:

"Patients agree that..."

unless the available review evidence actually supports it.

Use cautious wording:

"Common themes in the available reviews include..."

If insufficient reviews are available:

"Not enough review data was available to generate a reliable summary."

PROVIDER COMPARISON

Allow users to select up to 3 providers.

Comparison table:

Provider

Rating

Review count

Distance

Hours

Phone

Website

Specialty relevance

Review sentiment/themes

Do not create fake scores.

You may calculate a transparent CarePath Match score ONLY if the underlying data exists.

If a score is used, show how it was calculated.

Example:

CarePath Match

- Specialty relevance: 40%

- Distance: 20%

- Rating: 20%

- Review volume: 10%

- Availability: 10%

Make it clear this is an application-generated ranking, not a medical quality certification.

SAVED PROVIDERS

Allow users to save providers.

Saved page:

- Provider name

- Location

- Specialty

- Rating

- Saved date

- View details

DATABASE

Create appropriate relational data structures.

Suggested entities:

Users

SymptomsSessions

Symptoms

AIAssessments

MedicalSpecialties

Providers

ProviderSearches

SavedProviders

ReviewSnapshots

UserLocations

SearchHistory

Provider records must support external provider IDs such as:

place_id.

Store:

- provider name

- external ID

- type

- specialty

- address

- latitude

- longitude

- phone

- website

- rating

- review count

- opening hours

- maps URL

- photos

- source

- last updated timestamp

Do not treat external provider data as permanently static.

Store the source and last updated time.

AI ARCHITECTURE

Use Momen AI Agent.

Create a dedicated healthcare navigation AI agent.

The agent should have:

System instructions

Conversation context

Structured output

Safety rules

External provider search tools

AI output should preferably be structured JSON internally.

Suggested output:

{

  "summary": "...",

  "possible_conditions": [],

  "recommended_specialty": "...",

  "urgency": "routine|urgent|emergency",

  "red_flags": [],

  "follow_up_questions": [],

  "safety_message": "..."

}

The frontend should render this structured output into polished UI components.

AI PROVIDER SEARCH TOOL

Create an AI tool/action that can call the healthcare provider search API.

Inputs:

- specialty

- latitude

- longitude

- city

- radius

- emergency flag

Output:

structured provider results.

The AI must NOT invent provider results.

It can only recommend providers returned by the provider search tool.

API SECURITY

All API keys and private credentials must remain server-side.

Use Momen Actionflow secrets where appropriate.

Never place private API keys directly inside frontend components.

Handle:

- API failures

- rate limits

- empty results

- location denied

- invalid city

- unavailable fields

- timeout

- malformed API response

Show user-friendly error states.

NO FAKE DATA POLICY

Do not generate placeholder doctors that look real.

Do not generate fake ratings.

Do not generate fake reviews.

Do not generate fake addresses.

Do not generate fake phone numbers.

For development/testing, use clearly labeled mock data only if an external API has not yet been connected.

Never present mock data as real data.

ABOUT PAGE

Explain:

What CarePath AI does

How the symptom guidance works

How provider information is sourced

How reviews are handled

AI limitations

Privacy

Safety

PRIVACY

Do not unnecessarily store sensitive symptom information.

Provide clear consent before storing personal information.

Location should be used only when needed for provider discovery.

Provide:

"Use my location"

"Enter location manually"

Avoid collecting unnecessary personal information.

EMERGENCY UX

Create a special emergency state.

If emergency red flags are detected:

Large warning panel:

"Your symptoms may require immediate medical attention."

Then:

"Please seek emergency medical care now or contact your local emergency service."

Provide:

"Find Nearby Hospitals"

Do not bury emergency guidance below normal recommendations.

ACCESSIBILITY

Use:

- high contrast

- readable typography

- keyboard navigation

- accessible buttons

- clear focus states

- meaningful labels

- mobile-friendly touch targets

RESPONSIVE DESIGN

Desktop:

premium dashboard layout

Tablet:

adaptive two-column layout

Mobile:

mobile-first healthcare experience

Make sure:

- cards don't overflow

- maps remain usable

- buttons remain accessible

- text is readable

- navigation becomes mobile friendly

LOADING STATES

Create polished skeleton loaders for:

AI assessment

Provider search

Map

Provider details

Reviews

Do not show blank screens.

EMPTY STATES

Examples:

"No healthcare providers matching this specialty were found nearby."

"Try expanding your search area."

"No review information is currently available."

ERROR STATES

Examples:

"We couldn't access your location."

"Try searching by city instead."

"Healthcare provider data is temporarily unavailable."

DEMO MODE

Create a clearly labeled optional demo mode for hackathon presentation if live API credentials are not available during judging.

Important:

Demo mode must be clearly marked as DEMO DATA.

Production/live mode must use real external provider data.

HACKATHON DEMO EXPERIENCE

Make the primary demo extremely polished.

Demo scenario:

User says:

"I've had a persistent skin rash on my arm for two weeks. It is itchy and getting worse."

AI asks relevant follow-up questions.

AI produces:

Possible concern categories

Recommended specialty: Dermatology

Urgency: Routine unless red flags are present

User selects:

"Use my current location"

System searches nearby real providers.

Show:

Dermatologists

Dermatology clinics

Relevant hospitals

User opens a provider.

Show:

Real name

Real location

Real rating

Real reviews when available

Phone

Directions

Website

Then show:

"Patient Review Insights"

Then compare 2-3 providers.

The entire flow should feel like one coherent product rather than separate pages.

FINAL QUALITY BAR

This should look like a serious startup product that could be shown to:

- healthcare organizations

- university judges

- investors

- developers

- patients

Do not build a basic CRUD dashboard.

Do not build a generic ChatGPT clone.

Build a complete healthcare navigation product with:

AI symptom guidance

safety-aware triage

specialty recommendation

location-aware provider discovery

real provider data

real reviews where available

review intelligence

map

provider comparison

saved providers

responsive UX

secure API architecture

clear data provenance

Prioritize working functionality over decorative elements.

If an external integration requires configuration that cannot be completed automatically, create the full integration structure, clearly identify the required API credentials/configuration, and make the rest of the application functional without breaking.

At the end, ensure every major button and user flow is functional and connected.

Do not leave dead buttons or fake interactions.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://findmy-doc-ai.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/0ce83308-9d51-4fa1-b1d9-b4dd93a45000).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
