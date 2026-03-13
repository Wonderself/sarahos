'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useUserData } from '../../../lib/use-user-data';
import BriefingTab from './BriefingTab';
import HelpBubble from '../../../components/HelpBubble';
import { PAGE_META } from '../../../lib/emoji-map';
import PageExplanation from '../../../components/PageExplanation';
import { useIsMobile } from '../../../lib/use-media-query';
import { CU, pageContainer, headerRow, emojiIcon } from '../../../lib/page-styles';

// ═══════════════════════════════════════════════════════
//  Freenzy.io — Ma Journee (My Day Dashboard)
//  38 widgets in 6 categories, all toggleable
// ═══════════════════════════════════════════════════════

const API_BASE = process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:3010';

// ─── Types ───

interface TodoItem { id: string; text: string; done: boolean; }
interface ObjectifItem { id: string; text: string; done: boolean; }
interface PrioriteItem { id: string; text: string; rank: number; }
interface RappelItem { id: string; text: string; time: string; done: boolean; }
interface EcheanceItem { id: string; text: string; date: string; priority: 'haute' | 'moyenne' | 'basse'; }
interface ReunionItem { id: string; title: string; time: string; duration: string; participants: string; }
interface HabitItem { id: string; label: string; emoji: string; streak: number; doneToday: boolean; }
interface ContactItem { id: string; name: string; phone: string; emoji: string; }
interface BirthdayItem { id: string; name: string; date: string; }
interface ExerciseItem { id: string; text: string; }

interface JourneeData {
  [key: string]: unknown;
  todos: TodoItem[];
  objectifs: ObjectifItem[];
  priorites: PrioriteItem[];
  notes: string;
  pomodoroTimeLeft: number;
  pomodoroRunning: boolean;
  pomodoroMode: 'work' | 'break';
  pomodoroSessions: number;
  focusMinutes: number;
  focusRunning: boolean;
  focusStartedAt: number;
  schedule: Record<number, string>;
  reunions: ReunionItem[];
  rappels: RappelItem[];
  echeances: EcheanceItem[];
  mood: number;
  waterCount: number;
  exercises: ExerciseItem[];
  meditationPreset: number;
  meditationTimeLeft: number;
  meditationRunning: boolean;
  meditationTotal: number;
  sleepHours: number;
  gratitude: string[];
  affirmation: string;
  affirmationIndex: number;
  weatherCity: string;
  quoteIndex: number;
  horoscopeSign: string;
  newsTab: string;
  birthdays: BirthdayItem[];
  budgetLimit: number;
  budgetSpent: number;
  kpiNotes: string;
  yesterdaySummary: string;
  mealPetitDej: string;
  mealDejeuner: string;
  mealDiner: string;
  mealSnack: string;
  currentBook: string;
  bookProgress: number;
  habits: HabitItem[];
  contacts: ContactItem[];
  playlistNote: string;
  playlistPreset: string;
  journal: string;
}

interface WidgetMeta {
  id: string;
  emoji: string;
  label: string;
  category: string;
  defaultVisible: boolean;
}

// ─── Widget Registry ───

const CATEGORIES = [
  { id: 'productivite', emoji: '\u{1F4BC}', label: 'Productivite' },
  { id: 'agenda', emoji: '\u{1F4C5}', label: 'Agenda & Organisation' },
  { id: 'bienetre', emoji: '\u{1F9D8}', label: 'Bien-etre' },
  { id: 'information', emoji: '\u{1F4F0}', label: 'Information' },
  { id: 'business', emoji: '\u{1F4CA}', label: 'Business / Freenzy' },
  { id: 'personnel', emoji: '\u{1F3E0}', label: 'Personnel' },
];

const WIDGETS: WidgetMeta[] = [
  { id: 'todos', emoji: '\u2705', label: 'Taches du jour', category: 'productivite', defaultVisible: true },
  { id: 'objectifs', emoji: '\u{1F3AF}', label: 'Objectifs du jour', category: 'productivite', defaultVisible: true },
  { id: 'priorites', emoji: '\u{1F3C5}', label: 'Priorites Top 3', category: 'productivite', defaultVisible: true },
  { id: 'notes', emoji: '\u{1F4DD}', label: 'Notes rapides', category: 'productivite', defaultVisible: true },
  { id: 'pomodoro', emoji: '\u23F1\uFE0F', label: 'Minuteur Pomodoro', category: 'productivite', defaultVisible: true },
  { id: 'focus', emoji: '\u{1F4A1}', label: 'Compteur Focus', category: 'productivite', defaultVisible: false },
  { id: 'schedule', emoji: '\u{1F550}', label: 'Planning horaire', category: 'productivite', defaultVisible: false },
  { id: 'calendrier', emoji: '\u{1F4C5}', label: 'Calendrier du jour', category: 'agenda', defaultVisible: true },
  { id: 'reunions', emoji: '\u{1F465}', label: 'Reunions du jour', category: 'agenda', defaultVisible: true },
  { id: 'rappels', emoji: '\u{1F514}', label: 'Rappels', category: 'agenda', defaultVisible: true },
  { id: 'echeances', emoji: '\u23F0', label: 'Echeances', category: 'agenda', defaultVisible: false },
  { id: 'semaine', emoji: '\u{1F4C6}', label: 'Planning semaine', category: 'agenda', defaultVisible: false },
  { id: 'humeur', emoji: '\u{1F60A}', label: 'Humeur du jour', category: 'bienetre', defaultVisible: true },
  { id: 'hydratation', emoji: '\u{1F4A7}', label: 'Tracker hydratation', category: 'bienetre', defaultVisible: true },
  { id: 'activite', emoji: '\u{1F3C3}', label: 'Activite physique', category: 'bienetre', defaultVisible: false },
  { id: 'meditation', emoji: '\u{1F9D8}', label: 'Meditation', category: 'bienetre', defaultVisible: false },
  { id: 'sommeil', emoji: '\u{1F319}', label: 'Sommeil', category: 'bienetre', defaultVisible: true },
  { id: 'gratitude', emoji: '\u2764\uFE0F', label: 'Gratitude', category: 'bienetre', defaultVisible: false },
  { id: 'affirmation', emoji: '\u2728', label: 'Affirmation du jour', category: 'bienetre', defaultVisible: false },
  { id: 'meteo', emoji: '\u{1F324}\uFE0F', label: 'Meteo', category: 'information', defaultVisible: true },
  { id: 'citation', emoji: '\u{1F4AC}', label: 'Citation du jour', category: 'information', defaultVisible: true },
  { id: 'horoscope', emoji: '\u{1F52E}', label: 'Horoscope', category: 'information', defaultVisible: false },
  { id: 'actualites', emoji: '\u{1F4F0}', label: 'Actualites', category: 'information', defaultVisible: false },
  { id: 'anniversaires', emoji: '\u{1F382}', label: 'Anniversaires', category: 'information', defaultVisible: false },
  { id: 'ephemeride', emoji: '\u{1F4D6}', label: 'Ephemeride', category: 'information', defaultVisible: false },
  { id: 'credits', emoji: '\u{1F4B3}', label: 'Credits restants', category: 'business', defaultVisible: true },
  { id: 'agents', emoji: '\u{1F916}', label: 'Agents actifs', category: 'business', defaultVisible: true },
  { id: 'messagesNonLus', emoji: '\u{1F514}', label: 'Messages non lus', category: 'business', defaultVisible: false },
  { id: 'projets', emoji: '\u{1F4C1}', label: 'Projets actifs', category: 'business', defaultVisible: false },
  { id: 'kpis', emoji: '\u{1F4CA}', label: 'KPIs du jour', category: 'business', defaultVisible: false },
  { id: 'resume', emoji: '\u{1F4CB}', label: 'Resume hier', category: 'business', defaultVisible: false },
  { id: 'budget', emoji: '\u{1F4B0}', label: 'Budget du jour', category: 'business', defaultVisible: false },
  { id: 'repas', emoji: '\u{1F37D}\uFE0F', label: 'Menu du jour', category: 'personnel', defaultVisible: false },
  { id: 'lecture', emoji: '\u{1F4D6}', label: 'Lecture en cours', category: 'personnel', defaultVisible: false },
  { id: 'habitudes', emoji: '\u{1F525}', label: 'Habitudes quotidiennes', category: 'personnel', defaultVisible: true },
  { id: 'contactsFav', emoji: '\u{1F4DE}', label: 'Contacts favoris', category: 'personnel', defaultVisible: false },
  { id: 'playlist', emoji: '\u{1F3B5}', label: 'Playlist du jour', category: 'personnel', defaultVisible: false },
  { id: 'journal', emoji: '\u{1F512}', label: 'Journal intime', category: 'personnel', defaultVisible: false },
];

// ─── Built-in Content ───

const FRENCH_QUOTES = [
  { text: "Le succ\u00e8s n'est pas final, l'\u00e9chec n'est pas fatal : c'est le courage de continuer qui compte.", author: 'Winston Churchill' },
  { text: "La vie, ce n'est pas d'attendre que l'orage passe, c'est d'apprendre \u00e0 danser sous la pluie.", author: 'S\u00e9n\u00e8que' },
  { text: "Il n'y a qu'une fa\u00e7on d'\u00e9chouer, c'est d'abandonner avant d'avoir r\u00e9ussi.", author: 'Georges Clemenceau' },
  { text: "Celui qui d\u00e9place une montagne commence par d\u00e9placer de petites pierres.", author: 'Confucius' },
  { text: "La seule limite \u00e0 notre \u00e9panouissement de demain sera nos doutes d'aujourd'hui.", author: 'Franklin Roosevelt' },
  { text: "Le bonheur n'est pas quelque chose de pr\u00eat \u00e0 l'emploi. Il vient de vos propres actions.", author: 'Dala\u00ef Lama' },
  { text: "Chaque matin nous renaissons. Ce que nous faisons aujourd'hui est ce qui compte le plus.", author: 'Bouddha' },
  { text: "L'imagination est plus importante que le savoir.", author: 'Albert Einstein' },
  { text: "La simplicit\u00e9 est la sophistication supr\u00eame.", author: 'L\u00e9onard de Vinci' },
  { text: "Ce qui ne te tue pas te rend plus fort.", author: 'Friedrich Nietzsche' },
  { text: "Soyez le changement que vous voulez voir dans le monde.", author: 'Mahatma Gandhi' },
  { text: "L'\u00e9ducation est l'arme la plus puissante pour changer le monde.", author: 'Nelson Mandela' },
  { text: "La plus grande gloire n'est pas de ne jamais tomber, mais de se relever \u00e0 chaque chute.", author: 'Confucius' },
  { text: "Il faut toujours viser la lune, car m\u00eame en cas d'\u00e9chec, on atterrit dans les \u00e9toiles.", author: 'Oscar Wilde' },
  { text: "Un voyage de mille lieues commence toujours par un premier pas.", author: 'Lao Tseu' },
  { text: "Le meilleur moment pour planter un arbre \u00e9tait il y a vingt ans. Le deuxi\u00e8me meilleur moment est maintenant.", author: 'Proverbe chinois' },
  { text: "La pers\u00e9v\u00e9rance est la noblesse de l'obstination.", author: 'Adrien Decourcelle' },
  { text: "On ne voit bien qu'avec le c\u0153ur. L'essentiel est invisible pour les yeux.", author: 'Antoine de Saint-Exup\u00e9ry' },
  { text: "Le g\u00e9nie est fait d'un pour cent d'inspiration et de quatre-vingt-dix-neuf pour cent de transpiration.", author: 'Thomas Edison' },
  { text: "La folie, c'est de faire toujours la m\u00eame chose et de s'attendre \u00e0 un r\u00e9sultat diff\u00e9rent.", author: 'Albert Einstein' },
  { text: "L\u00e0 o\u00f9 il y a une volont\u00e9, il y a un chemin.", author: 'Proverbe' },
  { text: "Croyez en vous et en tout ce que vous \u00eates. Sachez qu'il y a quelque chose \u00e0 l'int\u00e9rieur de vous qui est plus grand que tout obstacle.", author: 'Christian Larson' },
  { text: "Les grandes choses ne sont jamais faites par une seule personne. Elles sont faites par une \u00e9quipe.", author: 'Steve Jobs' },
  { text: "Le pessimiste se plaint du vent, l'optimiste esp\u00e8re qu'il va changer, le r\u00e9aliste ajuste les voiles.", author: 'William Arthur Ward' },
  { text: "N'attendez pas d'\u00eatre parfait pour commencer quelque chose de bien.", author: 'Abb\u00e9 Pierre' },
  { text: "La cr\u00e9ativit\u00e9, c'est l'intelligence qui s'amuse.", author: 'Albert Einstein' },
  { text: "Tout ce que l'esprit de l'homme peut concevoir et croire, il peut le r\u00e9aliser.", author: 'Napoleon Hill' },
  { text: "L'avenir appartient \u00e0 ceux qui croient \u00e0 la beaut\u00e9 de leurs r\u00eaves.", author: 'Eleanor Roosevelt' },
  { text: "La connaissance s'acquiert par l'exp\u00e9rience, tout le reste n'est que de l'information.", author: 'Albert Einstein' },
  { text: "Le talent gagne des matchs, mais le travail d'\u00e9quipe gagne des championnats.", author: 'Michael Jordan' },
  { text: "Faites de votre vie un r\u00eave, et d'un r\u00eave, une r\u00e9alit\u00e9.", author: 'Antoine de Saint-Exup\u00e9ry' },
  { text: "Le secret du changement consiste \u00e0 concentrer toute votre \u00e9nergie non pas \u00e0 lutter contre le pass\u00e9, mais \u00e0 construire l'avenir.", author: 'Socrate' },
  { text: "Agissez comme s'il \u00e9tait impossible d'\u00e9chouer.", author: 'Dorothea Brande' },
  { text: "La meilleure fa\u00e7on de pr\u00e9dire l'avenir est de le cr\u00e9er.", author: 'Peter Drucker' },
  { text: "Ne jugez pas chaque journ\u00e9e par la r\u00e9colte que vous faites, mais par les graines que vous plantez.", author: 'Robert Louis Stevenson' },
  { text: "Tout est possible \u00e0 qui r\u00eave, ose, travaille et n'abandonne jamais.", author: 'Xavier Dolan' },
  { text: "L'\u00e9chec est simplement l'opportunit\u00e9 de recommencer, cette fois de fa\u00e7on plus intelligente.", author: 'Henry Ford' },
  { text: "Ce que tu fais fait une diff\u00e9rence, et tu dois d\u00e9cider quel genre de diff\u00e9rence tu veux faire.", author: 'Jane Goodall' },
  { text: "Le courage n'est pas l'absence de peur, mais la capacit\u00e9 de vaincre ce qui fait peur.", author: 'Nelson Mandela' },
  { text: "La discipline est le pont entre les objectifs et la r\u00e9alisation.", author: 'Jim Rohn' },
];

const AFFIRMATIONS = [
  "Je suis capable de r\u00e9aliser de grandes choses aujourd'hui.",
  "Chaque d\u00e9fi est une opportunit\u00e9 de grandir.",
  "Je m\u00e9rite le succ\u00e8s et je travaille pour l'atteindre.",
  "Mon \u00e9nergie positive attire de bonnes choses dans ma vie.",
  "Je suis reconnaissant pour ce que j'ai et enthousiaste pour ce qui vient.",
  "Je choisis d'\u00eatre heureux et de r\u00e9pandre la joie autour de moi.",
  "Ma cr\u00e9ativit\u00e9 est illimit\u00e9e et mes id\u00e9es ont de la valeur.",
  "Je suis en paix avec mon pass\u00e9 et optimiste pour mon avenir.",
  "Chaque jour est une nouvelle chance de devenir meilleur.",
  "Je suis fort, r\u00e9silient et capable de surmonter tous les obstacles.",
  "Mon potentiel est infini et je le lib\u00e8re chaque jour.",
  "Je suis entour\u00e9 d'amour, de soutien et d'abondance.",
  "Je fais confiance au processus et j'avance avec conviction.",
  "Ma voix compte et mes contributions ont un impact.",
  "Je suis la meilleure version de moi-m\u00eame aujourd'hui.",
  "L'univers conspire en ma faveur.",
  "Je transforme mes r\u00eaves en objectifs et mes objectifs en r\u00e9alit\u00e9.",
  "Je suis digne d'amour, de r\u00e9ussite et de bonheur.",
  "Ma d\u00e9termination est plus forte que mes doutes.",
  "Je choisis la gratitude et l'optimisme \u00e0 chaque instant.",
  "Chaque respiration me remplit d'\u00e9nergie positive.",
  "Je suis un aimant pour les opportunit\u00e9s et l'abondance.",
  "Mon travail a du sens et contribue au monde.",
  "Je m'autorise \u00e0 briller et \u00e0 inspirer les autres.",
  "Aujourd'hui sera une journ\u00e9e extraordinaire.",
  "Je suis exactement l\u00e0 o\u00f9 je dois \u00eatre dans mon parcours.",
  "Ma pers\u00e9v\u00e9rance est ma plus grande force.",
  "Je cultive la paix int\u00e9rieure dans tout ce que je fais.",
  "Chaque petit pas me rapproche de mes grands r\u00eaves.",
  "Je suis le cr\u00e9ateur de ma propre r\u00e9alit\u00e9.",
];

const ZODIAC_SIGNS = [
  { id: 'belier', emoji: '\u2648', label: 'B\u00e9lier', dates: '21 mars - 19 avril' },
  { id: 'taureau', emoji: '\u2649', label: 'Taureau', dates: '20 avril - 20 mai' },
  { id: 'gemeaux', emoji: '\u264A', label: 'G\u00e9meaux', dates: '21 mai - 20 juin' },
  { id: 'cancer', emoji: '\u264B', label: 'Cancer', dates: '21 juin - 22 juillet' },
  { id: 'lion', emoji: '\u264C', label: 'Lion', dates: '23 juillet - 22 ao\u00fbt' },
  { id: 'vierge', emoji: '\u264D', label: 'Vierge', dates: '23 ao\u00fbt - 22 sept.' },
  { id: 'balance', emoji: '\u264E', label: 'Balance', dates: '23 sept. - 22 oct.' },
  { id: 'scorpion', emoji: '\u264F', label: 'Scorpion', dates: '23 oct. - 21 nov.' },
  { id: 'sagittaire', emoji: '\u2650', label: 'Sagittaire', dates: '22 nov. - 21 d\u00e9c.' },
  { id: 'capricorne', emoji: '\u2651', label: 'Capricorne', dates: '22 d\u00e9c. - 19 janv.' },
  { id: 'verseau', emoji: '\u2652', label: 'Verseau', dates: '20 janv. - 18 f\u00e9v.' },
  { id: 'poissons', emoji: '\u2653', label: 'Poissons', dates: '19 f\u00e9v. - 20 mars' },
];

const ZODIAC_MESSAGES = [
  "Les astres vous sourient aujourd'hui. Profitez de cette \u00e9nergie positive pour avancer dans vos projets. Une rencontre inattendue pourrait changer votre perspective.",
  "Journ\u00e9e favorable pour les d\u00e9cisions importantes. Votre intuition est votre meilleur guide. C\u00f4t\u00e9 c\u0153ur, une belle surprise vous attend.",
  "Votre cr\u00e9ativit\u00e9 est \u00e0 son apog\u00e9e. Laissez-vous porter par l'inspiration. Un message important arrivera dans l'apr\u00e8s-midi.",
  "Prenez soin de vous aujourd'hui. Le repos est aussi productif que l'action. Une opportunit\u00e9 financi\u00e8re se profile \u00e0 l'horizon.",
  "Votre charisme naturel brille de mille feux. C'est le moment id\u00e9al pour convaincre et inspirer votre entourage.",
  "L'organisation est votre force aujourd'hui. Profitez-en pour mettre de l'ordre dans vos projets et vos id\u00e9es.",
  "L'harmonie r\u00e8gne dans vos relations. C'est le moment id\u00e9al pour r\u00e9soudre un conflit en douceur ou renforcer des liens.",
  "Votre d\u00e9termination est sans faille. Les obstacles ne sont que des tremplins vers votre r\u00e9ussite. Foncez !",
  "L'aventure vous appelle ! Osez sortir de votre zone de confort, les r\u00e9sultats d\u00e9passeront vos attentes.",
  "Votre patience sera r\u00e9compens\u00e9e. Les efforts accumul\u00e9s portent enfin leurs fruits. Restez concentr\u00e9 sur vos objectifs.",
  "Votre originalit\u00e9 est votre plus grand atout. N'ayez pas peur d'\u00eatre diff\u00e9rent, c'est ce qui fait votre force.",
  "Votre sensibilit\u00e9 est une force. \u00c9coutez votre c\u0153ur et laissez votre imagination vous guider vers de nouveaux horizons.",
];

const EPHEMERIDE: Record<string, string[]> = {
  '01-01': ["Jour de l'An", "1804 : Ha\u00efti d\u00e9clare son ind\u00e9pendance"],
  '01-06': ["\u00c9piphanie", "1412 : Naissance de Jeanne d'Arc"],
  '01-27': ["Journ\u00e9e de la m\u00e9moire de l'Holocauste", "1756 : Naissance de Mozart"],
  '02-14': ["Saint-Valentin", "1876 : Graham Bell d\u00e9pose le brevet du t\u00e9l\u00e9phone"],
  '03-03': ["Journ\u00e9e mondiale de la vie sauvage", "1847 : Naissance d'Alexander Graham Bell"],
  '03-08': ["Journ\u00e9e internationale des droits des femmes"],
  '03-14': ["Journ\u00e9e de Pi (3.14)", "1879 : Naissance d'Albert Einstein"],
  '03-20': ["\u00c9quinoxe de printemps", "Journ\u00e9e internationale du bonheur"],
  '03-21': ["Journ\u00e9e mondiale de la po\u00e9sie", "Journ\u00e9e de la trisomie 21"],
  '04-01': ["Poisson d'Avril", "1976 : Fondation d'Apple"],
  '04-22': ["Jour de la Terre"],
  '05-01': ["F\u00eate du Travail"],
  '05-04': ["May the 4th be with you (Star Wars)"],
  '05-08': ["Victoire 1945", "Journ\u00e9e mondiale de la Croix-Rouge"],
  '06-05': ["Journ\u00e9e mondiale de l'environnement"],
  '06-21': ["F\u00eate de la musique", "Solstice d'\u00e9t\u00e9"],
  '07-04': ["F\u00eate nationale am\u00e9ricaine"],
  '07-14': ["F\u00eate nationale fran\u00e7aise \u2014 Prise de la Bastille 1789"],
  '07-20': ["1969 : Premier pas sur la Lune (Apollo 11)"],
  '08-15': ["Assomption"],
  '09-21': ["Journ\u00e9e internationale de la paix"],
  '10-04': ["1957 : Lancement de Spoutnik"],
  '10-31': ["Halloween"],
  '11-01': ["Toussaint"],
  '11-09': ["1989 : Chute du mur de Berlin"],
  '11-11': ["Armistice 1918"],
  '12-10': ["Journ\u00e9e des droits de l'homme", "Prix Nobel"],
  '12-21': ["Solstice d'hiver"],
  '12-25': ["No\u00ebl"],
  '12-31': ["Saint-Sylvestre"],
};

const SAINTS: Record<string, string> = {
  '01-01': 'Marie', '01-15': 'R\u00e9mi', '01-20': 'S\u00e9bastien', '02-14': 'Valentin',
  '03-01': 'Aubin', '03-03': 'Gu\u00e9nol\u00e9', '03-08': 'Jean de Dieu', '03-17': 'Patrick',
  '03-19': 'Joseph', '04-01': 'Hugues', '04-23': 'Georges', '05-01': 'J\u00e9r\u00e9mie',
  '05-26': 'B\u00e9reng\u00e8re', '06-13': 'Antoine', '06-24': 'Jean-Baptiste', '07-14': 'Camille',
  '07-26': 'Anne', '08-15': 'Marie', '09-29': 'Michel', '10-04': 'Fran\u00e7ois',
  '10-15': 'Th\u00e9r\u00e8se', '11-01': 'Toussaint', '11-11': 'Martin', '11-25': 'Catherine',
  '12-06': 'Nicolas', '12-25': 'No\u00ebl', '12-26': '\u00c9tienne', '12-31': 'Sylvestre',
};

const DEFAULT_HABITS: HabitItem[] = [
  { id: 'h1', label: 'M\u00e9diter', emoji: '\u{1F9D8}', streak: 0, doneToday: false },
  { id: 'h2', label: 'Exercice', emoji: '\u{1F3C3}', streak: 0, doneToday: false },
  { id: 'h3', label: 'Lire', emoji: '\u{1F4D6}', streak: 0, doneToday: false },
  { id: 'h4', label: 'Boire 2L', emoji: '\u{1F4A7}', streak: 0, doneToday: false },
  { id: 'h5', label: '\u00c9crire', emoji: '\u270F\uFE0F', streak: 0, doneToday: false },
];

const MOOD_OPTIONS = [
  { emoji: '\u{1F62B}', label: 'Terrible', color: CU.danger },
  { emoji: '\u{1F615}', label: 'Pas top', color: CU.warning },
  { emoji: '\u{1F610}', label: 'Neutre', color: CU.textSecondary },
  { emoji: '\u{1F60A}', label: 'Bien', color: CU.success },
  { emoji: '\u{1F929}', label: 'Super !', color: CU.text },
];

const NEWS_TABS = [
  { id: 'tech', label: 'Tech', items: ["L'IA g\u00e9n\u00e9rative transforme les m\u00e9tiers cr\u00e9atifs", "Nouveau record de performance pour les puces quantiques", "Les v\u00e9hicules autonomes progressent en Europe"] },
  { id: 'business', label: 'Business', items: ["Les march\u00e9s mondiaux en hausse cette semaine", "La French Tech continue son expansion internationale", "Le t\u00e9l\u00e9travail s'installe durablement dans les entreprises"] },
  { id: 'sport', label: 'Sport', items: ["R\u00e9sultats marquants de la journ\u00e9e sportive", "Pr\u00e9paration olympique : les athl\u00e8tes fran\u00e7ais se mobilisent", "Le e-sport reconnu comme discipline officielle"] },
  { id: 'culture', label: 'Culture', items: ["Nouveau film fran\u00e7ais prim\u00e9 au festival international", "Exposition exceptionnelle au Grand Palais", "Le streaming musical bat des records d'\u00e9coute"] },
];

const PLAYLIST_PRESETS: Record<string, string> = {
  concentration: 'Playlist Concentration : musique lo-fi, ambient, classique douce \u2014 parfait pour le deep work.',
  energie: 'Playlist \u00c9nergie : pop dynamique, rock, \u00e9lectro \u2014 pour booster votre productivit\u00e9 !',
  detente: 'Playlist D\u00e9tente : jazz chill, bossa nova, sons de la nature \u2014 pour d\u00e9compresser.',
  motivation: 'Playlist Motivation : hip-hop inspirant, musique \u00e9pique, discours motivants.',
};

// ─── Helpers ───

function uid(): string { return Math.random().toString(36).slice(2, 9); }

function getSession() {
  if (typeof window === 'undefined') return { token: '', displayName: '' };
  try { return JSON.parse(localStorage.getItem('fz_session') ?? '{}'); } catch { return {}; }
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 6) return 'Bonne nuit';
  if (h < 12) return 'Bonjour';
  if (h < 18) return 'Bon apr\u00e8s-midi';
  return 'Bonsoir';
}

function formatFrenchDate(d: Date = new Date()): string {
  const days = ['dimanche','lundi','mardi','mercredi','jeudi','vendredi','samedi'];
  const months = ['janvier','f\u00e9vrier','mars','avril','mai','juin','juillet','ao\u00fbt','septembre','octobre','novembre','d\u00e9cembre'];
  return `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function todayKey(): string {
  const d = new Date();
  return `${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function dayOfYear(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  return Math.floor((now.getTime() - start.getTime()) / 86400000);
}

function weekNumber(): number {
  const d = new Date();
  const oneJan = new Date(d.getFullYear(), 0, 1);
  return Math.ceil(((d.getTime() - oneJan.getTime()) / 86400000 + oneJan.getDay() + 1) / 7);
}

function getDefaultData(): JourneeData {
  return {
    todos: [], objectifs: [
      { id: uid(), text: '', done: false },
      { id: uid(), text: '', done: false },
      { id: uid(), text: '', done: false },
    ],
    priorites: [
      { id: uid(), text: '', rank: 1 },
      { id: uid(), text: '', rank: 2 },
      { id: uid(), text: '', rank: 3 },
    ],
    notes: '', pomodoroTimeLeft: 25 * 60, pomodoroRunning: false,
    pomodoroMode: 'work', pomodoroSessions: 0,
    focusMinutes: 0, focusRunning: false, focusStartedAt: 0,
    schedule: {}, reunions: [], rappels: [], echeances: [],
    mood: -1, waterCount: 0, exercises: [],
    meditationPreset: 5, meditationTimeLeft: 5 * 60, meditationRunning: false, meditationTotal: 0,
    sleepHours: 7, gratitude: ['', '', ''],
    affirmation: '', affirmationIndex: 0,
    weatherCity: 'Paris', quoteIndex: -1, horoscopeSign: '',
    newsTab: 'tech', birthdays: [], budgetLimit: 100, budgetSpent: 0,
    kpiNotes: '', yesterdaySummary: '',
    mealPetitDej: '', mealDejeuner: '', mealDiner: '', mealSnack: '',
    currentBook: '', bookProgress: 0,
    habits: [...DEFAULT_HABITS],
    contacts: [], playlistNote: '', playlistPreset: '',
    journal: '',
  };
}

// ─── Shared styles (CU-based) ───

const cardStyle: React.CSSProperties = {
  ...CU.card, overflow: 'hidden', transition: 'box-shadow 0.2s',
};
const cardHeaderStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: '12px 16px', cursor: 'pointer', background: 'transparent',
  border: 'none', width: '100%', fontFamily: 'inherit', textAlign: 'left',
};
const cardBodyStyle: React.CSSProperties = {
  padding: '0 16px 14px', borderTop: `1px solid ${CU.border}`,
};
const inputStyle: React.CSSProperties = {
  ...CU.input, background: CU.bgSecondary,
};
const btnSmStyle: React.CSSProperties = {
  ...CU.btnPrimary, height: 32, padding: '0 12px', fontSize: 12,
};
const btnGhostStyle: React.CSSProperties = {
  ...CU.btnGhost, height: 32, padding: '0 12px', fontSize: 12,
};
const progressBarOuter: React.CSSProperties = {
  width: '100%', height: 6, borderRadius: 3, background: CU.accentLight, overflow: 'hidden',
};

// ═══════════════════════════════════════════════════════
//  Main Component
// ═══════════════════════════════════════════════════════

export default function JourneePage() {
  const isMobile = useIsMobile();
  const defaultVis: Record<string, boolean> = {};
  WIDGETS.forEach(w => { defaultVis[w.id] = w.defaultVisible; });
  const { data: visibility, setData: setVisibility } = useUserData<Record<string, boolean>>('journee_visibility', defaultVis, 'fz_journee_visibility');
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>(() => {
    if (typeof window === 'undefined') return {};
    try { return JSON.parse(localStorage.getItem('fz_journee_collapsed') ?? '{}'); } catch { return {}; }
  });
  const { data, setData } = useUserData<JourneeData>('journee', getDefaultData(), 'fz_journee_data');
  const [showConfig, setShowConfig] = useState(false);
  const [configFilter, setConfigFilter] = useState('all');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [projectCount, setProjectCount] = useState(0);
  const [notifCount, setNotifCount] = useState(0);
  const [newTodoText, setNewTodoText] = useState('');
  const [newRappelText, setNewRappelText] = useState('');
  const [newRappelTime, setNewRappelTime] = useState('');
  const [newReunionTitle, setNewReunionTitle] = useState('');
  const [newReunionTime, setNewReunionTime] = useState('');
  const [newEcheanceText, setNewEcheanceText] = useState('');
  const [newEcheanceDate, setNewEcheanceDate] = useState('');
  const [newEcheancePrio, setNewEcheancePrio] = useState<'haute'|'moyenne'|'basse'>('moyenne');
  const [newBdayName, setNewBdayName] = useState('');
  const [newBdayDate, setNewBdayDate] = useState('');
  const [newHabitLabel, setNewHabitLabel] = useState('');
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newExerciseText, setNewExerciseText] = useState('');
  const pomodoroRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const meditationRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const focusRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const session = getSession();
  const [activeTab, setActiveTab] = useState<'briefing' | 'widgets'>('widgets');

  // ─── Persistence (useUserData handles localStorage + API sync) ───

  const updateData = useCallback((patch: Partial<JourneeData>) => {
    setData(prev => ({ ...prev, ...patch }));
  }, [setData]);

  // ─── Daily reset (visibility & data loaded by useUserData hook) ───

  const hasResetRef = useRef(false);
  useEffect(() => {
    if (hasResetRef.current) return;
    hasResetRef.current = true;
    try {
      const savedDate = localStorage.getItem('fz_journee_date');
      const today = new Date().toISOString().slice(0, 10);
      if (savedDate && savedDate !== today) {
        // Daily reset — keep persistent fields, reset transient ones
        setData(old => {
          const fresh = getDefaultData();
          return {
            ...fresh,
            notes: old.notes,
            echeances: old.echeances,
            birthdays: old.birthdays,
            habits: old.habits.map(h => ({ ...h, doneToday: false })),
            contacts: old.contacts,
            currentBook: old.currentBook,
            bookProgress: old.bookProgress,
            weatherCity: old.weatherCity,
            horoscopeSign: old.horoscopeSign,
            budgetLimit: old.budgetLimit,
            playlistNote: '',
            playlistPreset: '',
          };
        });
      }
      localStorage.setItem('fz_journee_date', today);
    } catch {}
  }, [setData]);

  // ─── Clock ───

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  // ─── Pomodoro timer ───

  useEffect(() => {
    if (data.pomodoroRunning) {
      pomodoroRef.current = setInterval(() => {
        setData(prev => {
          if (prev.pomodoroTimeLeft <= 1) {
            const nextMode = prev.pomodoroMode === 'work' ? 'break' : 'work';
            const nextSessions = prev.pomodoroMode === 'work' ? prev.pomodoroSessions + 1 : prev.pomodoroSessions;
            const nextTime = nextMode === 'work' ? 25 * 60 : (nextSessions % 4 === 0 ? 15 * 60 : 5 * 60);
            try { new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQ==').play(); } catch {}
            return { ...prev, pomodoroTimeLeft: nextTime, pomodoroRunning: false, pomodoroMode: nextMode, pomodoroSessions: nextSessions };
          }
          return { ...prev, pomodoroTimeLeft: prev.pomodoroTimeLeft - 1 };
        });
      }, 1000);
    }
    return () => { if (pomodoroRef.current) clearInterval(pomodoroRef.current); };
  }, [data.pomodoroRunning]);

  // ─── Meditation timer ───

  useEffect(() => {
    if (data.meditationRunning) {
      meditationRef.current = setInterval(() => {
        setData(prev => {
          if (prev.meditationTimeLeft <= 1) {
            try { new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQ==').play(); } catch {}
            return { ...prev, meditationTimeLeft: 0, meditationRunning: false, meditationTotal: prev.meditationTotal + prev.meditationPreset };
          }
          return { ...prev, meditationTimeLeft: prev.meditationTimeLeft - 1 };
        });
      }, 1000);
    }
    return () => { if (meditationRef.current) clearInterval(meditationRef.current); };
  }, [data.meditationRunning]);

  // ─── Focus timer ───

  useEffect(() => {
    if (data.focusRunning) {
      focusRef.current = setInterval(() => {
        setData(prev => ({ ...prev, focusMinutes: prev.focusMinutes + 1/60 }));
      }, 1000);
    }
    return () => { if (focusRef.current) clearInterval(focusRef.current); };
  }, [data.focusRunning]);

  // ─── API fetches ───

  useEffect(() => {
    const token = session.token;
    if (!token) return;
    fetch(`${API_BASE}/portal/wallet`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null).then(d => { if (d?.balance != null) setWalletBalance(d.balance); }).catch(() => {});
    fetch(`${API_BASE}/portal/projects`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null).then(d => { if (Array.isArray(d)) setProjectCount(d.length); else if (d?.projects) setProjectCount(d.projects.length); }).catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Visibility helpers ───

  const isVisible = (id: string) => visibility[id] ?? WIDGETS.find(w => w.id === id)?.defaultVisible ?? false;
  const toggleVisibility = (id: string) => {
    setVisibility(prev => ({ ...prev, [id]: !(prev[id] ?? WIDGETS.find(w => w.id === id)?.defaultVisible ?? false) }));
  };
  const toggleCollapse = (id: string) => {
    setCollapsed(prev => {
      const next = { ...prev, [id]: !prev[id] };
      try { localStorage.setItem('fz_journee_collapsed', JSON.stringify(next)); } catch {}
      return next;
    });
  };

  // ─── Pomodoro format ───
  const fmtTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  // ─── Widget Card Wrapper ───

  function W({ id, children }: { id: string; children: React.ReactNode }) {
    const meta = WIDGETS.find(w => w.id === id);
    if (!meta || !isVisible(id)) return null;
    const isCol = collapsed[id] ?? false;
    return (
      <div style={cardStyle}>
        <button onClick={() => toggleCollapse(id)} style={cardHeaderStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 16 }}>{meta.emoji}</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: CU.text }}>{meta.label}</span>
          </div>
          <span style={{ fontSize: 14, color: CU.textMuted, transform: isCol ? 'rotate(-90deg)' : 'rotate(0)', transition: 'transform 0.2s', display: 'inline-block' }}>{isCol ? '\u25B8' : '\u25BE'}</span>
        </button>
        {!isCol && <div style={cardBodyStyle}>{children}</div>}
      </div>
    );
  }

  // ═══════════════════════════════════════
  //  WIDGET RENDERERS
  // ═══════════════════════════════════════

  // ── W01: Todos ──
  function renderTodos() {
    const doneCount = data.todos.filter(t => t.done).length;
    const total = data.todos.length;
    return (
      <W id="todos">
        <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
          <input style={inputStyle} placeholder="Nouvelle t\u00e2che..." value={newTodoText} onChange={e => setNewTodoText(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && newTodoText.trim()) { updateData({ todos: [...data.todos, { id: uid(), text: newTodoText.trim(), done: false }] }); setNewTodoText(''); } }} />
          <button style={btnSmStyle} onClick={() => { if (newTodoText.trim()) { updateData({ todos: [...data.todos, { id: uid(), text: newTodoText.trim(), done: false }] }); setNewTodoText(''); } }}>+</button>
        </div>
        {total > 0 && <>
          <div style={progressBarOuter}><div style={{ height: '100%', borderRadius: 3, background: CU.accent, width: `${total ? (doneCount/total)*100 : 0}%`, transition: 'width 0.3s' }} /></div>
          <div style={{ fontSize: 11, color: CU.textMuted, marginTop: 4, marginBottom: 8 }}>{doneCount}/{total} termin\u00e9es</div>
        </>}
        {data.todos.map(t => (
          <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0', borderBottom: `1px solid ${CU.border}` }}>
            <input type="checkbox" checked={t.done} onChange={() => updateData({ todos: data.todos.map(x => x.id === t.id ? { ...x, done: !x.done } : x) })}
              style={{ width: 18, height: 18, accentColor: CU.accent, cursor: 'pointer' }} />
            <span style={{ flex: 1, fontSize: 13, color: CU.text, textDecoration: t.done ? 'line-through' : 'none', opacity: t.done ? 0.5 : 1 }}>{t.text}</span>
            <button onClick={() => updateData({ todos: data.todos.filter(x => x.id !== t.id) })} style={{ background: 'none', border: 'none', cursor: 'pointer', color: CU.textMuted, fontSize: 14 }}>{'\u2715'}</button>
          </div>
        ))}
        {total > 0 && <button onClick={() => updateData({ todos: [] })} style={{ ...btnGhostStyle, marginTop: 8, fontSize: 11 }}>Tout effacer</button>}
      </W>
    );
  }

  // ── W02: Objectifs ──
  function renderObjectifs() {
    const doneCount = data.objectifs.filter(o => o.done).length;
    const colors = [CU.text, CU.textMuted, CU.textSecondary];
    return (
      <W id="objectifs">
        <div style={{ fontSize: 12, color: CU.textMuted, marginBottom: 8 }}>{doneCount}/3 objectifs atteints</div>
        {data.objectifs.map((o, i) => (
          <div key={o.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: o.done ? colors[i] : CU.accentLight, color: o.done ? '#fff' : CU.textMuted, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
            <input style={{ ...inputStyle, flex: 1, textDecoration: o.done ? 'line-through' : 'none' }} placeholder={`Objectif ${i + 1}...`} value={o.text}
              onChange={e => { const next = [...data.objectifs]; next[i] = { ...next[i], text: e.target.value }; updateData({ objectifs: next }); }} />
            <input type="checkbox" checked={o.done} onChange={() => { const next = [...data.objectifs]; next[i] = { ...next[i], done: !next[i].done }; updateData({ objectifs: next }); }}
              style={{ width: 20, height: 20, accentColor: CU.accent, cursor: 'pointer' }} />
          </div>
        ))}
      </W>
    );
  }

  // ── W03: Priorites ──
  function renderPriorites() {
    const medals = ['\u{1F947}', '\u{1F948}', '\u{1F949}'];
    const swap = (i: number, j: number) => {
      if (j < 0 || j > 2) return;
      const next = [...data.priorites];
      [next[i], next[j]] = [next[j], next[i]];
      next.forEach((p, idx) => { p.rank = idx + 1; });
      updateData({ priorites: next });
    };
    return (
      <W id="priorites">
        {data.priorites.map((p, i) => (
          <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <span style={{ fontSize: 18 }}>{medals[i]}</span>
            <input style={{ ...inputStyle, flex: 1 }} placeholder={`Priorit\u00e9 ${i + 1}...`} value={p.text}
              onChange={e => { const next = [...data.priorites]; next[i] = { ...next[i], text: e.target.value }; updateData({ priorites: next }); }} />
            <button onClick={() => swap(i, i - 1)} disabled={i === 0} style={{ ...btnGhostStyle, padding: '4px 6px', opacity: i === 0 ? 0.3 : 1 }}>{'\u2191'}</button>
            <button onClick={() => swap(i, i + 1)} disabled={i === 2} style={{ ...btnGhostStyle, padding: '4px 6px', opacity: i === 2 ? 0.3 : 1 }}>{'\u2193'}</button>
          </div>
        ))}
      </W>
    );
  }

  // ── W04: Notes ──
  function renderNotes() {
    return (
      <W id="notes">
        <textarea style={{ ...inputStyle, minHeight: 100, resize: 'vertical' as const }} placeholder="Vos notes rapides..." value={data.notes}
          onChange={e => updateData({ notes: e.target.value.slice(0, 5000) })} />
        <div style={{ fontSize: 11, color: CU.textMuted, marginTop: 4, textAlign: 'right' as const }}>{data.notes.length}/5000</div>
      </W>
    );
  }

  // ── W05: Pomodoro ──
  function renderPomodoro() {
    const isWork = data.pomodoroMode === 'work';
    const accentCol = isWork ? CU.text : CU.textSecondary;
    return (
      <W id="pomodoro">
        <div style={{ textAlign: 'center' as const }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: accentCol, marginBottom: 4, textTransform: 'uppercase' as const, letterSpacing: 1 }}>
            {isWork ? 'Travail' : 'Pause'}
          </div>
          <div style={{ fontSize: 48, fontWeight: 200, color: CU.text, letterSpacing: -2, fontFamily: 'monospace' }}>
            {fmtTime(data.pomodoroTimeLeft)}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 12 }}>
            <button style={{ ...btnSmStyle, background: accentCol, minWidth: 80 }} onClick={() => updateData({ pomodoroRunning: !data.pomodoroRunning })}>
              {data.pomodoroRunning ? <>{'\u23F8\uFE0F'} Pause</> : <>{'\u25B6\uFE0F'} Start</>}
            </button>
            <button style={btnGhostStyle} onClick={() => updateData({ pomodoroTimeLeft: isWork ? 25*60 : 5*60, pomodoroRunning: false })}>Reset</button>
            <button style={btnGhostStyle} onClick={() => {
              const nextMode = isWork ? 'break' : 'work';
              updateData({ pomodoroMode: nextMode, pomodoroTimeLeft: nextMode === 'work' ? 25*60 : 5*60, pomodoroRunning: false });
            }}>Skip {'\u23ED\uFE0F'}</button>
          </div>
          <div style={{ fontSize: 12, color: CU.textMuted, marginTop: 10 }}>Sessions : {data.pomodoroSessions}/4</div>
        </div>
      </W>
    );
  }

  // ── W06: Focus ──
  function renderFocus() {
    const goal = 120;
    const mins = Math.floor(data.focusMinutes);
    const pct = Math.min(100, (mins / goal) * 100);
    return (
      <W id="focus">
        <div style={{ textAlign: 'center' as const }}>
          <div style={{ fontSize: 36, fontWeight: 200, color: CU.text, fontFamily: 'monospace' }}>{mins} min</div>
          <div style={{ fontSize: 12, color: CU.textMuted, marginBottom: 8 }}>Objectif : {goal} min</div>
          <div style={progressBarOuter}><div style={{ height: '100%', borderRadius: 3, background: CU.accent, width: `${pct}%`, transition: 'width 0.5s' }} /></div>
          <button style={{ ...btnSmStyle, marginTop: 12 }}
            onClick={() => updateData({ focusRunning: !data.focusRunning, focusStartedAt: data.focusRunning ? 0 : Date.now() })}>
            {data.focusRunning ? <><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#fff', marginRight: 6, animation: 'pulse 1s infinite' }} />Stop</> : <>{'\u25B6\uFE0F'} D\u00e9marrer focus</>}
          </button>
        </div>
      </W>
    );
  }

  // ── W07: Schedule ──
  function renderSchedule() {
    const hours = Array.from({ length: 17 }, (_, i) => i + 6);
    const currentHour = currentTime.getHours();
    return (
      <W id="schedule">
        <div style={{ maxHeight: 300, overflowY: 'auto' as const }}>
          {hours.map(h => (
            <div key={h} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0', borderLeft: h === currentHour ? `3px solid ${CU.accent}` : '3px solid transparent', paddingLeft: 8 }}>
              <span style={{ fontSize: 12, color: h === currentHour ? CU.accent : CU.textMuted, fontWeight: h === currentHour ? 700 : 400, width: 40, flexShrink: 0 }}>{String(h).padStart(2, '0')}:00</span>
              <input style={{ ...inputStyle, padding: '4px 8px', fontSize: 12 }} placeholder="\u2014" value={data.schedule[h] || ''}
                onChange={e => updateData({ schedule: { ...data.schedule, [h]: e.target.value } })} />
            </div>
          ))}
        </div>
      </W>
    );
  }

  // ── W08: Calendrier ──
  function renderCalendrier() {
    const d = new Date();
    const dayNames = ['L','M','M','J','V','S','D'];
    return (
      <W id="calendrier">
        <div style={{ textAlign: 'center' as const }}>
          <div style={{ fontSize: 42, fontWeight: 200, color: CU.accent }}>{d.getDate()}</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: CU.text, textTransform: 'capitalize' as const }}>{formatFrenchDate(d)}</div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, margin: '12px 0' }}>
            {dayNames.map((name, i) => {
              const isToday = (d.getDay() + 6) % 7 === i;
              return <div key={i} style={{ width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: isToday ? 700 : 400, background: isToday ? CU.accent : 'transparent', color: isToday ? '#fff' : CU.textMuted }}>{name}</div>;
            })}
          </div>
          <div style={{ fontSize: 11, color: CU.textMuted }}>Jour {dayOfYear()}/365 \u2014 Semaine {weekNumber()}</div>
        </div>
      </W>
    );
  }

  // ── W09: Reunions ──
  function renderReunions() {
    return (
      <W id="reunions">
        <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' as const }}>
          <input style={{ ...inputStyle, flex: 1, minWidth: 120 }} placeholder="Titre..." value={newReunionTitle} onChange={e => setNewReunionTitle(e.target.value)} />
          <input type="time" style={{ ...inputStyle, width: 100 }} value={newReunionTime} onChange={e => setNewReunionTime(e.target.value)} />
          <button style={btnSmStyle} onClick={() => { if (newReunionTitle.trim()) { updateData({ reunions: [...data.reunions, { id: uid(), title: newReunionTitle.trim(), time: newReunionTime || '09:00', duration: '30 min', participants: '' }] }); setNewReunionTitle(''); setNewReunionTime(''); } }}>+</button>
        </div>
        {data.reunions.length === 0 && <div style={{ fontSize: 12, color: CU.textMuted, textAlign: 'center' as const, padding: 16 }}>Aucune r\u00e9union aujourd'hui</div>}
        {data.reunions.sort((a, b) => a.time.localeCompare(b.time)).map(r => (
          <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: `1px solid ${CU.border}` }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: CU.accent, width: 45, flexShrink: 0 }}>{r.time}</span>
            <span style={{ flex: 1, fontSize: 13, color: CU.text }}>{r.title}</span>
            <button onClick={() => updateData({ reunions: data.reunions.filter(x => x.id !== r.id) })} style={{ background: 'none', border: 'none', cursor: 'pointer', color: CU.textMuted, fontSize: 13 }}>{'\u2715'}</button>
          </div>
        ))}
      </W>
    );
  }

  // ── W10: Rappels ──
  function renderRappels() {
    const pending = data.rappels.filter(r => !r.done).length;
    return (
      <W id="rappels">
        <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
          <input style={{ ...inputStyle, flex: 1 }} placeholder="Rappel..." value={newRappelText} onChange={e => setNewRappelText(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && newRappelText.trim()) { updateData({ rappels: [...data.rappels, { id: uid(), text: newRappelText.trim(), time: newRappelTime, done: false }] }); setNewRappelText(''); setNewRappelTime(''); } }} />
          <input type="time" style={{ ...inputStyle, width: 90 }} value={newRappelTime} onChange={e => setNewRappelTime(e.target.value)} />
          <button style={btnSmStyle} onClick={() => { if (newRappelText.trim()) { updateData({ rappels: [...data.rappels, { id: uid(), text: newRappelText.trim(), time: newRappelTime, done: false }] }); setNewRappelText(''); setNewRappelTime(''); } }}>+</button>
        </div>
        {pending > 0 && <div style={{ fontSize: 11, color: CU.textMuted, marginBottom: 6 }}>{pending} rappel{pending > 1 ? 's' : ''} en attente</div>}
        {[...data.rappels].sort((a, b) => Number(a.done) - Number(b.done)).map(r => (
          <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0', borderBottom: `1px solid ${CU.border}` }}>
            <input type="checkbox" checked={r.done} onChange={() => updateData({ rappels: data.rappels.map(x => x.id === r.id ? { ...x, done: !x.done } : x) })}
              style={{ width: 18, height: 18, accentColor: CU.accent, cursor: 'pointer' }} />
            {r.time && <span style={{ fontSize: 11, color: CU.accent, fontWeight: 600 }}>{r.time}</span>}
            <span style={{ flex: 1, fontSize: 13, color: CU.text, textDecoration: r.done ? 'line-through' : 'none', opacity: r.done ? 0.5 : 1 }}>{r.text}</span>
            <button onClick={() => updateData({ rappels: data.rappels.filter(x => x.id !== r.id) })} style={{ background: 'none', border: 'none', cursor: 'pointer', color: CU.textMuted, fontSize: 13 }}>{'\u2715'}</button>
          </div>
        ))}
      </W>
    );
  }

  // ── W11: Echeances ──
  function renderEcheances() {
    const prioColor = { haute: CU.text, moyenne: CU.textSecondary, basse: CU.textMuted };
    const today = new Date().toISOString().slice(0, 10);
    return (
      <W id="echeances">
        <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' as const }}>
          <input style={{ ...inputStyle, flex: 1, minWidth: 120 }} placeholder="\u00c9ch\u00e9ance..." value={newEcheanceText} onChange={e => setNewEcheanceText(e.target.value)} />
          <input type="date" style={{ ...inputStyle, width: 130 }} value={newEcheanceDate} onChange={e => setNewEcheanceDate(e.target.value)} />
          <select style={{ ...CU.select, width: 100 }} value={newEcheancePrio} onChange={e => setNewEcheancePrio(e.target.value as 'haute'|'moyenne'|'basse')}>
            <option value="haute">Haute</option><option value="moyenne">Moyenne</option><option value="basse">Basse</option>
          </select>
          <button style={btnSmStyle} onClick={() => { if (newEcheanceText.trim() && newEcheanceDate) { updateData({ echeances: [...data.echeances, { id: uid(), text: newEcheanceText.trim(), date: newEcheanceDate, priority: newEcheancePrio }] }); setNewEcheanceText(''); setNewEcheanceDate(''); } }}>+</button>
        </div>
        {[...data.echeances].sort((a, b) => a.date.localeCompare(b.date)).map(e => {
          const overdue = e.date < today;
          return (
            <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0', borderBottom: `1px solid ${CU.border}`, background: overdue ? 'rgba(0,0,0,0.03)' : 'transparent' }}>
              <span style={{ fontSize: 11, color: overdue ? CU.danger : CU.textMuted, fontWeight: 600, width: 75, flexShrink: 0 }}>{e.date}</span>
              <span style={{ padding: '2px 8px', borderRadius: 10, fontSize: 10, fontWeight: 600, color: '#fff', background: prioColor[e.priority], flexShrink: 0 }}>{e.priority}</span>
              <span style={{ flex: 1, fontSize: 13, color: CU.text }}>{e.text}</span>
              <button onClick={() => updateData({ echeances: data.echeances.filter(x => x.id !== e.id) })} style={{ background: 'none', border: 'none', cursor: 'pointer', color: CU.textMuted, fontSize: 13 }}>{'\u2715'}</button>
            </div>
          );
        })}
      </W>
    );
  }

  // ── W12: Planning semaine ──
  function renderSemaine() {
    const dayNames = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];
    const todayIdx = (new Date().getDay() + 6) % 7;
    return (
      <W id="semaine">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
          {dayNames.map((name, i) => (
            <div key={i} style={{ textAlign: 'center' as const, padding: '8px 2px', borderRadius: 8, background: i === todayIdx ? CU.accent : CU.accentLight, color: i === todayIdx ? '#fff' : CU.text }}>
              <div style={{ fontSize: 11, fontWeight: 600 }}>{name}</div>
              <div style={{ fontSize: 18, marginTop: 2 }}>{i === todayIdx ? '\u{1F4CD}' : '\u00B7'}</div>
            </div>
          ))}
        </div>
      </W>
    );
  }

  // ── W13: Humeur ──
  function renderHumeur() {
    return (
      <W id="humeur">
        <div style={{ display: 'flex', justifyContent: 'center', gap: 10 }}>
          {MOOD_OPTIONS.map((m, i) => (
            <button key={i} onClick={() => updateData({ mood: i })} style={{
              fontSize: data.mood === i ? 36 : 28, padding: 4, border: data.mood === i ? `2px solid ${m.color}` : '2px solid transparent',
              borderRadius: 8, background: data.mood === i ? `${m.color}15` : 'transparent', cursor: 'pointer', transition: 'all 0.2s',
            }}><span style={{ fontSize: data.mood === i ? 36 : 28 }}>{m.emoji}</span></button>
          ))}
        </div>
        {data.mood >= 0 && <div style={{ textAlign: 'center' as const, marginTop: 8, fontSize: 13, color: MOOD_OPTIONS[data.mood].color, fontWeight: 600 }}>
          Aujourd'hui je me sens : {MOOD_OPTIONS[data.mood].label}
        </div>}
      </W>
    );
  }

  // ── W14: Hydratation ──
  function renderHydratation() {
    const glasses = 8;
    return (
      <W id="hydratation">
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, flexWrap: 'wrap' as const }}>
          {Array.from({ length: glasses }, (_, i) => (
            <button key={i} onClick={() => updateData({ waterCount: data.waterCount === i + 1 ? i : i + 1 })} style={{
              fontSize: 24, padding: 4, border: 'none', background: 'transparent', cursor: 'pointer',
              opacity: i < data.waterCount ? 1 : 0.25, transition: 'opacity 0.2s',
            }}><span style={{ fontSize: 24 }}>{'\u{1F4A7}'}</span></button>
          ))}
        </div>
        <div style={progressBarOuter}><div style={{ height: '100%', borderRadius: 3, background: CU.accent, width: `${Math.min(100, (data.waterCount / glasses) * 100)}%`, transition: 'width 0.3s' }} /></div>
        <div style={{ textAlign: 'center' as const, fontSize: 12, color: CU.textMuted, marginTop: 4 }}>{data.waterCount}/{glasses} verres ({(data.waterCount * 0.25).toFixed(1)}L)</div>
      </W>
    );
  }

  // ── W15: Activite physique ──
  function renderActivite() {
    return (
      <W id="activite">
        <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
          <input style={inputStyle} placeholder="Ex: 30 min course..." value={newExerciseText} onChange={e => setNewExerciseText(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && newExerciseText.trim()) { updateData({ exercises: [...data.exercises, { id: uid(), text: newExerciseText.trim() }] }); setNewExerciseText(''); } }} />
          <button style={btnSmStyle} onClick={() => { if (newExerciseText.trim()) { updateData({ exercises: [...data.exercises, { id: uid(), text: newExerciseText.trim() }] }); setNewExerciseText(''); } }}>+</button>
        </div>
        {data.exercises.map(ex => (
          <div key={ex.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0' }}>
            <span style={{ fontSize: 14 }}>{'\u{1F3C3}'}</span>
            <span style={{ flex: 1, fontSize: 13, color: CU.text }}>{ex.text}</span>
            <button onClick={() => updateData({ exercises: data.exercises.filter(x => x.id !== ex.id) })} style={{ background: 'none', border: 'none', cursor: 'pointer', color: CU.textMuted, fontSize: 13 }}>{'\u2715'}</button>
          </div>
        ))}
        {data.exercises.length === 0 && <div style={{ fontSize: 12, color: CU.textMuted, textAlign: 'center' as const }}>Aucune activit\u00e9 enregistr\u00e9e</div>}
      </W>
    );
  }

  // ── W16: Meditation ──
  function renderMeditation() {
    const presets = [1, 5, 10, 15, 20];
    return (
      <W id="meditation">
        <div style={{ textAlign: 'center' as const }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 12 }}>
            {presets.map(p => (
              <button key={p} onClick={() => updateData({ meditationPreset: p, meditationTimeLeft: p * 60, meditationRunning: false })}
                style={{ ...btnGhostStyle, background: data.meditationPreset === p ? CU.accent : CU.accentLight, color: data.meditationPreset === p ? '#fff' : CU.text }}>{p} min</button>
            ))}
          </div>
          <div style={{ fontSize: 42, fontWeight: 200, color: CU.text, fontFamily: 'monospace' }}>{fmtTime(data.meditationTimeLeft)}</div>
          {data.meditationRunning && <div style={{ fontSize: 14, color: CU.text, marginTop: 6 }}>Respirez...</div>}
          <button style={{ ...btnSmStyle, marginTop: 12, minWidth: 100 }}
            onClick={() => updateData({ meditationRunning: !data.meditationRunning })}>
            {data.meditationRunning ? <>{'\u23F8\uFE0F'} Stop</> : <>{'\u{1F9D8}'} M\u00e9diter</>}
          </button>
          {data.meditationTotal > 0 && <div style={{ fontSize: 11, color: CU.textMuted, marginTop: 8 }}>Total aujourd'hui : {data.meditationTotal} min</div>}
        </div>
      </W>
    );
  }

  // ── W17: Sommeil ──
  function renderSommeil() {
    const h = data.sleepHours;
    const col = h < 6 ? CU.danger : h < 7 ? CU.warning : h <= 9 ? CU.success : CU.textSecondary;
    const sleepIcon = h < 5 ? '\u{1F634}' : h < 7 ? '\u{1F319}' : h <= 9 ? '\u{1F60A}' : '\u{1F4A4}';
    return (
      <W id="sommeil">
        <div style={{ textAlign: 'center' as const }}>
          <div style={{ fontSize: 36 }}>{sleepIcon}</div>
          <div style={{ fontSize: 24, fontWeight: 600, color: col, margin: '6px 0' }}>{h}h</div>
          <input type="range" min={0} max={12} step={0.5} value={h} onChange={e => updateData({ sleepHours: parseFloat(e.target.value) })}
            style={{ width: '100%', accentColor: col }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: CU.textMuted }}><span>0h</span><span>6h</span><span>8h</span><span>12h</span></div>
        </div>
      </W>
    );
  }

  // ── W18: Gratitude ──
  function renderGratitude() {
    const filled = data.gratitude.filter(g => g.trim()).length;
    return (
      <W id="gratitude">
        <div style={{ fontSize: 12, color: CU.textMuted, marginBottom: 8 }}>{filled}/3 gratitudes</div>
        {data.gratitude.map((g, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 14 }}>{'\u2764\uFE0F'}</span>
            <input style={inputStyle} placeholder="Aujourd'hui, je suis reconnaissant pour..." value={g}
              onChange={e => { const next = [...data.gratitude]; next[i] = e.target.value; updateData({ gratitude: next }); }} />
          </div>
        ))}
      </W>
    );
  }

  // ── W19: Affirmation ──
  function renderAffirmation() {
    const idx = data.affirmationIndex >= 0 ? data.affirmationIndex % AFFIRMATIONS.length : dayOfYear() % AFFIRMATIONS.length;
    const text = data.affirmation || AFFIRMATIONS[idx];
    return (
      <W id="affirmation">
        <div style={{ background: CU.bgSecondary, borderRadius: 8, padding: 16, textAlign: 'center' as const }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>{'\u2728'}</div>
          <div style={{ fontSize: 15, fontStyle: 'italic', color: CU.text, lineHeight: 1.5 }}>{text}</div>
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
          <button style={btnGhostStyle} onClick={() => updateData({ affirmationIndex: (data.affirmationIndex + 1) % AFFIRMATIONS.length, affirmation: '' })}>Nouvelle affirmation</button>
          <input style={{ ...inputStyle, flex: 1, fontSize: 12 }} placeholder="Ou \u00e9crivez la v\u00f4tre..." value={data.affirmation}
            onChange={e => updateData({ affirmation: e.target.value })} />
        </div>
      </W>
    );
  }

  // ── W20: Meteo ──
  function renderMeteo() {
    const h = currentTime.getHours();
    const weatherIcon = h >= 6 && h < 20 ? '\u{1F324}\uFE0F' : '\u{1F319}';
    return (
      <W id="meteo">
        <div style={{ textAlign: 'center' as const }}>
          <div style={{ fontSize: 48 }}>{weatherIcon}</div>
          <input style={{ ...inputStyle, textAlign: 'center' as const, maxWidth: 200, margin: '8px auto' }} placeholder="Votre ville..." value={data.weatherCity}
            onChange={e => updateData({ weatherCity: e.target.value })} />
          <div style={{ fontSize: 13, color: CU.textMuted, marginTop: 4 }}>Donn\u00e9es m\u00e9t\u00e9o simul\u00e9es pour {data.weatherCity || '...'}</div>
          <div style={{ fontSize: 28, fontWeight: 300, color: CU.text, marginTop: 4 }}>22\u00b0C</div>
          <div style={{ fontSize: 12, color: CU.textSecondary }}>Partiellement nuageux</div>
        </div>
      </W>
    );
  }

  // ── W21: Citation ──
  function renderCitation() {
    const idx = data.quoteIndex >= 0 ? data.quoteIndex % FRENCH_QUOTES.length : dayOfYear() % FRENCH_QUOTES.length;
    const q = FRENCH_QUOTES[idx];
    return (
      <W id="citation">
        <div style={{ borderLeft: `3px solid ${CU.accent}`, paddingLeft: 14 }}>
          <div style={{ fontSize: 14, fontStyle: 'italic', color: CU.text, lineHeight: 1.6 }}>&laquo; {q.text} &raquo;</div>
          <div style={{ fontSize: 12, fontWeight: 600, color: CU.accent, marginTop: 8 }}>\u2014 {q.author}</div>
        </div>
        <button style={{ ...btnGhostStyle, marginTop: 10, fontSize: 11 }} onClick={() => updateData({ quoteIndex: (data.quoteIndex + 1) % FRENCH_QUOTES.length })}>Autre citation</button>
      </W>
    );
  }

  // ── W22: Horoscope ──
  function renderHoroscope() {
    const sign = ZODIAC_SIGNS.find(z => z.id === data.horoscopeSign);
    const signIdx = ZODIAC_SIGNS.findIndex(z => z.id === data.horoscopeSign);
    return (
      <W id="horoscope">
        <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 6, justifyContent: 'center', marginBottom: 10 }}>
          {ZODIAC_SIGNS.map(z => (
            <button key={z.id} onClick={() => updateData({ horoscopeSign: z.id })} style={{
              padding: '4px 8px', borderRadius: 8, fontSize: 12, border: data.horoscopeSign === z.id ? `2px solid ${CU.accent}` : `1px solid ${CU.border}`,
              background: data.horoscopeSign === z.id ? CU.accentLight : CU.bgSecondary, cursor: 'pointer', color: CU.text,
            }}>{z.emoji} {z.label}</button>
          ))}
        </div>
        {sign && <div style={{ background: CU.bgSecondary, borderRadius: 8, padding: 12, textAlign: 'center' as const }}>
          <div style={{ fontSize: 28 }}>{sign.emoji}</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: CU.text }}>{sign.label}</div>
          <div style={{ fontSize: 11, color: CU.textMuted }}>{sign.dates}</div>
          <div style={{ fontSize: 12, color: CU.textMuted, marginTop: 8, lineHeight: 1.5 }}>{ZODIAC_MESSAGES[signIdx >= 0 ? signIdx : 0]}</div>
        </div>}
      </W>
    );
  }

  // ── W23: Actualites ──
  function renderActualites() {
    const tab = NEWS_TABS.find(t => t.id === data.newsTab) || NEWS_TABS[0];
    return (
      <W id="actualites">
        <div style={{ display: 'flex', gap: 4, marginBottom: 10 }}>
          {NEWS_TABS.map(t => (
            <button key={t.id} onClick={() => updateData({ newsTab: t.id })} style={{
              ...btnGhostStyle, background: data.newsTab === t.id ? CU.accent : CU.accentLight, color: data.newsTab === t.id ? '#fff' : CU.text, fontSize: 11, flex: 1,
            }}>{t.label}</button>
          ))}
        </div>
        {tab.items.map((item, i) => (
          <div key={i} style={{ padding: '6px 0', borderBottom: `1px solid ${CU.border}`, fontSize: 13, color: CU.text }}>
            {'\u{1F4F0}'} {item}
          </div>
        ))}
        <div style={{ fontSize: 10, color: CU.textMuted, marginTop: 6, fontStyle: 'italic' }}>Actualit\u00e9s simul\u00e9es</div>
      </W>
    );
  }

  // ── W24: Anniversaires ──
  function renderAnniversaires() {
    const todayMD = todayKey();
    const todayBdays = data.birthdays.filter(b => b.date.slice(5) === todayMD);
    return (
      <W id="anniversaires">
        <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
          <input style={{ ...inputStyle, flex: 1 }} placeholder="Nom..." value={newBdayName} onChange={e => setNewBdayName(e.target.value)} />
          <input type="date" style={{ ...inputStyle, width: 130 }} value={newBdayDate} onChange={e => setNewBdayDate(e.target.value)} />
          <button style={btnSmStyle} onClick={() => { if (newBdayName.trim() && newBdayDate) { updateData({ birthdays: [...data.birthdays, { id: uid(), name: newBdayName.trim(), date: newBdayDate }] }); setNewBdayName(''); setNewBdayDate(''); } }}>+</button>
        </div>
        {todayBdays.length > 0 && <div style={{ background: CU.accentLight, borderRadius: 8, padding: 10, marginBottom: 8 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: CU.text }}>{'\u{1F382}'} Aujourd'hui !</div>
          {todayBdays.map(b => <div key={b.id} style={{ fontSize: 13, color: CU.text }}>{b.name}</div>)}
        </div>}
        {data.birthdays.map(b => (
          <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0', fontSize: 13 }}>
            <span style={{ color: CU.text }}>{b.name}</span>
            <span style={{ fontSize: 11, color: CU.textMuted }}>{b.date}</span>
            <button onClick={() => updateData({ birthdays: data.birthdays.filter(x => x.id !== b.id) })} style={{ background: 'none', border: 'none', cursor: 'pointer', color: CU.textMuted, fontSize: 13, marginLeft: 'auto' }}>{'\u2715'}</button>
          </div>
        ))}
      </W>
    );
  }

  // ── W25: Ephemeride ──
  function renderEphemeride() {
    const key = todayKey();
    const events = EPHEMERIDE[key] || ["Pas d'\u00e9v\u00e9nement notable enregistr\u00e9 pour cette date."];
    const saint = SAINTS[key] || 'Inconnu';
    return (
      <W id="ephemeride">
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: CU.accent, marginBottom: 4 }}>{'\u{1F4D6}'} Ce jour dans l'histoire</div>
          {events.map((ev, i) => <div key={i} style={{ fontSize: 13, color: CU.text, padding: '3px 0' }}>{'\u2022'} {ev}</div>)}
        </div>
        <div style={{ fontSize: 12, color: CU.textMuted, borderTop: `1px solid ${CU.border}`, paddingTop: 8 }}>
          Saint du jour : <strong style={{ color: CU.text }}>{saint}</strong>
        </div>
      </W>
    );
  }

  // ── W26: Credits ──
  function renderCredits() {
    const credits = walletBalance != null ? walletBalance / 1000000 : null;
    const col = credits == null ? CU.textMuted : credits > 50 ? CU.success : credits > 10 ? CU.warning : CU.danger;
    return (
      <W id="credits">
        <div style={{ textAlign: 'center' as const }}>
          <div style={{ fontSize: 32, fontWeight: 600, color: col }}>{credits != null ? `${credits.toFixed(1)}` : '...'}</div>
          <div style={{ fontSize: 12, color: CU.textMuted }}>cr\u00e9dits restants</div>
        </div>
      </W>
    );
  }

  // ── W27: Agents ──
  function renderAgents() {
    return (
      <W id="agents">
        <div style={{ textAlign: 'center' as const }}>
          <div style={{ fontSize: 28 }}>{'\u{1F916}'}</div>
          <div style={{ fontSize: 20, fontWeight: 600, color: CU.accent }}>28</div>
          <div style={{ fontSize: 12, color: CU.textMuted }}>agents disponibles</div>
        </div>
      </W>
    );
  }

  // ── W28: Messages non lus ──
  function renderMessagesNonLus() {
    return (
      <W id="messagesNonLus">
        <div style={{ textAlign: 'center' as const }}>
          <div style={{ fontSize: 28 }}>{notifCount > 0 ? '\u{1F514}' : '\u2705'}</div>
          <div style={{ fontSize: 20, fontWeight: 600, color: notifCount > 0 ? CU.text : CU.textSecondary }}>{notifCount}</div>
          <div style={{ fontSize: 12, color: CU.textMuted }}>{notifCount > 0 ? 'messages non lus' : 'Aucun message non lu'}</div>
        </div>
      </W>
    );
  }

  // ── W29: Projets ──
  function renderProjets() {
    return (
      <W id="projets">
        <div style={{ textAlign: 'center' as const }}>
          <div style={{ fontSize: 28 }}>{'\u{1F4C1}'}</div>
          <div style={{ fontSize: 20, fontWeight: 600, color: CU.accent }}>{projectCount}</div>
          <div style={{ fontSize: 12, color: CU.textMuted }}>projets actifs</div>
        </div>
      </W>
    );
  }

  // ── W30: KPIs ──
  function renderKpis() {
    return (
      <W id="kpis">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(200px, 100%), 1fr))', gap: 8 }}>
          {[
            { label: 'Messages', value: '0', emoji: '\u{1F4AC}' },
            { label: 'Documents', value: '0', emoji: '\u{1F4C4}' },
            { label: 'Connexion', value: `${Math.floor((Date.now() - (data.focusStartedAt || Date.now())) / 60000)} min`, emoji: '\u23F1\uFE0F' },
            { label: 'Cr\u00e9dits', value: walletBalance != null ? `${(walletBalance / 1000000).toFixed(1)}` : '...', emoji: '\u{1F4B3}' },
          ].map((kpi, i) => (
            <div key={i} style={{ background: CU.bgSecondary, borderRadius: 8, padding: 10, textAlign: 'center' as const }}>
              <div style={{ fontSize: 16 }}>{kpi.emoji}</div>
              <div style={{ fontSize: 16, fontWeight: 600, color: CU.text }}>{kpi.value}</div>
              <div style={{ fontSize: 10, color: CU.textMuted }}>{kpi.label}</div>
            </div>
          ))}
        </div>
      </W>
    );
  }

  // ── W31: Resume hier ──
  function renderResume() {
    return (
      <W id="resume">
        <textarea style={{ ...inputStyle, minHeight: 80, resize: 'vertical' as const, fontSize: 12 }} placeholder="R\u00e9sum\u00e9 de la journ\u00e9e d'hier..."
          value={data.yesterdaySummary} onChange={e => updateData({ yesterdaySummary: e.target.value })} />
      </W>
    );
  }

  // ── W32: Budget ──
  function renderBudget() {
    const pct = data.budgetLimit > 0 ? Math.min(100, (data.budgetSpent / data.budgetLimit) * 100) : 0;
    const col = pct < 50 ? CU.success : pct < 80 ? CU.warning : CU.danger;
    return (
      <W id="budget">
        <div style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
          <div style={{ fontSize: 12, color: CU.textMuted, flexShrink: 0 }}>Limite :</div>
          <input type="number" style={{ ...inputStyle, width: 80 }} value={data.budgetLimit} onChange={e => updateData({ budgetLimit: parseFloat(e.target.value) || 0 })} />
          <div style={{ fontSize: 12, color: CU.textMuted, flexShrink: 0 }}>D\u00e9pens\u00e9 :</div>
          <input type="number" style={{ ...inputStyle, width: 80 }} value={data.budgetSpent} onChange={e => updateData({ budgetSpent: parseFloat(e.target.value) || 0 })} />
        </div>
        <div style={progressBarOuter}><div style={{ height: '100%', borderRadius: 3, background: col, width: `${pct}%`, transition: 'width 0.3s' }} /></div>
        <div style={{ fontSize: 11, color: col, textAlign: 'center' as const, marginTop: 4, fontWeight: 600 }}>{pct.toFixed(0)}% du budget utilis\u00e9</div>
      </W>
    );
  }

  // ── W33: Repas ──
  function renderRepas() {
    const meals = [
      { key: 'mealPetitDej' as const, label: 'Petit-d\u00e9jeuner', emoji: '\u{1F950}' },
      { key: 'mealDejeuner' as const, label: 'D\u00e9jeuner', emoji: '\u{1F37D}\uFE0F' },
      { key: 'mealDiner' as const, label: 'D\u00eener', emoji: '\u{1F319}' },
      { key: 'mealSnack' as const, label: 'Snack', emoji: '\u{1F36A}' },
    ];
    return (
      <W id="repas">
        {meals.map(m => (
          <div key={m.key} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 16 }}>{m.emoji}</span>
            <div style={{ fontSize: 12, color: CU.textMuted, width: 90, flexShrink: 0 }}>{m.label}</div>
            <input style={{ ...inputStyle, flex: 1, fontSize: 12 }} placeholder="..." value={data[m.key]}
              onChange={e => updateData({ [m.key]: e.target.value } as Partial<JourneeData>)} />
          </div>
        ))}
      </W>
    );
  }

  // ── W34: Lecture ──
  function renderLecture() {
    return (
      <W id="lecture">
        <input style={{ ...inputStyle, marginBottom: 8 }} placeholder="Titre du livre ou article..." value={data.currentBook}
          onChange={e => updateData({ currentBook: e.target.value })} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, color: CU.textMuted }}>Progression</span>
          <input type="range" min={0} max={100} value={data.bookProgress} onChange={e => updateData({ bookProgress: parseInt(e.target.value) })}
            style={{ flex: 1, accentColor: CU.accent }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: CU.accent }}>{data.bookProgress}%</span>
        </div>
        <div style={{ ...progressBarOuter, marginTop: 6 }}><div style={{ height: '100%', borderRadius: 3, background: CU.accent, width: `${data.bookProgress}%`, transition: 'width 0.3s' }} /></div>
      </W>
    );
  }

  // ── W35: Habitudes ──
  function renderHabitudes() {
    return (
      <W id="habitudes">
        {data.habits.map(h => (
          <div key={h.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0', borderBottom: `1px solid ${CU.border}` }}>
            <span style={{ fontSize: 14 }}>{h.emoji}</span>
            <span style={{ flex: 1, fontSize: 13, color: CU.text }}>{h.label}</span>
            {h.streak > 0 && <span style={{ fontSize: 11, color: CU.textSecondary, fontWeight: 600 }}>{'\u{1F525}'}{h.streak}j</span>}
            <button onClick={() => {
              const next = data.habits.map(x => x.id === h.id ? { ...x, doneToday: !x.doneToday, streak: !x.doneToday ? x.streak + 1 : Math.max(0, x.streak - 1) } : x);
              updateData({ habits: next });
            }} style={{ ...CU.btnPrimary, height: 32, padding: '0 12px', fontSize: 12, background: h.doneToday ? CU.accent : CU.accentLight, color: h.doneToday ? '#fff' : CU.text }}>
              {h.doneToday ? '\u2705' : 'Fait'}
            </button>
            <button onClick={() => updateData({ habits: data.habits.filter(x => x.id !== h.id) })} style={{ background: 'none', border: 'none', cursor: 'pointer', color: CU.textMuted, fontSize: 12 }}>{'\u2715'}</button>
          </div>
        ))}
        <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
          <input style={{ ...inputStyle, flex: 1 }} placeholder="Nouvelle habitude..." value={newHabitLabel} onChange={e => setNewHabitLabel(e.target.value)} />
          <button style={btnSmStyle} onClick={() => { if (newHabitLabel.trim()) { updateData({ habits: [...data.habits, { id: uid(), label: newHabitLabel.trim(), emoji: 'star', streak: 0, doneToday: false }] }); setNewHabitLabel(''); } }}>+</button>
        </div>
      </W>
    );
  }

  // ── W36: Contacts favoris ──
  function renderContacts() {
    return (
      <W id="contactsFav">
        <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
          <input style={{ ...inputStyle, flex: 1 }} placeholder="Nom..." value={newContactName} onChange={e => setNewContactName(e.target.value)} />
          <input style={{ ...inputStyle, width: 120 }} placeholder="T\u00e9l\u00e9phone..." value={newContactPhone} onChange={e => setNewContactPhone(e.target.value)} />
          <button style={btnSmStyle} onClick={() => { if (newContactName.trim()) { updateData({ contacts: [...data.contacts, { id: uid(), name: newContactName.trim(), phone: newContactPhone, emoji: 'person' }] }); setNewContactName(''); setNewContactPhone(''); } }}>+</button>
        </div>
        {data.contacts.map(c => (
          <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0', borderBottom: `1px solid ${CU.border}` }}>
            <span style={{ fontSize: 14 }}>{c.emoji === 'person' ? '\u{1F464}' : c.emoji}</span>
            <span style={{ flex: 1, fontSize: 13, color: CU.text }}>{c.name}</span>
            <span style={{ fontSize: 12, color: CU.textMuted }}>{c.phone}</span>
            <button onClick={() => updateData({ contacts: data.contacts.filter(x => x.id !== c.id) })} style={{ background: 'none', border: 'none', cursor: 'pointer', color: CU.textMuted, fontSize: 13 }}>{'\u2715'}</button>
          </div>
        ))}
      </W>
    );
  }

  // ── W37: Playlist ──
  function renderPlaylist() {
    return (
      <W id="playlist">
        <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' as const }}>
          {Object.entries(PLAYLIST_PRESETS).map(([key, _]) => (
            <button key={key} onClick={() => updateData({ playlistPreset: key, playlistNote: PLAYLIST_PRESETS[key] })}
              style={{ ...btnGhostStyle, background: data.playlistPreset === key ? CU.accent : CU.accentLight, color: data.playlistPreset === key ? '#fff' : CU.text, fontSize: 11, textTransform: 'capitalize' as const }}>
              {key}
            </button>
          ))}
        </div>
        <textarea style={{ ...inputStyle, minHeight: 60, resize: 'vertical' as const, fontSize: 12 }} placeholder="Notes musicales du jour..."
          value={data.playlistNote} onChange={e => updateData({ playlistNote: e.target.value })} />
      </W>
    );
  }

  // ── W38: Journal intime ──
  function renderJournal() {
    const words = data.journal.trim() ? data.journal.trim().split(/\s+/).length : 0;
    return (
      <W id="journal">
        <textarea style={{ ...inputStyle, minHeight: 120, resize: 'vertical' as const }} placeholder="\u00c9crivez librement... Cet espace est priv\u00e9."
          value={data.journal} onChange={e => updateData({ journal: e.target.value.slice(0, 10000) })} />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: CU.textMuted, marginTop: 4 }}>
          <span>{words} mot{words > 1 ? 's' : ''}</span>
          <span>{data.journal.length}/10000</span>
        </div>
      </W>
    );
  }

  // ═══════════════════════════════════════
  //  CONFIG PANEL
  // ═══════════════════════════════════════

  function renderConfigPanel() {
    if (!showConfig) return null;
    const filtered = configFilter === 'all' ? WIDGETS : WIDGETS.filter(w => w.category === configFilter);
    return (
      <div style={{ ...CU.card, padding: 16, marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span style={CU.sectionTitle}>Configurer mes widgets</span>
          <button onClick={() => setShowConfig(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: CU.textMuted }}>{'\u2715'}</button>
        </div>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' as const, marginBottom: 12 }}>
          <button onClick={() => setConfigFilter('all')} style={{ ...btnGhostStyle, background: configFilter === 'all' ? CU.accent : CU.accentLight, color: configFilter === 'all' ? '#fff' : CU.text, fontSize: 11 }}>Tous</button>
          {CATEGORIES.map(c => (
            <button key={c.id} onClick={() => setConfigFilter(c.id)} style={{ ...btnGhostStyle, background: configFilter === c.id ? CU.accent : CU.accentLight, color: configFilter === c.id ? '#fff' : CU.text, fontSize: 11 }}>
              {c.emoji} {c.label}
            </button>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(200px, 100%), 1fr))', gap: 8, marginBottom: 12 }}>
          {filtered.map(w => (
            <button key={w.id} onClick={() => toggleVisibility(w.id)} style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 8,
              border: isVisible(w.id) ? `1px solid ${CU.accent}` : `1px solid ${CU.border}`,
              background: isVisible(w.id) ? CU.accentLight : CU.bgSecondary,
              cursor: 'pointer', textAlign: 'left' as const, fontFamily: 'inherit',
            }}>
              <span style={{ fontSize: 14 }}>{w.emoji}</span>
              <span style={{ fontSize: 12, color: CU.text, flex: 1 }}>{w.label}</span>
              <div style={{ width: 32, height: 18, borderRadius: 9, background: isVisible(w.id) ? CU.accent : CU.accentLight, position: 'relative' as const, transition: 'background 0.2s' }}>
                <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#fff', position: 'absolute' as const, top: 2, left: isVisible(w.id) ? 16 : 2, transition: 'left 0.2s' }} />
              </div>
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button style={btnSmStyle} onClick={() => { const next: Record<string, boolean> = {}; WIDGETS.forEach(w => { next[w.id] = true; }); setVisibility(next); }}>Tout activer</button>
          <button style={btnGhostStyle} onClick={() => { const next: Record<string, boolean> = {}; WIDGETS.forEach(w => { next[w.id] = false; }); setVisibility(next); }}>Tout d\u00e9sactiver</button>
          <button style={btnGhostStyle} onClick={() => { const next: Record<string, boolean> = {}; WIDGETS.forEach(w => { next[w.id] = w.defaultVisible; }); setVisibility(next); }}>Par d\u00e9faut</button>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════
  //  RENDER
  // ═══════════════════════════════════════

  const widgetRenderers: Record<string, () => React.ReactNode> = {
    todos: renderTodos, objectifs: renderObjectifs, priorites: renderPriorites, notes: renderNotes,
    pomodoro: renderPomodoro, focus: renderFocus, schedule: renderSchedule,
    calendrier: renderCalendrier, reunions: renderReunions, rappels: renderRappels, echeances: renderEcheances, semaine: renderSemaine,
    humeur: renderHumeur, hydratation: renderHydratation, activite: renderActivite, meditation: renderMeditation,
    sommeil: renderSommeil, gratitude: renderGratitude, affirmation: renderAffirmation,
    meteo: renderMeteo, citation: renderCitation, horoscope: renderHoroscope, actualites: renderActualites,
    anniversaires: renderAnniversaires, ephemeride: renderEphemeride,
    credits: renderCredits, agents: renderAgents, messagesNonLus: renderMessagesNonLus, projets: renderProjets,
    kpis: renderKpis, resume: renderResume, budget: renderBudget,
    repas: renderRepas, lecture: renderLecture, habitudes: renderHabitudes, contactsFav: renderContacts,
    playlist: renderPlaylist, journal: renderJournal,
  };

  const visibleCount = WIDGETS.filter(w => isVisible(w.id)).length;

  return (
    <div style={{ ...pageContainer(isMobile), maxWidth: 1200 }}>
      {/* Page Header */}
      <div style={{ marginBottom: 4 }}>
        <div style={headerRow()}>
          <span style={emojiIcon(24)}>{PAGE_META.journee.emoji}</span>
          <div>
            <h1 style={CU.pageTitle}>{PAGE_META.journee.title}</h1>
            <p style={CU.pageSubtitle}>{PAGE_META.journee.subtitle}</p>
          </div>
          <HelpBubble text={PAGE_META.journee.helpText} />
        </div>
      </div>
      <PageExplanation pageId="journee" text={PAGE_META.journee?.helpText} />
      {/* Clock & Greeting */}
      <div style={{ textAlign: 'center' as const, marginBottom: 24 }}>
        <div style={{ fontSize: 42, fontWeight: 200, color: CU.textMuted, letterSpacing: '-0.03em', fontFamily: 'monospace' }}>
          {currentTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: CU.text, margin: '8px 0 4px', letterSpacing: '-0.02em' }}>
          {getGreeting()}{session.displayName ? `, ${session.displayName}` : ''} !
        </h1>
        <p style={{ fontSize: 14, color: CU.textSecondary, textTransform: 'capitalize' as const, margin: '0 0 4px' }}><span className="fz-logo-word">{formatFrenchDate()}</span></p>
        <p style={{ fontSize: 13, color: CU.accent, fontWeight: 500 }}>Votre journ\u00e9e <span className="fz-logo-word">intelligente</span> en un coup d&apos;\u0153il</p>
      </div>

      {/* Tab switcher */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 20 }}>
        {[
          { id: 'briefing', label: 'Briefing IA', icon: '\u2600\uFE0F' },
          { id: 'widgets', label: 'Ma Journ\u00e9e', icon: '\u{1F4C5}' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as 'briefing' | 'widgets')}
            style={{
              padding: '8px 20px', borderRadius: 20, fontSize: 13, fontWeight: 600,
              border: activeTab === tab.id ? `1.5px solid ${CU.accent}` : `1.5px solid ${CU.border}`,
              background: activeTab === tab.id ? CU.accent : CU.bgSecondary,
              color: activeTab === tab.id ? '#fff' : CU.textSecondary,
              cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            <span style={{ fontSize: 14 }}>{tab.icon}</span> {tab.label}
          </button>
        ))}
      </div>

      {/* Briefing IA tab */}
      {activeTab === 'briefing' && <BriefingTab />}

      {/* Ma Journee tab — widgets */}
      {activeTab === 'widgets' && <>
        {/* Config button */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
          <button onClick={() => setShowConfig(!showConfig)} style={{ ...btnSmStyle, fontSize: 13, padding: '8px 20px' }}>
            {showConfig ? <>{'\u2715'} Fermer</> : <>{'\u2699\uFE0F'} Configurer mes widgets ({visibleCount}/{WIDGETS.length})</>}
          </button>
        </div>

        {renderConfigPanel()}

        {/* Widget grid by category */}
        {CATEGORIES.map(cat => {
          const catWidgets = WIDGETS.filter(w => w.category === cat.id && isVisible(w.id));
          if (catWidgets.length === 0) return null;
          return (
            <div key={cat.id} style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <span style={{ fontSize: 16 }}>{cat.emoji}</span>
                <span style={{ ...CU.sectionTitle, fontSize: 16 }}>{cat.label}</span>
                <span style={{ fontSize: 12, color: CU.textMuted }}>{catWidgets.length} widget{catWidgets.length > 1 ? 's' : ''}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(340px, 100%), 1fr))', gap: 12 }}>
                {catWidgets.map(w => {
                  const renderer = widgetRenderers[w.id];
                  return renderer ? <div key={w.id}>{renderer()}</div> : null;
                })}
              </div>
            </div>
          );
        })}

        {visibleCount === 0 && (
          <div style={CU.emptyState}>
            <div style={CU.emptyEmoji}>{'\u{1F4AC}'}</div>
            <div style={CU.emptyTitle}>Aucun widget actif</div>
            <div style={CU.emptyDesc}>Cliquez sur &quot;Configurer&quot; pour en activer.</div>
          </div>
        )}
      </>}
    </div>
  );
}
