import { GoogleGenAI } from "@google/genai";
import type {AIService, AIResponse} from '../../types/interfaces.ts';
import { TEXT } from '../../config/text.ts';

export class GeminiService implements AIService {
    private client: GoogleGenAI;
    private modelName: string = "gemini-2.5-flash";

    constructor(apiKey: string, modelName?: string) {
        this.client = new GoogleGenAI({ apiKey });
        if (modelName) {
            this.modelName = modelName;
        }
    }

    async generateContent(prompt: string): Promise<AIResponse> {
        try {
            const result = await this.client.models.generateContent({
                model: this.modelName,
                contents: [{ role: "user", parts: [{ text: prompt }] }]
            });

            const text = result.text || "";
            
            const usageMetadata = result.usageMetadata;
            
            const usage = usageMetadata ? {
                promptTokens: usageMetadata.promptTokenCount || 0,
                completionTokens: usageMetadata.candidatesTokenCount || 0,
                totalTokens: usageMetadata.totalTokenCount || 0
            } : undefined;

            return { text, usage };

        } catch (error) {
            console.error(TEXT.errors.geminiApi, error);
            throw error;
        }
    }
}
