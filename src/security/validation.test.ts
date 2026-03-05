import type { Request, Response } from 'express';
import { validateBody, validateQuery } from './validation.middleware';
import {
  loginSchema,
  approvalDecisionSchema,
  conversationStartSchema,
  conversationTurnSchema,
  ttsSynthesizeSchema,
  telephonyCallSchema,
  createTaskSchema,
  memoryStoreSchema,
  memorySearchSchema,
  agentExecuteSchema,
  eventsQuerySchema,
} from './validation.schemas';

const mockRes = () => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
};

describe('validateBody middleware', () => {
  it('should pass valid body through', () => {
    const middleware = validateBody(loginSchema);
    const req = { body: { apiKey: 'test-key' } } as Request;
    const res = mockRes();
    const next = jest.fn();

    middleware(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.body).toEqual({ apiKey: 'test-key' });
  });

  it('should pass valid email+password login through', () => {
    const middleware = validateBody(loginSchema);
    const req = { body: { email: 'test@example.com', password: 'secret' } } as Request;
    const res = mockRes();
    const next = jest.fn();

    middleware(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('should return 400 for missing required field', () => {
    const middleware = validateBody(loginSchema);
    const req = { body: {} } as Request;
    const res = mockRes();
    const next = jest.fn();

    middleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      error: 'Validation failed',
    }));
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 400 for invalid enum value', () => {
    const middleware = validateBody(approvalDecisionSchema);
    const req = { body: { status: 'MAYBE', decidedBy: 'admin' } } as Request;
    const res = mockRes();

    middleware(req, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(400);
  });
});

describe('validateQuery middleware', () => {
  it('should pass valid query through', () => {
    const middleware = validateQuery(eventsQuerySchema);
    const req = { query: { limit: '10', offset: '0' } } as unknown as Request;
    const res = mockRes();
    const next = jest.fn();

    middleware(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('should return 400 for invalid query param', () => {
    const middleware = validateQuery(eventsQuerySchema);
    const req = { query: { limit: 'abc' } } as unknown as Request;
    const res = mockRes();

    middleware(req, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(400);
  });
});

describe('Validation schemas', () => {
  it('approvalDecisionSchema accepts valid input', () => {
    const result = approvalDecisionSchema.safeParse({ status: 'APPROVED', decidedBy: 'admin' });
    expect(result.success).toBe(true);
  });

  it('approvalDecisionSchema rejects missing decidedBy', () => {
    const result = approvalDecisionSchema.safeParse({ status: 'APPROVED' });
    expect(result.success).toBe(false);
  });

  it('conversationStartSchema accepts valid input', () => {
    const result = conversationStartSchema.safeParse({
      sessionId: 'sess-1',
      avatarBase: 'sarah',
      personaId: 'p1',
    });
    expect(result.success).toBe(true);
  });

  it('conversationStartSchema rejects invalid avatarBase', () => {
    const result = conversationStartSchema.safeParse({
      sessionId: 'sess-1',
      avatarBase: 'unknown',
      personaId: 'p1',
    });
    expect(result.success).toBe(false);
  });

  it('conversationTurnSchema accepts minimal input', () => {
    const result = conversationTurnSchema.safeParse({ sessionId: 'sess-1' });
    expect(result.success).toBe(true);
  });

  it('ttsSynthesizeSchema rejects empty text', () => {
    const result = ttsSynthesizeSchema.safeParse({ sessionId: 's1', text: '' });
    expect(result.success).toBe(false);
  });

  it('ttsSynthesizeSchema rejects text over 5000 chars', () => {
    const result = ttsSynthesizeSchema.safeParse({ sessionId: 's1', text: 'a'.repeat(5001) });
    expect(result.success).toBe(false);
  });

  it('telephonyCallSchema accepts valid input', () => {
    const result = telephonyCallSchema.safeParse({
      to: '+33612345678',
      avatarBase: 'emmanuel',
      sessionId: 'sess-1',
    });
    expect(result.success).toBe(true);
  });

  it('createTaskSchema provides defaults', () => {
    const result = createTaskSchema.safeParse({
      title: 'Test task',
      description: 'Do something',
      assignedBy: 'admin',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.priority).toBe('MEDIUM');
      expect(result.data.payload).toEqual({});
      expect(result.data.autonomyBoost).toBe(false);
    }
  });

  it('memoryStoreSchema accepts valid input', () => {
    const result = memoryStoreSchema.safeParse({
      content: 'Important observation',
      source: 'knowledge-agent',
    });
    expect(result.success).toBe(true);
  });

  it('memorySearchSchema provides defaults', () => {
    const result = memorySearchSchema.safeParse({ query: 'test search' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.topK).toBe(5);
      expect(result.data.minScore).toBe(0.7);
    }
  });

  it('agentExecuteSchema accepts valid input', () => {
    const result = agentExecuteSchema.safeParse({
      title: 'Execute task',
      description: 'Do it now',
    });
    expect(result.success).toBe(true);
  });

  it('eventsQuerySchema coerces string numbers', () => {
    const result = eventsQuerySchema.safeParse({ limit: '25', offset: '10' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.limit).toBe(25);
      expect(result.data.offset).toBe(10);
    }
  });
});
