import type {AIService} from '../../types/interfaces.ts';
import { GeminiService } from './GeminiService.ts';
import { AIProvider } from '../../types/constants.ts';

export class AIServiceFactory {
    /**
     * 環境変数からAIプロバイダーとAPIキーを解決する
     */
    static resolveConfig() {
        const aiProvider = (process.env.AI_PROVIDER || AIProvider.GEMINI).toLowerCase();
        let apiKey = "";

        switch (aiProvider) {
            case AIProvider.OPENAI:
                apiKey = process.env.OPENAI_API_KEY || "";
                break;
            case AIProvider.GEMINI:
            default:
                apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";
                break;
        }

        if (!apiKey) {
            throw new Error(`Error: API key for provider '${aiProvider}' is not set.`);
        }
        return { aiProvider, apiKey };
    }

    /**
     * 設定に基づいてAIサービスのインスタンスを生成する
     */
    static create(provider: string, apiKey: string): AIService {
        switch (provider.toLowerCase()) {
            case AIProvider.OPENAI:
                throw new Error("OpenAI provider is not yet implemented.");
            case AIProvider.GEMINI:
            default:
                return new GeminiService(apiKey);
        }
    }
}
