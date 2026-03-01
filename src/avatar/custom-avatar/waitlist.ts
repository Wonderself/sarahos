import { v4 as uuidv4 } from 'uuid';
import { logger } from '../../utils/logger';
import type { CustomAvatarRequest } from './custom-avatar.types';

export class CustomAvatarWaitlist {
  private waitlist = new Map<string, CustomAvatarRequest>();

  register(clientId: string, clientEmail: string, companyName: string): CustomAvatarRequest {
    const request: CustomAvatarRequest = {
      id: uuidv4(),
      clientId,
      clientEmail,
      companyName,
      status: 'waitlisted',
      requestedAt: new Date().toISOString(),
    };

    this.waitlist.set(request.id, request);

    logger.info('Custom avatar waitlist registration', {
      id: request.id,
      clientId,
      companyName,
    });

    return request;
  }

  getByClient(clientId: string): CustomAvatarRequest[] {
    return Array.from(this.waitlist.values()).filter((r) => r.clientId === clientId);
  }

  getAll(): CustomAvatarRequest[] {
    return Array.from(this.waitlist.values());
  }

  getCount(): number {
    return this.waitlist.size;
  }
}

export const customAvatarWaitlist = new CustomAvatarWaitlist();
