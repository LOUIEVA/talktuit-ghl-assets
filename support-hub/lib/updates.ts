export type ProductUpdate = {
  id: string;
  date: string;
  type: "New" | "Improved";
  category: string;
  title: string;
  summary: string;
};

export const curatedUpdates: ProductUpdate[] = [
  { id: "button-hover-effects", date: "July 31, 2026", type: "New", category: "Pages", title: "Button hover effects are now built in", summary: "Add and preview 20 hover effects from the page builder, with controls for timing, easing, color and movement." },
  { id: "mobile-file-assistant", date: "July 31, 2026", type: "New", category: "Mobile", title: "Mobile assistants can read attached files", summary: "Attach a photo, PDF or media-library file from your phone and ask questions about its contents in the same chat." },
  { id: "gift-cards-staff-payments", date: "July 31, 2026", type: "New", category: "Payments", title: "Gift cards work in staff-led payment flows", summary: "Apply a customer’s gift-card balance when recording a payment, charging a card or creating an eligible subscription." },
  { id: "unified-client-home", date: "July 30, 2026", type: "Improved", category: "Client portal", title: "A unified home for client activity", summary: "Courses, communities, billing, files and account settings now share one connected client experience and navigation." },
  { id: "review-date-targeting", date: "July 30, 2026", type: "Improved", category: "Reputation", title: "Review campaigns gain exact date targeting", summary: "Choose a review date range, preview the eligible total and prevent empty review campaigns before launch." },
  { id: "review-request-senders", date: "July 30, 2026", type: "New", category: "Reputation", title: "Choose the sender for review requests", summary: "Set the default phone number and email address used for manual, campaign and automated review requests." },
  { id: "client-file-alerts", date: "July 30, 2026", type: "New", category: "Client portal", title: "Clients can receive file-share notifications", summary: "Clients are alerted on web and mobile when a team member shares a file, with notification controls in their preferences." },
  { id: "integration-token-limit", date: "July 27, 2026", type: "Improved", category: "Integrations", title: "More private integration tokens per workspace", summary: "The per-workspace token limit increased from 5 to 20, making it easier to keep separate integrations on dedicated credentials." },
  { id: "automatic-page-schema", date: "July 24, 2026", type: "New", category: "Pages", title: "Automatic schema markup for new pages", summary: "New websites, funnels and webinars can generate search-friendly schema at publish time while preserving any existing markup." },
  { id: "save-form-progress", date: "July 24, 2026", type: "New", category: "Forms", title: "Respondents can save multi-step progress", summary: "Enable save-and-resume for multi-step forms, surveys and quizzes so people can return without starting over." },
  { id: "associate-records", date: "July 24, 2026", type: "New", category: "Automation", title: "Workflows can associate matching records", summary: "Find records using field values and automatically connect contacts, companies, opportunities or custom records." },
  { id: "form-product-options", date: "July 23, 2026", type: "Improved", category: "Forms", title: "Forms support product prices and variants", summary: "Configure payment providers, product price levels and variants from one panel inside forms and surveys." },
];

