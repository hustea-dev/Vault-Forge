import { GeminiService } from './GeminiService.js';
import { OpenAIService } from './OpenAIService.js';
import { GroqService } from './GroqService.js';
import { ClaudeService } from './ClaudeService.js';
import type { AIService } from '../../types/interfaces.js';
import { AIProvider } from '../../types/constants.js';
import { TEXT } from '../../config/text.js';

/**
 * AIサービスのインスタンスを生成するファクトリクラス。
 * Factory class for creating AI service instances.
 */
export class AIServiceFactory {
    /**
     * 指定されたプロバイダーとモデルに基づいてAIServiceインスタンスを生成する。
     * Creates an AIService instance based on the specified provider and model.
     * @param {string} provider - AIプロバイダー名 / The name of the AI provider.
     * @param {string} apiKey - APIキー / The API key.
     * @param {string} [model] - 使用するモデル名 / The name of the model to use.
     * @returns {AIService} 生成されたAIServiceインスタンス / The created AIService instance.
     * @throws {Error} モデルが指定されていない場合 / If the model is not specified.
     */
    static create(provider: string, apiKey: string, model?: string): AIService {
        if (!model) {
            throw new Error(TEXT.errors.modelNotSpecified.replace('{provider}', provider));
        }

        switch (provider) {
            case AIProvider.GEMINI:
                return new GeminiService(apiKey, model);
            case AIProvider.OPENAI:
                return new OpenAIService(apiKey, model);
            case AIProvider.GROQ:
                return new GroqService(apiKey, model);
            case AIProvider.CLAUDE:
                return new ClaudeService(apiKey, model);
            default:
                console.warn(TEXT.logs.unknownProviderFallback.replace('{provider}', provider));
                return new GeminiService(apiKey, model);
        }
    }

    /**
     * 指定されたプロバイダーのAPIキーを取得する。
     * Gets the API key for the specified provider.
     * @param {string} provider - AIプロバイダー名 / The name of the AI provider.
     * @returns {string} APIキー / The API key.
     * @throws {Error} APIキーが設定されていない場合 / If the API key is not set.
     */
    static getApiKey(provider: string): string {
        let apiKey = "";

        switch (provider) {
            case AIProvider.OPENAI:
                apiKey = process.env.OPENAI_API_KEY || "";
                break;
            case AIProvider.GROQ:
                apiKey = process.env.GROQ_API_KEY || "";
                break;
            case AIProvider.CLAUDE:
                apiKey = process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY || "";
                break;
            case AIProvider.GEMINI:
            default:
                apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";
                break;
        }

        if (!apiKey) {
            throw new Error(TEXT.errors.noAiKeys);
        }

        return apiKey;
    }
}
