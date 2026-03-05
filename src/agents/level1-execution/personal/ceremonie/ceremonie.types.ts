// ===============================================================
// Ceremonie Agent — Type Definitions ("Maitre de Ceremonie")
// ===============================================================

// -- Task Types --

export type CeremonieTaskType = 'plan' | 'guests' | 'timeline' | 'budget';

// -- Event Types --

export type EventType =
  | 'anniversaire'
  | 'mariage'
  | 'fete'
  | 'reunion_famille'
  | 'baby_shower'
  | 'pendaison_cremaillere'
  | 'noel'
  | 'autre';

export type EventStatus = 'draft' | 'planning' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';

export type RSVPStatus = 'pending' | 'confirmed' | 'declined' | 'maybe';

// -- Event --

export interface TimelineMilestone {
  label: string;
  daysBeforeEvent: number;
  description: string;
  isDone: boolean;
  tasks: string[];
}

export interface MenuItem {
  name: string;
  category: 'entree' | 'plat' | 'dessert' | 'boisson' | 'aperitif' | 'autre';
  quantity: number;
  dietaryNotes: string | null;
  estimatedCostCents: number;
}

export interface Event {
  id: string;
  userId: string;
  eventType: EventType;
  title: string;
  eventDate: string;
  venue: string | null;
  budgetCents: number;
  spentCents: number;
  guestCount: number;
  status: EventStatus;
  timeline: TimelineMilestone[];
  menu: MenuItem[];
  createdAt: Date;
  updatedAt: Date;
}

// -- Guests --

export interface Guest {
  id: string;
  eventId: string;
  name: string;
  email: string | null;
  phone: string | null;
  rsvpStatus: RSVPStatus;
  dietary: string | null;
  plusOne: boolean;
  tableNumber: number | null;
  createdAt: Date;
  updatedAt: Date;
}

// -- Budget --

export interface EventBudgetItem {
  id: string;
  eventId: string;
  category: string;
  description: string;
  estimatedCents: number;
  actualCents: number | null;
  isPaid: boolean;
  vendor: string | null;
}

// -- RSVP Summary --

export interface RSVPSummary {
  total: number;
  confirmed: number;
  declined: number;
  maybe: number;
  pending: number;
  plusOnes: number;
}

// -- Task Payloads --

export interface PlanPayload {
  type: 'plan';
  userId: string;
  eventType: EventType;
  title: string;
  eventDate: string;
  venue?: string;
  budgetCents?: number;
  guestCount?: number;
}

export interface GuestsPayload {
  type: 'guests';
  userId: string;
  eventId: string;
  action: 'list' | 'add' | 'update_rsvp' | 'summary';
  guestData?: Partial<Guest>;
}

export interface TimelinePayload {
  type: 'timeline';
  userId: string;
  eventId: string;
  eventType?: EventType;
}

export interface BudgetPayload {
  type: 'budget';
  userId: string;
  eventId: string;
  action: 'overview' | 'add_item' | 'update_item';
  budgetItem?: Partial<EventBudgetItem>;
}
