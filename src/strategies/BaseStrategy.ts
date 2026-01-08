import { ObsidianService } from '../services/ObsidianService.js';
import { UserInteraction } from '../services/UserInteraction.js';
import { PromptSmith } from '../core/PromptSmith.js';
import type { ModeStrategy, AIService, PromptData } from '../types/interfaces.js';
import { AppMode } from '../types/constants.js';
import { TEXT } from '../config/text.js';
import { AIOrchestratorService } from '../services/AIOrchestratorService.js';
import { ConfigService } from '../services/ConfigService.js';

export abstract class BaseStrategy implements ModeStrategy {
    protected abstract mode: AppMode;
    protected abstract saveInput: boolean;
    protected abstract shouldProcessResult: boolean;
    
    static readonly supportsDetach: boolean;

    protected ui: UserInteraction;

    constructor() {
        this.ui = new UserInteraction();
    }

    async execute(
        inputData: string,
        obsidian: ObsidianService,
        promptSmith: PromptSmith,
        aiOrchestrator: AIOrchestratorService,
        configService: ConfigService, 
        fileInfo: { relativePath: string; fullPath: string },
        date: Date,
        instruction?: string,
        overrideModel?: { provider: string; model: string },
        cliOptions?: Record<string, any>
    ): Promise<any> {
        
        if (this.saveInput) {
            fileInfo.fullPath = await obsidian.createInitialLog(
                date,
                this.mode,
                inputData,
                fileInfo.relativePath
            );
        }

        const context = await this.prepareContext(inputData, obsidian, fileInfo);
        const promptData = await this.getPromptData(promptSmith);
        
        if (cliOptions?.stream) {
            promptData.outputMode = 'stream';
        } else if (cliOptions?.normal) {
            promptData.outputMode = 'normal';
        }

        if (configService.isDetachedMode) {
            promptData.outputMode = 'normal';
        }

        const aiProvider = overrideModel?.provider || promptData.aiProvider || 'gemini';
        const model = overrideModel?.model || promptData.model;
        const aiService = aiOrchestrator.createAIService(aiProvider, model);
        const effectivePromptData = { ...promptData, aiProvider, model };

        const responseText = await this.analyze(context, aiService, effectivePromptData, aiProvider, obsidian, instruction);

        if (this.shouldProcessResult) {
            await this.handleResult(
                responseText, 
                obsidian, 
                fileInfo,
                promptSmith,
                aiOrchestrator,
                configService,
                instruction,
                overrideModel
            );
        }
        
        return { responseText };
    }

    protected async prepareContext(
        inputData: string, 
        obsidian: ObsidianService, 
        fileInfo: { relativePath: string; fullPath: string }
    ): Promise<string> {
        return inputData;
    }

    protected async getPromptData(promptSmith: PromptSmith): Promise<PromptData> {
        try {
            return await promptSmith.load(this.mode);
        } catch (e: any) {
            await this.ui.warn(TEXT.loader.loadError);
            await this.ui.warn(`${TEXT.loader.reason}: ${e.message}`);

            await this.ui.error(TEXT.loader.aborting);
            process.exit(1);
        }
    }

    protected async analyze(
        context: string, 
        aiService: AIService, 
        promptData: PromptData, 
        aiProvider: string, 
        obsidian: ObsidianService, 
        instruction?: string
    ): Promise<string> {
        if (this.mode === AppMode.GENERAL && promptData.outputMode === 'background') {
            throw new Error(TEXT.errors.generalBackgroundNotSupported);
        }

        const analyzingMsg = TEXT.logs.aiAnalyzing.replace('{provider}', aiProvider);
        await this.ui.info(`${analyzingMsg} (${this.mode} ${TEXT.logs.modeSuffix})...`);

        let promptText = `${promptData.content}\n\n`;
        
        if (instruction) {
            promptText += `${TEXT.labels.additionalInstruction}:\n${instruction}\n\n`;
        }

        promptText += `${TEXT.labels.targetData}:\n${context}`;

        try {
            if (process.env.NODE_ENV !== 'test') {
                console.log(`\n${TEXT.logs.analysisResult}:`);
            }

            if (promptData.outputMode === 'stream') {
                const stream = aiService.generateContentStream(promptText);
                let fullText = "";

                for await (const chunk of stream) {
                    process.stdout.write(chunk);
                    fullText += chunk;
                }
                
                if (process.env.NODE_ENV !== 'test') {
                    console.log('\n');
                }

                const usage = {
                    promptTokens: 0,
                    completionTokens: fullText.length,
                    totalTokens: fullText.length
                };

                await obsidian.recordTokenUsage(
                    this.mode,
                    aiProvider,
                    promptData.model || 'unknown',
                    usage
                );
                
                return fullText;

            } else {
                const result = await aiService.generateContent(promptText);
                const responseText = result.text || TEXT.errors.analysisFailed;

                console.log(responseText);
                
                if (result.usage) {
                    const logMessage = TEXT.logs.tokenUsage
                        .replace('{input}', result.usage.promptTokens.toString())
                        .replace('{output}', result.usage.completionTokens.toString())
                        .replace('{total}', result.usage.totalTokens.toString());
                    await this.ui.info(`\n${logMessage}`);

                    await obsidian.recordTokenUsage(
                        this.mode,
                        aiProvider,
                        promptData.model || 'unknown',
                        result.usage
                    );
                }

                return responseText;
            }

        } catch (error: any) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            await this.ui.error(`${TEXT.errors.aiApi} ${errorMessage}`);
            throw error;
        }
    }

    protected async handleResult(
        responseText: string, 
        obsidian: ObsidianService, 
        fileInfo: { relativePath: string; fullPath: string },
        promptSmith?: PromptSmith,
        aiOrchestrator?: AIOrchestratorService,
        configService?: ConfigService,
        instruction?: string,
        overrideModel?: { provider: string; model: string }
    ): Promise<void> {
    }
}
