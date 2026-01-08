import { ObsidianService } from '../services/ObsidianService.js';
import { TEXT } from '../config/text.js';
import { AppMode } from '../types/constants.js';
import { BaseStrategy } from './BaseStrategy.js';
import { XService } from '../services/XService.js';
import type { XPostCandidate } from '../types/interfaces.js';
import { PromptSmith } from '../core/PromptSmith.js';
import { AIOrchestratorService } from '../services/AIOrchestratorService.js';
import { ConfigService } from '../services/ConfigService.js';

export class XPostStrategy extends BaseStrategy {
    protected mode = AppMode.X_POST;
    protected saveInput = true;
    protected shouldProcessResult = true;
    static readonly supportsDetach = true;

    protected override async prepareContext(
        inputData: string, 
        obsidian: ObsidianService, 
        fileInfo: { relativePath: string; fullPath: string }
    ): Promise<string> {
        return await obsidian.readContextNote(fileInfo.relativePath);
    }

    protected override async handleResult(
        responseText: string,
        obsidian: ObsidianService,
        fileInfo: { relativePath: string; fullPath: string },
        promptSmith?: PromptSmith,
        aiOrchestrator?: AIOrchestratorService,
        configService?: ConfigService,
        instruction?: string,
        overrideModel?: { provider: string; model: string }
    ): Promise<void> {
        
        if (!promptSmith || !aiOrchestrator || !configService) {
            throw new Error(TEXT.errors.missingServices);
        }

        const header = `${TEXT.markdown.xPostHeader} (${this.mode})`;
        await obsidian.appendAnalysisResult(fileInfo.relativePath, responseText, header);

        const promptData = await this.getPromptData(promptSmith);
        
        const isPiped = !process.stdin.isTTY;

        if (configService.isDetachedMode || promptData.outputMode === 'background' || isPiped) {
            return;
        }

        if (!this.ui.isInteractive()) {
            await this.ui.warn(TEXT.errors.notTTY);
            return;
        }

        let currentResponseText = responseText;

        while (true) {
            const candidates = await this.parseCandidates(currentResponseText);
            if (!candidates) {
                return;
            }

            await this.ui.info(`\n${TEXT.logs.xPostStart}`);

            type ChoiceValue = 
                | { type: 'post'; data: XPostCandidate }
                | { type: 'retry'; data: null }
                | { type: 'save_exit'; data: null };

            const choices: { name: string; value: ChoiceValue; label?: string }[] = candidates.map((c, index) => ({
                name: `${index + 1}. ${c.content.substring(0, 50)}... (${c.hashtags.join(' ')})`,
                value: { type: 'post', data: c },
                label: c.content
            }));

            choices.push({
                name: TEXT.ui.retryOption,
                value: { type: 'retry', data: null },
                label: TEXT.ui.retryDesc
            });

            choices.push({
                name: TEXT.ui.saveExitOption,
                value: { type: 'save_exit', data: null },
                label: TEXT.ui.saveExitDesc
            });

            const selected = await this.ui.askSelect(TEXT.ui.selectPost, choices);

            if (selected.type === 'retry') {
                await this.ui.info(TEXT.logs.xPostRetry);
                
                const context = await this.prepareContext("", obsidian, fileInfo);
                const newPromptData = await this.getPromptData(promptSmith);
                const aiProvider = overrideModel?.provider || newPromptData.aiProvider || 'gemini';
                const model = overrideModel?.model || newPromptData.model;
                const aiService = aiOrchestrator.createAIService(aiProvider, model);
                const effectivePromptData = { ...newPromptData, aiProvider, model };
                
                currentResponseText = await this.analyze(context, aiService, effectivePromptData, aiProvider, obsidian, instruction);

                await obsidian.appendAnalysisResult(fileInfo.relativePath, currentResponseText, header);
                continue;
            }

            if (selected.type === 'save_exit') {
                await this.ui.info(TEXT.logs.xPostSaveExit);
                return;
            }

            if (selected.type === 'post' && selected.data) {
                await this.handlePost(selected.data, obsidian, fileInfo);
                return;
            }
        }
    }

    private async parseCandidates(responseText: string): Promise<XPostCandidate[] | null> {
        let candidates: XPostCandidate[] = [];
        try {
            const cleanJson = responseText.replace(/```json\n?|\n?```/g, '').trim();
            candidates = JSON.parse(cleanJson);
        } catch (e) {
            await this.ui.error(TEXT.errors.jsonParseFailed);
            return null;
        }

        if (!Array.isArray(candidates) || candidates.length === 0) {
            await this.ui.error(TEXT.errors.noCandidates);
            return null;
        }
        return candidates;
    }

    private async handlePost(
        candidate: XPostCandidate, 
        obsidian: ObsidianService, 
        fileInfo: { relativePath: string; fullPath: string }
    ) {
        const fullPostContent = `${candidate.content}\n\n${candidate.hashtags.join(" ")}`;

        await this.ui.info(`\n${TEXT.logs.xPostSelected}`);
        await this.ui.info("--------------------------------------------------");
        await this.ui.info(fullPostContent);
        await this.ui.info("--------------------------------------------------");

        const isConfirmed = await this.ui.askConfirm(TEXT.ui.confirmPost, false);

        if (isConfirmed) {
            try {
                const xService = this.createXService();
                const result = await xService.postTweet(fullPostContent);
                
                await this.ui.info(`\n${TEXT.logs.xPostSuccess} (ID: ${result.id})`);
                
                await obsidian.appendNote(fileInfo.relativePath, `\n\n${TEXT.markdown.xPostSuccessHeader}\nTweet ID: ${result.id}\n\n${fullPostContent}\n`);
            } catch (e: any) {
                await this.ui.error(`\n${TEXT.errors.xPostFailed} ${e.message}`);
                await obsidian.appendNote(fileInfo.relativePath, `\n\n${TEXT.markdown.xPostFailHeader}\nError: ${e.message}\n`);
            }
        } else {
            await this.ui.info(`\n${TEXT.logs.xPostCancel}`);
        }
    }

    protected createXService(): XService {
        return new XService();
    }
}
