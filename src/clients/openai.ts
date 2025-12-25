import OpenAI from 'openai';
import { getConfig } from '../config';
import { calculateCost } from './pricing';

export interface UsageInfo {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  estimatedCost: number;
}

export interface StreamCallbacks {
  onChunk: (chunk: string) => void;
  onComplete: (usage?: UsageInfo) => void;
  onError: (error: Error) => void;
}

export class OpenAIClient {
  private client: OpenAI;
  private model: string;

  constructor() {
    const config = getConfig();

    if (!config.openai.apiKey) {
      throw new Error(
        'OpenAI API key is not configured. Please set it in settings.'
      );
    }

    this.client = new OpenAI({
      apiKey: config.openai.apiKey,
      baseURL: config.openai.baseUrl,
    });
    this.model = config.openai.model;
  }

  async improveText(
    systemPrompt: string,
    userContent: string,
    callbacks: StreamCallbacks,
    abortSignal?: AbortSignal
  ): Promise<void> {
    try {
      const stream = await this.client.chat.completions.create(
        {
          model: this.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userContent },
          ],
          stream: true,
          stream_options: { include_usage: true },
          response_format: { type: 'json_object' },
        },
        {
          signal: abortSignal,
        }
      );

      let usage: UsageInfo | undefined;

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          callbacks.onChunk(content);
        }

        // Usage info comes in the last chunk
        if (chunk.usage) {
          usage = {
            promptTokens: chunk.usage.prompt_tokens,
            completionTokens: chunk.usage.completion_tokens,
            totalTokens: chunk.usage.total_tokens,
            estimatedCost: calculateCost(
              this.model,
              chunk.usage.prompt_tokens,
              chunk.usage.completion_tokens
            ),
          };
        }
      }

      callbacks.onComplete(usage);
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }
      callbacks.onError(error instanceof Error ? error : new Error(String(error)));
    }
  }
}
