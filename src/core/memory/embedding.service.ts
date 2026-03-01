import { logger } from '../../utils/logger';
import { LLMError } from '../../utils/errors';
import { withRetry } from '../../utils/retry';
import type { EmbeddingVector } from './memory.types';

export class EmbeddingService {
  private readonly model: string;
  private readonly apiKey: string | undefined;

  constructor() {
    this.model = process.env['EMBEDDING_MODEL'] ?? 'text-embedding-ada-002';
    this.apiKey = process.env['OPENAI_API_KEY'];
  }

  async generate(text: string): Promise<EmbeddingVector> {
    if (!this.apiKey) {
      throw new LLMError('OPENAI_API_KEY not configured for embeddings');
    }

    return withRetry(
      async () => {
        const response = await fetch('https://api.openai.com/v1/embeddings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify({
            model: this.model,
            input: text,
          }),
        });

        if (!response.ok) {
          throw new LLMError(`Embedding API error: ${response.status} ${response.statusText}`);
        }

        const data = (await response.json()) as {
          data: Array<{ embedding: number[] }>;
        };

        const embedding = data.data[0]?.embedding;
        if (!embedding) {
          throw new LLMError('No embedding returned from API');
        }

        logger.debug('Embedding generated', { model: this.model, dimensions: embedding.length });

        return {
          values: embedding,
          model: this.model,
          dimensions: embedding.length,
        };
      },
      'embedding-generation',
      { maxRetries: 2 }
    );
  }

  async generateBatch(texts: string[]): Promise<EmbeddingVector[]> {
    if (!this.apiKey) {
      throw new LLMError('OPENAI_API_KEY not configured for embeddings');
    }

    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        input: texts,
      }),
    });

    if (!response.ok) {
      throw new LLMError(`Embedding batch API error: ${response.status}`);
    }

    const data = (await response.json()) as {
      data: Array<{ embedding: number[] }>;
    };

    return data.data.map((item) => ({
      values: item.embedding,
      model: this.model,
      dimensions: item.embedding.length,
    }));
  }
}

export const embeddingService = new EmbeddingService();
