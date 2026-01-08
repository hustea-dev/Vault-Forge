import { GoogleGenerativeAI } from '@google/generative-ai';
import type { AIService, AIResponse } from '../../types/interfaces.js';
import { TEXT } from '../../config/text.js';

export class GeminiService implements AIService {
    private genAI: GoogleGenerativeAI;
    private model: string;

    constructor(apiKey: string, model: string) {
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.model = model;
    }

    async generateContent(prompt: string): Promise<AIResponse> {
        const model = this.genAI.getGenerativeModel({ model: this.model });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        
        return {
            text: response.text(),
            usage: {
                promptTokens: response.usageMetadata?.promptTokenCount || 0,
                completionTokens: response.usageMetadata?.candidatesTokenCount || 0,
                totalTokens: response.usageMetadata?.totalTokenCount || 0
            }
        };
    }

    async *generateContentStream(prompt: string): AsyncGenerator<string, AIResponse, unknown> {
        const model = this.genAI.getGenerativeModel({ model: this.model });
        const result = await model.generateContentStream(prompt);

        let fullText = "";
        let usageMetadata;

        for await (const chunk of result.stream) {
            const text = chunk.text();
            fullText += text;
            yield text;
            if (chunk.usageMetadata) {
                usageMetadata = chunk.usageMetadata;
            }
        }

        return {
            text: fullText,
            usage: {
                promptTokens: usageMetadata?.promptTokenCount || 0,
                completionTokens: usageMetadata?.candidatesTokenCount || 0,
                totalTokens: usageMetadata?.totalTokenCount || 0
            }
        };
    }
}
