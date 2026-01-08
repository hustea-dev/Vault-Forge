import OpenAI from 'openai';
import type { AIService, AIResponse } from '../../types/interfaces.js';
import { TEXT } from '../../config/text.js';

export class OpenAIService implements AIService {
    private client: OpenAI;
    private model: string;

    constructor(apiKey: string, model: string) {
        this.client = new OpenAI({ apiKey });
        this.model = model;
    }

    async generateContent(prompt: string): Promise<AIResponse> {
        const response = await this.client.chat.completions.create({
            model: this.model,
            messages: [{ role: 'user', content: prompt }],
        });

        return {
            text: response.choices[0]?.message?.content || '',
            usage: {
                promptTokens: response.usage?.prompt_tokens || 0,
                completionTokens: response.usage?.completion_tokens || 0,
                totalTokens: response.usage?.total_tokens || 0
            }
        };
    }

    async *generateContentStream(prompt: string): AsyncGenerator<string, AIResponse, unknown> {
        const stream = await this.client.chat.completions.create({
            model: this.model,
            messages: [{ role: 'user', content: prompt }],
            stream: true,
            stream_options: { include_usage: true }
        });

        let fullText = "";
        let usage;

        for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            fullText += content;
            yield content;

            if (chunk.usage) {
                usage = chunk.usage;
            }
        }

        return {
            text: fullText,
            usage: {
                promptTokens: usage?.prompt_tokens || 0,
                completionTokens: usage?.completion_tokens || 0,
                totalTokens: usage?.total_tokens || 0
            }
        };
    }
}
