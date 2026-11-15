/**
 * Business profile for the CMS message assistant.
 *
 * This is the ONE file to rewrite when this inflow system is installed for a
 * different business (dentist, vet, real-estate agent...). Everything the
 * assistant is allowed to state as fact about the business lives here; the
 * rest of the assistant code is business-agnostic.
 */

export interface BusinessProfile {
  name: string;
  /** One line: what the business is and where. */
  about: string;
  /** Who signs the messages / how the business speaks. */
  voice: string;
  /** What the customer's personal page is called in messages. */
  portalName: string;
  /** What a booked slot is called ("session", "appointment", "viewing"). */
  bookingNoun: string;
  services: { name: string; details: string }[];
  /** Maps the stored slot value to what the customer should be told. */
  timeSlots: Record<string, string>;
  locations: { name: string; mapUrl?: string }[];
  /** Hard facts and policies. The assistant may not go beyond these. */
  policies: string[];
  /** What the customer has to do on their personal page before the booking. */
  portalSteps: string[];
  /** One-click instructions shown as chips in the admin. */
  quickInstructions: { label: string; instruction: string }[];
}

export const BUSINESS: BusinessProfile = {
  name: 'FlyFoil Formosa',
  about:
    'Premium eFoil (electric hydrofoil) lessons and experiences in the Ria Formosa and East Algarve, Portugal.',
  voice:
    'Warm, upbeat and professional, like a friendly instructor. Short WhatsApp-style messages, first person plural ("we"), at most one or two emojis.',
  portalName: 'Flight Deck',
  bookingNoun: 'session',
  services: [
    { name: '1h Solo Flight', details: '60 minutes, private 1:1 with an instructor. €150 total.' },
    { name: 'Duo Pack (2 people)', details: '75 minutes total, one shared board, rotating. €80 per person, €160 total.' },
    { name: 'Trio Pack (3+ people)', details: '90 minutes total, one shared board. €60 per person, from €180 total. Groups larger than 3 get a custom time block and quote.' },
    { name: 'The Adventure Pack', details: '90+ minutes, one-way coastal downwinder for riders who can already fly (e.g. Fuseta to Cabanas). Includes safety tracking and the Uber back to the start. €250 total.' },
  ],
  timeSlots: {
    morning: 'Morning, 10:00 - 13:00',
    evening: 'Evening, 15:00 - 18:00',
  },
  locations: [
    { name: 'Cabanas de Tavira', mapUrl: 'https://maps.app.goo.gl/TvbPDjfErXy9HZCs5' },
    { name: 'Fuseta', mapUrl: 'https://maps.app.goo.gl/tCEZ3PV1yBfs6pv16' },
    { name: 'Altura', mapUrl: 'https://maps.app.goo.gl/8k9dtbJvcXWXBqws5' },
    { name: 'Beliche Lake', mapUrl: 'https://maps.app.goo.gl/i2eAvh75ym1L32iz5' },
    { name: 'The Adventure Pack' },
  ],
  policies: [
    'A 50% deposit is required to confirm the booking; the slot is not held until it is paid.',
    'Exact times and locations may change with weather and tide conditions; we confirm closer to the day.',
    'Included: qualified instructor, safety briefing, life jacket, helmet, public liability and accident insurance.',
    'Wetsuits are available; the customer picks a size on their Flight Deck.',
    'Riders must be able to swim (100 m).',
    'No previous experience is needed for the Solo, Duo and Trio sessions.',
    'Gift vouchers are available.',
  ],
  portalSteps: [
    'Confirm the health declaration',
    'Sign the digital waiver',
    'Tell us their board-sport experience',
    'Watch the short Flight School safety video and tick the checks',
    'Choose a wetsuit size if they need one',
  ],
  quickInstructions: [
    {
      label: 'Send booking details',
      instruction:
        'Confirm the date, time and location, send their Flight Deck link and ask them to complete the steps there, and send the payment link for the 50% deposit that confirms the booking.',
    },
    {
      label: 'Answer their questions',
      instruction: 'Answer the questions they asked in the conversation, then nudge them towards choosing a date.',
    },
    {
      label: 'Ask for booking info',
      instruction:
        'Greet them and ask for what we need to set up the booking: full name, email, preferred date and morning/evening, how many people, and any board-sport experience.',
    },
    {
      label: 'Deposit received',
      instruction: 'Thank them, confirm we received the deposit and that the booking is confirmed. Remind them of anything still pending on their Flight Deck.',
    },
    {
      label: 'Remind pending steps',
      instruction: 'Friendly reminder to finish the steps still pending on their Flight Deck (and the deposit if unpaid) before the session.',
    },
  ],
};
