import Anthropic from '@anthropic-ai/sdk';
import type { AIService, AIResponse } from '../../types/interfaces.js';
import { TEXT } from '../../config/text.js';

export class ClaudeService implements AIService {
    private client: Anthropic;
    private model: string;

    constructor(apiKey: string, model: string) {
        this.client = new Anthropic({ apiKey });
        this.model = model;
    }

    async generateContent(prompt: string): Promise<AIResponse> {
        const response = await this.client.messages.create({
            model: this.model,
            max_tokens: 4096,
            messages: [{ role: 'user', content: prompt }],
        });

        const text = response.content[0]?.type === 'text' ? response.content[0].text : '';
        
        return {
            text: text,
            usage: {
                promptTokens: response.usage.input_tokens,
                completionTokens: response.usage.output_tokens,
                totalTokens: response.usage.input_tokens + response.usage.output_tokens
            }
        };
    }

    async *generateContentStream(prompt: string): AsyncGenerator<string, AIResponse, unknown> {
        const stream = await this.client.messages.create({
            model: this.model,
            max_tokens: 4096,
            messages: [{ role: 'user', content: prompt }],
            stream: true,
        });

        let fullText = "";
        let inputTokens = 0;
        let outputTokens = 0;

        for await (const chunk of stream) {
            if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
                const text = chunk.delta.text;
                fullText += text;
                yield text;
            }
            if (chunk.type === 'message_start') {
                inputTokens = chunk.message.usage.input_tokens;
            }
            if (chunk.type === 'message_delta') {
                outputTokens = chunk.usage.output_tokens;
            }
        }

        return {
            text: fullText,
            usage: {
                promptTokens: inputTokens,
                completionTokens: outputTokens,
                totalTokens: inputTokens + outputTokens
            }
        };
    }
}
