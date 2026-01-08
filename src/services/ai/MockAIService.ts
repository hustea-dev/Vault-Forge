import type { AIService, AIResponse, TokenUsage } from '../../types/interfaces.js';

export class MockAIService implements AIService {
    private responseText: string;

    constructor(responseText: string = "This is a mock AI response.") {
        this.responseText = responseText;
    }

    async generateContent(prompt: string): Promise<AIResponse> {
        const usage: TokenUsage = {
            promptTokens: prompt.length,
            completionTokens: this.responseText.length,
            totalTokens: prompt.length + this.responseText.length,
        };
        return Promise.resolve({ text: this.responseText, usage });
    }

    async *generateContentStream(prompt: string): AsyncGenerator<string, AIResponse, unknown> {
        const usage: TokenUsage = {
            promptTokens: prompt.length,
            completionTokens: this.responseText.length,
            totalTokens: prompt.length + this.responseText.length,
        };
        yield this.responseText;
        return Promise.resolve({ text: this.responseText, usage });
    }
}
