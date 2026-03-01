import { logger } from '../utils/logger';
import { config } from '../utils/config';

export class WhatsAppService {
  private get phoneNumberId(): string {
    return config.WHATSAPP_PHONE_NUMBER_ID ?? '';
  }

  private get accessToken(): string {
    return config.WHATSAPP_ACCESS_TOKEN ?? '';
  }

  private get apiVersion(): string {
    return config.WHATSAPP_API_VERSION ?? 'v18.0';
  }

  private get baseUrl(): string {
    return `https://graph.facebook.com/${this.apiVersion}/${this.phoneNumberId}`;
  }

  isConfigured(): boolean {
    return !!(this.phoneNumberId && this.accessToken);
  }

  // ── Send Text Message ──

  async sendTextMessage(params: { to: string; text: string; previewUrl?: boolean }): Promise<string | null> {
    if (!this.isConfigured()) {
      logger.warn('WhatsApp not configured, message not sent', { to: params.to });
      return null;
    }

    try {
      const response = await fetch(`${this.baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: params.to,
          type: 'text',
          text: {
            body: params.text,
            preview_url: params.previewUrl ?? false,
          },
        }),
      });

      const data = await response.json() as { messages?: Array<{ id: string }>; error?: { message: string; code: number } };

      if (!response.ok) {
        logger.error('WhatsApp send text failed', {
          status: response.status,
          error: data.error?.message,
          to: params.to,
        });
        return null;
      }

      const messageId = data.messages?.[0]?.id ?? null;
      logger.info('WhatsApp text message sent', { to: params.to, messageId });
      return messageId;
    } catch (error) {
      logger.error('WhatsApp send text error', {
        to: params.to,
        error: error instanceof Error ? error.message : String(error),
      });
      return null;
    }
  }

  // ── Send Audio Message ──

  async sendAudioMessage(params: { to: string; mediaId: string }): Promise<string | null> {
    if (!this.isConfigured()) return null;

    try {
      const response = await fetch(`${this.baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: params.to,
          type: 'audio',
          audio: { id: params.mediaId },
        }),
      });

      const data = await response.json() as { messages?: Array<{ id: string }>; error?: { message: string } };

      if (!response.ok) {
        logger.error('WhatsApp send audio failed', { status: response.status, error: data.error?.message });
        return null;
      }

      const messageId = data.messages?.[0]?.id ?? null;
      logger.info('WhatsApp audio message sent', { to: params.to, messageId });
      return messageId;
    } catch (error) {
      logger.error('WhatsApp send audio error', {
        error: error instanceof Error ? error.message : String(error),
      });
      return null;
    }
  }

  // ── Send Template Message ──

  async sendTemplateMessage(params: {
    to: string;
    templateName: string;
    languageCode: string;
    parameters?: Array<{ type: string; text: string }>;
  }): Promise<string | null> {
    if (!this.isConfigured()) return null;

    try {
      const components: Array<Record<string, unknown>> = [];
      if (params.parameters && params.parameters.length > 0) {
        components.push({
          type: 'body',
          parameters: params.parameters,
        });
      }

      const response = await fetch(`${this.baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: params.to,
          type: 'template',
          template: {
            name: params.templateName,
            language: { code: params.languageCode },
            components: components.length > 0 ? components : undefined,
          },
        }),
      });

      const data = await response.json() as { messages?: Array<{ id: string }>; error?: { message: string } };

      if (!response.ok) {
        logger.error('WhatsApp send template failed', { status: response.status, error: data.error?.message });
        return null;
      }

      return data.messages?.[0]?.id ?? null;
    } catch (error) {
      logger.error('WhatsApp send template error', {
        error: error instanceof Error ? error.message : String(error),
      });
      return null;
    }
  }

  // ── Download Media ──

  async downloadMedia(mediaId: string): Promise<Buffer | null> {
    if (!this.accessToken) return null;

    try {
      // Step 1: Get media URL
      const metaResponse = await fetch(
        `https://graph.facebook.com/${this.apiVersion}/${mediaId}`,
        {
          headers: { 'Authorization': `Bearer ${this.accessToken}` },
        },
      );

      const metaData = await metaResponse.json() as { url?: string; error?: { message: string } };
      if (!metaResponse.ok || !metaData.url) {
        logger.error('WhatsApp get media URL failed', { mediaId, error: metaData.error?.message });
        return null;
      }

      // Step 2: Download binary
      const mediaResponse = await fetch(metaData.url, {
        headers: { 'Authorization': `Bearer ${this.accessToken}` },
      });

      if (!mediaResponse.ok) {
        logger.error('WhatsApp download media failed', { mediaId, status: mediaResponse.status });
        return null;
      }

      const arrayBuffer = await mediaResponse.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      logger.info('WhatsApp media downloaded', { mediaId, bytes: buffer.length });
      return buffer;
    } catch (error) {
      logger.error('WhatsApp download media error', {
        mediaId,
        error: error instanceof Error ? error.message : String(error),
      });
      return null;
    }
  }

  // ── Upload Media ──

  async uploadMedia(buffer: Buffer, mimeType: string): Promise<string | null> {
    if (!this.isConfigured()) return null;

    try {
      const formData = new FormData();
      formData.append('messaging_product', 'whatsapp');
      formData.append('type', mimeType);
      formData.append('file', new Blob([buffer], { type: mimeType }), `audio.${mimeType.split('/')[1] || 'mp3'}`);

      const response = await fetch(`${this.baseUrl}/media`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
        body: formData,
      });

      const data = await response.json() as { id?: string; error?: { message: string } };

      if (!response.ok) {
        logger.error('WhatsApp upload media failed', { status: response.status, error: data.error?.message });
        return null;
      }

      logger.info('WhatsApp media uploaded', { mediaId: data.id, mimeType });
      return data.id ?? null;
    } catch (error) {
      logger.error('WhatsApp upload media error', {
        error: error instanceof Error ? error.message : String(error),
      });
      return null;
    }
  }

  // ── Mark as Read ──

  async markAsRead(messageId: string): Promise<void> {
    if (!this.isConfigured()) return;

    try {
      await fetch(`${this.baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          status: 'read',
          message_id: messageId,
        }),
      });
    } catch (error) {
      logger.warn('WhatsApp mark as read failed', {
        messageId,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
}

export const whatsAppService = new WhatsAppService();
