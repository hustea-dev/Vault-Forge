import { ObsidianService } from '../services/ObsidianService.ts';
import { UserInteraction } from '../services/UserInteraction.ts';
import { PromptLoader } from '../core/PromptLoader.ts';
import type { ModeStrategy, AIService } from '../types/interfaces.ts';
import { AppMode } from '../types/constants.ts';
import { TEXT } from '../config/text.ts';

export abstract class BaseStrategy implements ModeStrategy {
    protected abstract mode: AppMode;
    protected abstract saveInput: boolean;
    protected ui: UserInteraction;

    constructor() {
        this.ui = new UserInteraction();
    }

    async execute(
        inputData: string,
        obsidian: ObsidianService,
        aiService: AIService,
        promptLoader: PromptLoader,
        fileInfo: { relativePath: string; fullPath: string },
        date: Date,
        instruction?: string
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
        const prompt = await this.getPrompt(promptLoader);
        const responseText = await this.analyze(context, aiService, prompt, instruction);

        await this.processResult(responseText, obsidian, fileInfo);
        return { responseText };
    }

    protected async prepareContext(
        inputData: string, 
        obsidian: ObsidianService, 
        fileInfo: { relativePath: string; fullPath: string }
    ): Promise<string> {
        return inputData;
    }

    protected async getPrompt(loader: PromptLoader): Promise<string> {
        try {
            return await loader.load(this.mode);
        } catch (e: any) {
            this.ui.warn(TEXT.loader.loadError);
            this.ui.warn(`${TEXT.loader.reason}: ${e.message}`);

            this.ui.error(TEXT.loader.aborting);
            process.exit(1);
        }
    }

    protected async analyze(context: string, aiService: AIService, prompt: string, instruction?: string): Promise<string> {
        console.log(`${TEXT.logs.geminiAnalyzing} (${this.mode} ${TEXT.logs.modeSuffix})...`);

        let promptText = `${prompt}\n\n`;
        
        if (instruction) {
            promptText += `${TEXT.labels.additionalInstruction}:\n${instruction}\n\n`;
        }

        promptText += `${TEXT.labels.targetData}:\n${context}`;

        try {
            const result = await aiService.generateContent(promptText);
            const responseText = result.text || TEXT.errors.analysisFailed;

            console.log(`\n${TEXT.logs.analysisResult}:\n${responseText}`);
            
            if (result.usage) {
                const logMessage = TEXT.logs.tokenUsage
                    .replace('{input}', result.usage.promptTokens.toString())
                    .replace('{output}', result.usage.completionTokens.toString())
                    .replace('{total}', result.usage.totalTokens.toString());
                console.log(`\n${logMessage}`);
            }

            return responseText;

        } catch (error) {
            console.error(TEXT.errors.geminiApi, error);
            throw error;
        }
    }

    protected async processResult(
        responseText: string, 
        obsidian: ObsidianService, 
        fileInfo: { relativePath: string; fullPath: string }
    ): Promise<void> {
    }
}
