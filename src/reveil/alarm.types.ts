export type AlarmMode = 'doux' | 'dur' | 'sympa' | 'drole' | 'fou' | 'motivant' | 'zen' | 'energique';
export type DeliveryMethod = 'phone_call' | 'whatsapp_message';
export type AlarmTriggerStatus = 'pending' | 'triggered' | 'delivered' | 'failed';

export const ALARM_MODES: { id: AlarmMode; label: string; emoji: string; description: string; color: string }[] = [
  { id: 'doux', label: 'Doux', emoji: '🌸', description: 'Réveil en douceur, voix calme et apaisante', color: '#93c5fd' },
  { id: 'dur', label: 'Dur', emoji: '🔥', description: 'Réveil direct et sans détour, énergie brute', color: '#ef4444' },
  { id: 'sympa', label: 'Sympa', emoji: '😊', description: 'Réveil chaleureux et bienveillant', color: '#4ade80' },
  { id: 'drole', label: 'Drôle', emoji: '😂', description: 'Réveil humoristique, blagues et absurdités', color: '#fb923c' },
  { id: 'fou', label: 'Fou', emoji: '🤪', description: 'Réveil déjanté et imprévisible', color: '#a855f7' },
  { id: 'motivant', label: 'Motivant', emoji: '💪', description: 'Réveil coach, énergie et motivation', color: '#eab308' },
  { id: 'zen', label: 'Zen', emoji: '🧘', description: 'Réveil méditatif, pleine conscience', color: '#2dd4bf' },
  { id: 'energique', label: 'Énergique', emoji: '⚡', description: 'Réveil dynamique, musique et énergie', color: '#f43f5e' },
];

export const ALARM_RUBRICS: { id: string; label: string; emoji: string; description: string; requiresInput?: 'date' | 'text' }[] = [
  { id: 'bonne_humeur', label: 'Bonne humeur douce', emoji: '🌈', description: 'Message positif pour bien commencer la journée' },
  { id: 'meteo', label: 'Météo', emoji: '☀️', description: 'Prévisions météo de la journée' },
  { id: 'astrologie', label: 'Astrologie', emoji: '♈', description: 'Horoscope du jour selon votre signe', requiresInput: 'date' },
  { id: 'annonce_perso', label: 'Annonce personnalisée', emoji: '📢', description: 'Votre message personnalisé du matin', requiresInput: 'text' },
  { id: 'energies_jour', label: 'Énergies du jour', emoji: '✨', description: 'Vibrations et énergies spirituelles' },
  { id: 'news', label: 'News / Actualités', emoji: '📰', description: 'Résumé des principales actualités' },
  { id: 'citation', label: 'Citation du jour', emoji: '💎', description: 'Citation inspirante pour vous motiver' },
  { id: 'conseil_bien_etre', label: 'Conseil bien-être', emoji: '🧠', description: 'Astuce santé, respiration ou méditation' },
  { id: 'resume_agenda', label: 'Résumé agenda', emoji: '📅', description: 'Vos rendez-vous et tâches du jour' },
  { id: 'rappel_objectifs', label: 'Rappel objectifs', emoji: '🎯', description: 'Vos objectifs en cours et priorités' },
  { id: 'blague', label: 'Blague du jour', emoji: '🃏', description: 'Une blague pour rire dès le matin' },
  { id: 'horoscope_chinois', label: 'Horoscope chinois', emoji: '🐉', description: 'Sagesse et prévisions chinoises', requiresInput: 'date' },
  { id: 'gratitude', label: 'Moment gratitude', emoji: '🙏', description: 'Réflexion de gratitude pour commencer positif' },
  { id: 'fun_fact', label: 'Fun fact du jour', emoji: '🧪', description: 'Fait amusant ou surprenant à découvrir' },
  { id: 'musique_suggeree', label: 'Musique suggérée', emoji: '🎵', description: 'Suggestion musicale selon votre humeur' },
  { id: 'defi_jour', label: 'Défi du jour', emoji: '🏆', description: 'Un petit challenge quotidien à relever' },
  { id: 'anecdote_histoire', label: 'Anecdote historique', emoji: '📜', description: 'Ce qui s\'est passé ce jour dans l\'histoire' },
  { id: 'conseil_productivite', label: 'Conseil productivité', emoji: '⏱️', description: 'Astuce pour être plus efficace aujourd\'hui' },
];

export interface UserAlarm {
  id: string;
  userId: string;
  name: string;
  isActive: boolean;
  alarmTime: string; // HH:MM
  timezone: string;
  daysOfWeek: number[];
  mode: AlarmMode;
  rubrics: string[];
  voice: string;
  deliveryMethod: DeliveryMethod;
  phoneNumber: string | null;
  customAnnouncement: string | null;
  birthDate: string | null;
  lastTriggeredAt: string | null;
  lastTriggerStatus: AlarmTriggerStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAlarmInput {
  name?: string;
  alarmTime?: string;
  timezone?: string;
  daysOfWeek?: number[];
  mode?: AlarmMode;
  rubrics?: string[];
  voice?: string;
  deliveryMethod?: DeliveryMethod;
  phoneNumber?: string;
  customAnnouncement?: string;
  birthDate?: string;
}

export interface UpdateAlarmInput extends Partial<CreateAlarmInput> {
  isActive?: boolean;
}
