jest.mock('../utils/logger', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), debug: jest.fn(), error: jest.fn() },
}));

jest.mock('../whatsapp/whatsapp.repository', () => ({
  whatsAppRepository: {
    getPhoneLink: jest.fn().mockResolvedValue(null),
  },
}));

jest.mock('../whatsapp/whatsapp.service', () => ({
  whatsAppService: {
    isConfigured: jest.fn().mockReturnValue(false),
  },
}));

const mockDbClient = {
  isConnected: jest.fn().mockReturnValue(true),
  query: jest.fn(),
};

jest.mock('../infra', () => ({
  dbClient: mockDbClient,
}));

import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  let service: NotificationService;

  const baseNotificationRow = {
    id: 'n1', user_id: 'u1', channel: 'in_app', type: 'welcome',
    subject: 'Welcome!', body: 'Welcome to Sarah OS',
    metadata: {}, status: 'pending', external_id: null,
    sent_at: null, delivered_at: null, read_at: null, error_message: null,
    created_at: new Date().toISOString(),
  };

  beforeEach(() => {
    service = new NotificationService();
    jest.clearAllMocks();
    mockDbClient.isConnected.mockReturnValue(true);
  });

  describe('send', () => {
    it('should create and dispatch in_app notification', async () => {
      mockDbClient.query
        .mockResolvedValueOnce({ rows: [baseNotificationRow] }) // INSERT
        .mockResolvedValueOnce({}); // markAsSent UPDATE

      const notification = await service.send({
        userId: 'u1', channel: 'in_app', type: 'welcome',
        subject: 'Welcome!', body: 'Welcome to Sarah OS',
      });

      expect(notification).not.toBeNull();
      expect(notification!.channel).toBe('in_app');
      expect(mockDbClient.query).toHaveBeenCalledTimes(2);
    });

    it('should create and dispatch WhatsApp notification', async () => {
      mockDbClient.query
        .mockResolvedValueOnce({ rows: [{ ...baseNotificationRow, channel: 'whatsapp' }] })
        .mockResolvedValueOnce({});

      const notification = await service.send({
        userId: 'u1', channel: 'whatsapp', type: 'campaign_approved',
        subject: 'Campaign Approved', body: 'Your campaign was approved',
      });

      expect(notification).not.toBeNull();
    });

    it('should return null if DB not connected', async () => {
      mockDbClient.isConnected.mockReturnValue(false);
      const notification = await service.send({
        userId: 'u1', channel: 'in_app', type: 'welcome',
        subject: 'Hi', body: 'Hello',
      });
      expect(notification).toBeNull();
    });
  });

  describe('markAsSent', () => {
    it('should update status to sent', async () => {
      mockDbClient.query.mockResolvedValue({});
      await service.markAsSent('n1', 'ext-123');
      expect(mockDbClient.query).toHaveBeenCalledWith(
        expect.stringContaining("status = 'sent'"),
        ['ext-123', 'n1'],
      );
    });

    it('should skip if DB not connected', async () => {
      mockDbClient.isConnected.mockReturnValue(false);
      await service.markAsSent('n1', 'ext-123');
      expect(mockDbClient.query).not.toHaveBeenCalled();
    });
  });

  describe('markAsRead', () => {
    it('should update status to read', async () => {
      mockDbClient.query.mockResolvedValue({});
      await service.markAsRead('n1');
      expect(mockDbClient.query).toHaveBeenCalledWith(
        expect.stringContaining("status = 'read'"),
        ['n1'],
      );
    });
  });

  describe('getByUser', () => {
    it('should return notifications for user', async () => {
      mockDbClient.query.mockResolvedValue({
        rows: [baseNotificationRow, { ...baseNotificationRow, id: 'n2' }],
      });

      const notifications = await service.getByUser('u1');
      expect(notifications).toHaveLength(2);
    });

    it('should return empty array if DB not connected', async () => {
      mockDbClient.isConnected.mockReturnValue(false);
      expect(await service.getByUser('u1')).toEqual([]);
    });

    it('should respect limit parameter', async () => {
      mockDbClient.query.mockResolvedValue({ rows: [] });
      await service.getByUser('u1', 10);
      expect(mockDbClient.query).toHaveBeenCalledWith(
        expect.any(String),
        ['u1', 10],
      );
    });
  });

  describe('getUnreadCount', () => {
    it('should return unread count', async () => {
      mockDbClient.query.mockResolvedValue({ rows: [{ count: 5 }] });
      expect(await service.getUnreadCount('u1')).toBe(5);
    });

    it('should return 0 if DB not connected', async () => {
      mockDbClient.isConnected.mockReturnValue(false);
      expect(await service.getUnreadCount('u1')).toBe(0);
    });
  });
});
