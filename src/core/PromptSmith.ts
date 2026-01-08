import * as path from 'path';
import * as fs from 'fs/promises';
import matter from 'gray-matter';
import { z } from 'zod';
import { PromptFileSchema } from '../types/schemas.js';
import { DEFAULT_PROMPTS } from '../templates/defaultPrompt.js';
import { TEXT } from '../config/text.js';
import { ObsidianService } from '../services/ObsidianService.js';
import { ConfigService } from '../services/ConfigService.js';
import { select, text as clackText, isCancel, cancel } from '@clack/prompts';
import { AIProvider, AppMode } from '../types/constants.js';
import type { PromptData } from '../types/interfaces.js';
import { AIOrchestratorService } from '../services/AIOrchestratorService.js';

export const BACK_SIGNAL = Symbol('BACK');

export class PromptSmith {
    private obsidian: ObsidianService;
    private lang: string;
    private aiOrchestrator: AIOrchestratorService;
    private configService: ConfigService;

    constructor(obsidian: ObsidianService, lang: string, configService: ConfigService) {
        this.obsidian = obsidian;
        this.lang = lang;
        this.configService = configService;
        this.aiOrchestrator = new AIOrchestratorService(obsidian.getVaultPath(), this.configService);
    }

    // ============================================================
    // プロンプト管理機能 / Prompt Management
    // ============================================================

    async load(promptName: string): Promise<PromptData> {
        const relativePath = path.join('_AI_Prompts', 'prompts', this.lang, `${promptName}.md`);

        try {
            const fileContent = await this.obsidian.readNote(relativePath);
            const { content, data } = matter(fileContent);

            const validated = PromptFileSchema.parse({
                frontmatter: data,
                content: content.trim()
            });
            
            return {
                content: validated.content,
                aiProvider: validated.frontmatter?.aiProvider,
                model: validated.frontmatter?.model,
                outputMode: validated.frontmatter?.outputMode
            };

        } catch (error: any) {
            if (error.code === 'ENOENT') {
                const result = await this.create(promptName, false);
                if (result === BACK_SIGNAL) throw new Error(TEXT.errors.unexpectedBackSignal);
                
                const { content, data } = matter(result as string);
                return { content: content.trim(), ...data };
            }
            
            if (error instanceof z.ZodError) {
                const contentError = error.issues.find(issue =>
                    issue.path.includes('content') && issue.code === 'too_small'
                );

                if (contentError) {
                    const errorMessage = TEXT.loader.loadErrorDetail.replace('{filePath}', relativePath);
                    throw new Error(`${errorMessage}\n${TEXT.loader.reason}: ${TEXT.validation.promptTooShort}`);
                }
            }
            
            const errorMessage = TEXT.loader.loadErrorDetail.replace('{filePath}', relativePath);
            throw new Error(`${errorMessage}\n${TEXT.loader.reason}: ${error.message}`);
        }
    }

    async create(promptName: string, interactive: boolean): Promise<string | typeof BACK_SIGNAL> {
        const relativePath = path.join('_AI_Prompts', 'prompts', this.lang, `${promptName}.md`);
        let defaultContent = DEFAULT_PROMPTS[promptName];

        if (!defaultContent) {
            const errorMessage = TEXT.loader.noDefaultPrompt.replace('{promptName}', promptName);
            throw new Error(errorMessage);
        }

        if (interactive) {
            const result = await this.injectAIConfig(defaultContent, promptName);
            if (result === BACK_SIGNAL) return BACK_SIGNAL;
            defaultContent = result as string;
        }

        await this.obsidian.createNote(relativePath, defaultContent);
        
        const logMessage = TEXT.loader.createdDefaultFile.replace('{filePath}', relativePath);
        console.log(logMessage);

        return defaultContent;
    }

    async updateAI(promptName: string): Promise<void | typeof BACK_SIGNAL> {
        const relativePath = path.join('_AI_Prompts', 'prompts', this.lang, `${promptName}.md`);

        try {
            const fileContent = await this.obsidian.readNote(relativePath);
            const newContent = await this.injectAIConfig(fileContent, promptName);
            
            if (newContent === BACK_SIGNAL) return BACK_SIGNAL;

            await this.obsidian.createNote(relativePath, newContent as string);
            console.log(TEXT.ui.aiSettingsUpdatedFor.replace('{mode}', promptName));

        } catch (error: any) {
            if (error.code === 'ENOENT') {
                const result = await this.create(promptName, true);
                if (result === BACK_SIGNAL) return BACK_SIGNAL;
                return;
            } else {
                throw error;
            }
        }
    }

    // ============================================================
    // AIモデル管理機能 / AI Model Management (Delegated to AIOrchestratorService)
    // ============================================================

    async initializeModels(): Promise<boolean> {
        return await this.aiOrchestrator.initialize();
    }

    async getModels(provider: string): Promise<string[]> {
        return await this.aiOrchestrator.getModels(provider);
    }

    async addModel(provider: string, model: string): Promise<void> {
        return await this.aiOrchestrator.addModel(provider, model);
    }

    async removeModel(provider: string, model: string): Promise<void> {
        return await this.aiOrchestrator.removeModel(provider, model);
    }

    async resolveProvider(modelName: string): Promise<string | null> {
        return await this.aiOrchestrator.inferProvider(modelName);
    }

    // ============================================================
    // 内部ヘルパーメソッド / Internal Helper Methods
    // ============================================================

    private async injectAIConfig(fileContent: string, promptName: string): Promise<string | typeof BACK_SIGNAL> {
        const availableProviders = this.configService.getAvailableProviders();

        if (availableProviders.length > 0) {
            const options = availableProviders.map(p => ({ value: p, label: p })) as any[];
            options.push({ value: 'BACK', label: TEXT.ui.backOption });

            const selectedProvider = await select({
                message: TEXT.ui.selectAIForMode.replace('{mode}', promptName),
                options: options,
            });

            if (isCancel(selectedProvider)) {
                cancel(TEXT.ui.operationCancelled);
                process.exit(0);
            }

            if (selectedProvider === 'BACK') {
                return BACK_SIGNAL;
            }

            const provider = selectedProvider as string;
            const models = await this.getModels(provider);
            
            const modelOptions = models.map(m => ({ value: m, label: m })) as any[];
            modelOptions.push({ value: 'CUSTOM', label: TEXT.ui.customModelOption });

            const selectedModel = await select({
                message: TEXT.ui.selectModel,
                options: modelOptions,
            });

            if (isCancel(selectedModel)) {
                cancel(TEXT.ui.operationCancelled);
                process.exit(0);
            }

            let model = selectedModel as string;
            if (selectedModel === 'CUSTOM') {
                const customModel = await clackText({
                    message: TEXT.ui.enterCustomModel,
                    placeholder: TEXT.ui.customModelPlaceholder,
                });

                if (isCancel(customModel)) {
                    cancel(TEXT.ui.operationCancelled);
                    process.exit(0);
                }
                model = customModel as string;
                
                await this.addModel(provider, model);
            }

            const outputModeOptions = [
                { value: 'normal', label: TEXT.ui.outputModeNormal },
                { value: 'stream', label: TEXT.ui.outputModeStream },
            ];

            if (promptName !== AppMode.GENERAL) {
                outputModeOptions.push({ value: 'background', label: TEXT.ui.outputModeBackground });
            }

            const selectedOutputMode = await select({
                message: TEXT.ui.selectOutputMode.replace('{mode}', promptName),
                options: outputModeOptions,
                initialValue: 'normal',
            });

            if (isCancel(selectedOutputMode)) {
                cancel(TEXT.ui.operationCancelled);
                process.exit(0);
            }
            
            const { data: frontmatter, content } = matter(fileContent);
            
            const existingTags = frontmatter.tags || [];
            const providerModels = await this.getModels(provider);
            const newTags = Array.from(new Set([...existingTags, selectedProvider, model, ...providerModels]));

            const newFrontmatter = {
                ...frontmatter,
                aiProvider: selectedProvider,
                model: model,
                outputMode: selectedOutputMode,
                tags: newTags
            };
            
            return matter.stringify(content, newFrontmatter);
        }
        
        return fileContent;
    }
}
