import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { AIProvider } from '../types/constants.js';
import type { AIService } from '../types/interfaces.js';
import { TEXT } from '../config/text.js';
import { GeminiService } from './ai/GeminiService.js';
import { OpenAIService } from './ai/OpenAIService.js';
import { GroqService } from './ai/GroqService.js';
import { ClaudeService } from './ai/ClaudeService.js';
import { MockAIService } from './ai/MockAIService.js';
import { ConfigService } from './ConfigService.js';

/**
 * AI関連の責務（モデル管理、プロバイダー推測、サービス生成）を統括するクラス。
 * This class orchestrates AI-related responsibilities, including model management, provider inference, and service creation.
 */
export class AIOrchestratorService {
    private modelsPath: string;
    private templatePath: string;
    private configService: ConfigService;

    constructor(vaultPath: string, configService: ConfigService) {
        this.modelsPath = path.join(vaultPath, '_AI_Prompts', 'ai-models.json');
        this.configService = configService;
        
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        this.templatePath = path.join(__dirname, '../config/ai-models.json');
    }

    /**
     * `ai-models.json` ファイルを初期化する。ファイルが存在しない場合、テンプレートから作成する。
     * Initializes the `ai-models.json` file. If the file does not exist, it is created from a template.
     * @returns {Promise<boolean>} 新規にファイルが作成された場合はtrueを返す / Returns true if a new file was created.
     */
    async initialize(): Promise<boolean> {
        try {
            await fs.access(this.modelsPath);
            return false;
        } catch (e) {
            await this.loadAllModels();
            return true;
        }
    }

    /**
     * 指定されたプロバイダーのモデルリストを取得する。
     * Gets the list of models for the specified provider.
     * @param {string} provider - AIプロバイダー名 / The name of the AI provider.
     * @returns {Promise<string[]>} モデル名の配列 / An array of model names.
     */
    async getModels(provider: string): Promise<string[]> {
        const allModels = await this.loadAllModels();
        const models = allModels[provider] || [];
        return models.filter(model => model !== '');
    }

    /**
     * 新しいモデルを `ai-models.json` に追加する。
     * Adds a new model to `ai-models.json`.
     * @param {string} provider - AIプロバイダー名 / The name of the AI provider.
     * @param {string} model - 追加するモデル名 / The name of the model to add.
     */
    async addModel(provider: string, model: string): Promise<void> {
        const allModels = await this.loadAllModels();
        
        if (!allModels[provider]) {
            allModels[provider] = [];
        }

        if (!allModels[provider].includes(model)) {
            allModels[provider].push(model);
            await this.saveAllModels(allModels);
        }
    }

    /**
     * モデルを `ai-models.json` から削除する。
     * Removes a model from `ai-models.json`.
     * @param {string} provider - AIプロバイダー名 / The name of the AI provider.
     * @param {string} model - 削除するモデル名 / The name of the model to remove.
     */
    async removeModel(provider: string, model: string): Promise<void> {
        const allModels = await this.loadAllModels();
        
        if (allModels[provider]) {
            const index = allModels[provider].indexOf(model);
            if (index > -1) {
                allModels[provider].splice(index, 1);
                await this.saveAllModels(allModels);
            }
        }
    }

    /**
     * モデル名からプロバイダーを推測する。
     * Infers the provider from the model name.
     * @param {string} modelName - モデル名 / The model name.
     * @returns {Promise<string | null>} 推測されたプロバイダー名、またはnull / The inferred provider name, or null.
     */
    async inferProvider(modelName: string): Promise<string | null> {
        if (this.configService.isTestEnv) {
            return 'mock';
        }

        const allModels = await this.loadAllModels();

        for (const [provider, models] of Object.entries(allModels)) {
            if (Array.isArray(models) && models.includes(modelName)) {
                return provider;
            }
        }

        const lowerName = modelName.toLowerCase();
        if (lowerName.startsWith('gpt')) return AIProvider.OPENAI;
        if (lowerName.startsWith('gemini')) return AIProvider.GEMINI;
        if (lowerName.startsWith('claude')) return AIProvider.CLAUDE;
        if (lowerName.startsWith('llama') || lowerName.startsWith('mixtral') || lowerName.startsWith('gemma')) return AIProvider.GROQ;

        return null;
    }

    private async loadAllModels(): Promise<Record<string, string[]>> {
        try {
            const data = await fs.readFile(this.modelsPath, 'utf-8');
            return JSON.parse(data);
        } catch (e) {
            try {
                const templateData = await fs.readFile(this.templatePath, 'utf-8');
                const models = JSON.parse(templateData);
                await this.saveAllModels(models);
                return models;
            } catch (templateError) {
                return {};
            }
        }
    }

    private async saveAllModels(models: Record<string, string[]>): Promise<void> {
        const dirPath = path.dirname(this.modelsPath);
        await fs.mkdir(dirPath, { recursive: true });
        await fs.writeFile(this.modelsPath, JSON.stringify(models, null, 2), 'utf-8');
    }

    /**
     * 指定されたプロバイダーとモデルに対応するAIServiceインスタンスを生成する。
     * Creates an AIService instance for the specified provider and model.
     * @param {string} provider - AIプロバイダー名 / The name of the AI provider.
     * @param {string} [model] - モデル名 / The model name.
     * @returns {AIService} AIServiceのインスタンス / An instance of AIService.
     */
    createAIService(provider: string, model?: string): AIService {
        if (this.configService.isTestEnv) {
            return new MockAIService();
        }

        if (!model) {
            throw new Error(TEXT.errors.modelNotSpecified.replace('{provider}', provider));
        }

        const apiKey = this.configService.getApiKey(provider);

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
}
