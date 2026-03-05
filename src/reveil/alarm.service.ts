import { alarmRepository } from './alarm.repository';
import type { UserAlarm, CreateAlarmInput, UpdateAlarmInput, AlarmMode } from './alarm.types';
import { ALARM_RUBRICS } from './alarm.types';
import { logger } from '../utils/logger';
import { eventBus } from '../core/event-bus/event-bus';
import { llmProxyService } from '../billing/llm-proxy.service';
import { telephonyService } from '../avatar/services/telephony/telephony.service';

/** Map alarm mode to tone description for the LLM system prompt. */
const MODE_TONES: Record<AlarmMode, string> = {
  doux: 'Tu es doux, calme et apaisant. Parle lentement, avec tendresse, comme si tu reveillais un enfant. Utilise des mots doux et rassurants.',
  dur: 'Tu es un sergent instructeur. Ton est direct, ferme, sans fioritures. Tu cries presque. Reveille cette personne MAINTENANT. Pas de pitie.',
  sympa: 'Tu es chaleureux et bienveillant, comme un meilleur ami. Ton ton est enjoue, positif, encourageant.',
  drole: 'Tu es un comedien. Fais rire, utilise des blagues, des jeux de mots, des situations absurdes. Le reveil doit etre hilarant.',
  fou: 'Tu es completement dejante et imprevisible. Tu melanges les sujets, tu inventes des histoires folles, tu es survolte et creatif sans limites.',
  motivant: 'Tu es un coach de vie ultra-motive. Chaque phrase est un cri de ralliement. Tu pousses la personne a se depasser et a conquerir la journee.',
  zen: 'Tu es un maitre zen. Parle avec serenite, propose un moment de pleine conscience. Commence par une respiration guidee.',
  energique: 'Tu es plein d energie, dynamique, explosif. Rythme rapide, enthousiasme debordant, tu donnes envie de bondir du lit.',
};

/** Zodiac sign lookup from birth date. */
function getZodiacSign(birthDate: string): string {
  const date = new Date(birthDate);
  const month = date.getMonth() + 1;
  const day = date.getDate();

  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'Belier';
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'Taureau';
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return 'Gemeaux';
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return 'Cancer';
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'Lion';
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'Vierge';
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return 'Balance';
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return 'Scorpion';
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return 'Sagittaire';
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return 'Capricorne';
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 'Verseau';
  return 'Poissons';
}

class AlarmService {
  /**
   * List all alarms belonging to a user.
   */
  async listAlarms(userId: string): Promise<UserAlarm[]> {
    return alarmRepository.getByUserId(userId);
  }

  /**
   * Get a specific alarm, ensuring it belongs to the requesting user.
   */
  async getAlarm(id: string, userId: string): Promise<UserAlarm | null> {
    const alarm = await alarmRepository.getById(id);
    if (!alarm || alarm.userId !== userId) return null;
    return alarm;
  }

  /**
   * Create a new alarm for a user.
   */
  async createAlarm(userId: string, input: CreateAlarmInput): Promise<UserAlarm | null> {
    const alarm = await alarmRepository.create(userId, input);
    if (alarm) {
      logger.info('Alarm created', { alarmId: alarm.id, userId, mode: alarm.mode, time: alarm.alarmTime });
    }
    return alarm;
  }

  /**
   * Update an existing alarm.
   */
  async updateAlarm(id: string, userId: string, input: UpdateAlarmInput): Promise<UserAlarm | null> {
    const alarm = await alarmRepository.update(id, userId, input);
    if (alarm) {
      logger.info('Alarm updated', { alarmId: id, userId, fields: Object.keys(input) });
    }
    return alarm;
  }

  /**
   * Delete an alarm.
   */
  async deleteAlarm(id: string, userId: string): Promise<boolean> {
    const deleted = await alarmRepository.delete(id, userId);
    if (deleted) {
      logger.info('Alarm deleted', { alarmId: id, userId });
    }
    return deleted;
  }

  /**
   * Test an alarm: generate content and optionally deliver it.
   * Used for the "Tester" button in the dashboard.
   */
  async testAlarm(id: string, userId: string): Promise<{ content: string; delivered: boolean }> {
    const alarm = await this.getAlarm(id, userId);
    if (!alarm) {
      return { content: 'Alarme introuvable.', delivered: false };
    }

    const content = await this.generateAlarmContent(alarm);

    let delivered = false;
    if (alarm.phoneNumber) {
      delivered = await this.deliverAlarm(alarm, content);
    }

    return { content, delivered };
  }

  /**
   * Cron job entry point: find all enabled alarms and check each against its own timezone.
   * Uses Intl.DateTimeFormat for accurate timezone handling (DST, half-hour offsets, etc.).
   * Should be called every minute by the cron scheduler.
   */
  async checkAndTriggerAlarms(): Promise<void> {
    const now = new Date();
    const allAlarms = await alarmRepository.getAllEnabled();
    let totalTriggered = 0;

    for (const alarm of allAlarms) {
      try {
        // Get current time in the alarm's timezone using Intl.DateTimeFormat
        const formatter = new Intl.DateTimeFormat('en-US', {
          timeZone: alarm.timezone,
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
          weekday: 'short',
        });
        const parts = formatter.formatToParts(now);
        const hourStr = parts.find(p => p.type === 'hour')?.value ?? '00';
        const minuteStr = parts.find(p => p.type === 'minute')?.value ?? '00';
        const weekdayStr = parts.find(p => p.type === 'weekday')?.value ?? '';

        // Map weekday to day number (0=Sunday)
        const dayMap: Record<string, number> = {
          'Sun': 0, 'Mon': 1, 'Tue': 2, 'Wed': 3, 'Thu': 4, 'Fri': 5, 'Sat': 6,
        };
        const currentDay = dayMap[weekdayStr] ?? now.getDay();

        // Check day of week
        if (!alarm.daysOfWeek.includes(currentDay)) continue;

        // Check time match (1-minute window since cron runs every minute)
        const [targetH, targetM] = alarm.alarmTime.split(':').map(Number);
        const targetMinutes = (targetH ?? 0) * 60 + (targetM ?? 0);
        const currentMinutes = parseInt(hourStr) * 60 + parseInt(minuteStr);
        const diff = Math.abs(currentMinutes - targetMinutes);

        // 1-minute tolerance, handling midnight wrap (e.g., 23:59 vs 00:00)
        if (diff > 1 && diff < 1439) continue;

        // Prevent double-triggering: check if already triggered within last 55 seconds
        if (alarm.lastTriggeredAt) {
          const msSinceLastTrigger = now.getTime() - new Date(alarm.lastTriggeredAt).getTime();
          if (msSinceLastTrigger < 55_000) continue;
        }

        // Trigger the alarm
        logger.info('Triggering alarm', { alarmId: alarm.id, userId: alarm.userId, mode: alarm.mode, time: alarm.alarmTime, tz: alarm.timezone });

        const content = await this.generateAlarmContent(alarm);
        const delivered = await this.deliverAlarm(alarm, content);

        const status = delivered ? 'delivered' : 'failed';
        await alarmRepository.updateTriggerStatus(alarm.id, status);

        await eventBus.publish('ReminderSent', 'alarm-service', {
          alarmId: alarm.id,
          userId: alarm.userId,
          mode: alarm.mode,
          deliveryMethod: alarm.deliveryMethod,
          delivered,
        });

        totalTriggered++;
      } catch (error) {
        logger.error('Failed to check/trigger alarm', { alarmId: alarm.id, error });
        await alarmRepository.updateTriggerStatus(alarm.id, 'failed');
      }
    }

    if (totalTriggered > 0) {
      logger.info('Alarm cron cycle completed', { triggered: totalTriggered });
    }
  }

  /**
   * Generate the alarm content text by calling the LLM with a mode-specific system prompt
   * and the user's selected rubrics.
   */
  private async generateAlarmContent(alarm: UserAlarm): Promise<string> {
    const tonDescription = MODE_TONES[alarm.mode] ?? MODE_TONES.doux;

    // Build rubric instructions
    const rubricInstructions: string[] = [];
    const enabledRubrics = alarm.rubrics ?? [];

    for (const rubricId of enabledRubrics) {
      const rubricDef = ALARM_RUBRICS.find((r) => r.id === rubricId);
      if (!rubricDef) continue;

      switch (rubricId) {
        case 'meteo':
          rubricInstructions.push('- METEO: Invente des previsions meteo realistes et agreables pour la journee (temperature, ciel, vent).');
          break;
        case 'news':
          rubricInstructions.push('- NEWS: Invente 2-3 actualites positives et plausibles du jour, dans un ton journalistique leger.');
          break;
        case 'astrologie':
          if (alarm.birthDate) {
            const sign = getZodiacSign(alarm.birthDate);
            rubricInstructions.push(`- ASTROLOGIE: Horoscope du jour pour le signe ${sign}. Sois creatif et positif.`);
          } else {
            rubricInstructions.push('- ASTROLOGIE: Horoscope general du jour, positif et inspirant.');
          }
          break;
        case 'horoscope_chinois':
          if (alarm.birthDate) {
            rubricInstructions.push(`- HOROSCOPE CHINOIS: Previsions selon l\'astrologie chinoise pour une personne nee le ${alarm.birthDate}.`);
          } else {
            rubricInstructions.push('- HOROSCOPE CHINOIS: Sagesse et previsions chinoises du jour.');
          }
          break;
        case 'annonce_perso':
          if (alarm.customAnnouncement) {
            rubricInstructions.push(`- ANNONCE PERSONNALISEE: Integre ce message dans le reveil de maniere naturelle : "${alarm.customAnnouncement}"`);
          }
          break;
        case 'bonne_humeur':
          rubricInstructions.push('- BONNE HUMEUR: Commence par un message doux et positif pour bien demarrer la journee.');
          break;
        case 'energies_jour':
          rubricInstructions.push('- ENERGIES DU JOUR: Parle des energies, vibrations et couleurs spirituelles de la journee.');
          break;
        case 'citation':
          rubricInstructions.push('- CITATION: Inclus une citation inspirante (reelle ou inventee) avec son auteur.');
          break;
        case 'conseil_bien_etre':
          rubricInstructions.push('- BIEN-ETRE: Donne un conseil sante, respiration ou meditation courte.');
          break;
        case 'resume_agenda':
          rubricInstructions.push('- AGENDA: Invente un resume d\'agenda plausible (reunions, taches) pour illustrer la rubrique.');
          break;
        case 'rappel_objectifs':
          rubricInstructions.push('- OBJECTIFS: Rappelle d\'imaginer ses objectifs du jour et encourage a les visualiser.');
          break;
        case 'blague':
          rubricInstructions.push('- BLAGUE: Raconte une blague courte et drole en francais.');
          break;
        case 'gratitude':
          rubricInstructions.push('- GRATITUDE: Guide un moment de gratitude (3 choses pour lesquelles etre reconnaissant).');
          break;
        case 'fun_fact':
          rubricInstructions.push('- FUN FACT: Partage un fait surprenant ou amusant.');
          break;
        case 'musique_suggeree':
          rubricInstructions.push('- MUSIQUE: Suggere une chanson ou un artiste qui correspond a l\'humeur du reveil.');
          break;
        case 'defi_jour':
          rubricInstructions.push('- DEFI: Propose un petit challenge simple et fun pour la journee.');
          break;
        case 'anecdote_histoire':
          rubricInstructions.push('- ANECDOTE HISTORIQUE: Raconte un evenement historique qui s\'est passe un jour comme aujourd\'hui.');
          break;
        case 'conseil_productivite':
          rubricInstructions.push('- PRODUCTIVITE: Donne une astuce concrete pour etre plus efficace aujourd\'hui.');
          break;
        default:
          rubricInstructions.push(`- ${rubricDef.label.toUpperCase()}: ${rubricDef.description}`);
      }
    }

    const rubricBlock = rubricInstructions.length > 0
      ? `\n\nVoici les rubriques a inclure dans l'ordre :\n${rubricInstructions.join('\n')}`
      : '\nFais un reveil general avec un message positif et motivant.';

    const systemPrompt = `Tu es Sarah, l'assistante IA de Freenzy.io. Tu fais office de reveil intelligent.
Ton mode aujourd'hui : ${alarm.mode.toUpperCase()}.
${tonDescription}

Tu dois generer le texte d'un reveil matinal en francais. Ce texte sera lu a voix haute au telephone ou envoye par WhatsApp.
Garde un ton naturel, fluide, comme si tu parlais vraiment a la personne.
Ne mets pas de markdown, pas de titres, pas de listes a puces. Ecris un texte continu, agreable a ecouter.
Longueur ideale : 200-400 mots.${rubricBlock}

Termine toujours par un encouragement pour la journee.`;

    const userMessage = `Genere le reveil du ${new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}. Le reveil s'appelle "${alarm.name}".`;

    try {
      const response = await llmProxyService.processRequest({
        userId: alarm.userId,
        model: 'sonnet',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        maxTokens: 1024,
        temperature: 0.9,
        agentName: 'alarm-service',
        endpoint: '/reveil/generate',
      });

      if ('error' in response) {
        logger.warn('LLM generation failed for alarm', { alarmId: alarm.id, error: response.error });
        return this.getFallbackContent(alarm);
      }

      return response.content;
    } catch (error) {
      logger.error('LLM call failed for alarm content generation', { alarmId: alarm.id, error });
      return this.getFallbackContent(alarm);
    }
  }

  /**
   * Fallback content when LLM is unavailable.
   */
  private getFallbackContent(alarm: UserAlarm): string {
    const greetings: Record<AlarmMode, string> = {
      doux: 'Bonjour, c\'est l\'heure de se reveiller en douceur. Prenez votre temps, respirez, et commencez cette belle journee sereinement.',
      dur: 'DEBOUT ! C\'est l\'heure ! Pas de temps a perdre, la journee n\'attend pas. Allez, on se leve MAINTENANT !',
      sympa: 'Hey, bonjour ! C\'est l\'heure de se lever. J\'espere que tu as bien dormi. Allez, une super journee t\'attend !',
      drole: 'Ding dong ! Votre matelas a lance un avis d\'expulsion. Il est temps de quitter le lit avant qu\'il n\'appelle la securite !',
      fou: 'ALERTE REVEIL COSMIQUE ! Les pandas de l\'espace ont confirme : c\'est l\'heure de se lever ! Repetez, ce n\'est PAS un exercice !',
      motivant: 'CHAMPION ! Chaque matin est une nouvelle chance de briller. Tu es capable de grandes choses. Leve-toi et conquiers cette journee !',
      zen: 'Inspirez profondement... Expirez lentement... Le nouveau jour se leve avec vous. Prenez un moment pour apprecier ce matin paisible.',
      energique: 'BOOOM ! Nouveau jour, nouvelle energie ! On se leve, on s\'etire, et on attaque cette journee a fond ! C\'est parti !',
    };
    return greetings[alarm.mode] ?? greetings.doux;
  }

  /**
   * Deliver the alarm content to the user via their chosen delivery method.
   */
  private async deliverAlarm(alarm: UserAlarm, content: string): Promise<boolean> {
    if (!alarm.phoneNumber) {
      logger.warn('Cannot deliver alarm: no phone number configured', { alarmId: alarm.id });
      return false;
    }

    try {
      if (alarm.deliveryMethod === 'whatsapp_message') {
        const result = await telephonyService.sendWhatsApp(alarm.phoneNumber, content);
        if (result) {
          logger.info('Alarm delivered via WhatsApp', { alarmId: alarm.id, messageSid: result.messageSid });
          return true;
        }
        logger.warn('WhatsApp delivery returned null', { alarmId: alarm.id });
        return false;
      }

      if (alarm.deliveryMethod === 'phone_call') {
        // For phone calls, we generate TwiML with <Say> containing the alarm content.
        // We encode the content into the TwiML URL as a query parameter.
        // Use the webhook base URL to serve the TwiML response.
        const webhookBaseUrl = process.env['WEBHOOK_BASE_URL'] ?? 'https://freenzy.local';
        const twimlUrl = `${webhookBaseUrl}/webhooks/twilio/voice`;

        // First, send the full content via SMS as a backup
        await telephonyService.sendSms(alarm.phoneNumber, content);

        // Initiate the call with the standard voice webhook
        const callSession = await telephonyService.initiateOutboundCall(
          alarm.phoneNumber,
          twimlUrl,
          `${webhookBaseUrl}/webhooks/twilio/voice/status`,
        );

        if (callSession) {
          logger.info('Alarm call initiated', { alarmId: alarm.id, callSid: callSession.callSid });
          return true;
        }

        logger.warn('Phone call initiation returned null, SMS fallback was sent', { alarmId: alarm.id });
        // SMS was sent as fallback, consider it partially delivered
        return true;
      }

      logger.warn('Unknown delivery method', { alarmId: alarm.id, method: alarm.deliveryMethod });
      return false;
    } catch (error) {
      logger.error('Alarm delivery failed', { alarmId: alarm.id, deliveryMethod: alarm.deliveryMethod, error });
      return false;
    }
  }

}

export const alarmService = new AlarmService();
