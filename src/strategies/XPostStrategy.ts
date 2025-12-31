import { ObsidianService } from '../services/ObsidianService.ts';
import { TEXT } from '../config/text.ts';
import { AppMode } from '../types/constants.ts';
import { BaseStrategy } from './BaseStrategy.ts';
import { XService } from '../services/XService.ts';
import type { XPostCandidate, AIService } from '../types/interfaces.ts';
import { PromptLoader } from '../core/PromptLoader.ts';

export class XPostStrategy extends BaseStrategy {
    protected mode = AppMode.X_POST;
    protected saveInput = true;

    protected override async prepareContext(
        inputData: string, 
        obsidian: ObsidianService, 
        fileInfo: { relativePath: string; fullPath: string }
    ): Promise<string> {
        return await obsidian.readContextNote(fileInfo.relativePath);
    }

    override async execute(
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
        let prompt = await this.getPrompt(promptLoader);
        
        while (true) {
            const responseText = await this.analyze(context, aiService, prompt, instruction);
            
            const header = `${TEXT.markdown.xPostHeader} (${this.mode})`;
            await obsidian.appendAnalysisResult(fileInfo.relativePath, responseText, header);

            if (!this.ui.isInteractive()) {
                 console.warn(TEXT.errors.notTTY);
                 return { responseText };
            }

            const candidates = this.parseCandidates(responseText);
            if (!candidates) {
                return { responseText };
            }

            console.log(`\n${TEXT.logs.xPostStart}`);

            type ChoiceValue = 
                | { type: 'post'; data: XPostCandidate }
                | { type: 'retry'; data: null }
                | { type: 'save_exit'; data: null };

            const choices: { name: string; value: ChoiceValue; description?: string }[] = candidates.map((c, index) => ({
                name: `${index + 1}. ${c.content.substring(0, 50)}... (${c.hashtags.join(' ')})`,
                value: { type: 'post', data: c },
                description: c.content
            }));

            choices.push({
                name: TEXT.ui.retryOption,
                value: { type: 'retry', data: null },
                description: TEXT.ui.retryDesc
            });

            choices.push({
                name: TEXT.ui.saveExitOption,
                value: { type: 'save_exit', data: null },
                description: TEXT.ui.saveExitDesc
            });

            const selected = await this.ui.askSelect(TEXT.ui.selectPost, choices);

            if (selected.type === 'retry') {
                console.log(TEXT.logs.xPostRetry);
                continue;
            }

            if (selected.type === 'save_exit') {
                console.log(TEXT.logs.xPostSaveExit);
                return { responseText };
            }

            if (selected.type === 'post' && selected.data) {
                await this.handlePost(selected.data, obsidian, fileInfo);
                return { responseText };
            }
        }
    }

    private parseCandidates(responseText: string): XPostCandidate[] | null {
        let candidates: XPostCandidate[] = [];
        try {
            const cleanJson = responseText.replace(/```json\n?|\n?```/g, '').trim();
            candidates = JSON.parse(cleanJson);
        } catch (e) {
            console.error(TEXT.errors.jsonParseFailed);
            return null;
        }

        if (!Array.isArray(candidates) || candidates.length === 0) {
            console.error(TEXT.errors.noCandidates);
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

        console.log(`\n${TEXT.logs.xPostSelected}`);
        console.log("--------------------------------------------------");
        console.log(fullPostContent);
        console.log("--------------------------------------------------");

        const isConfirmed = await this.ui.askConfirm(TEXT.ui.confirmPost, false);

        if (isConfirmed) {
            try {
                const xService = this.createXService();
                const result = await xService.postTweet(fullPostContent);
                
                console.log(`\n${TEXT.logs.xPostSuccess} (ID: ${result.id})`);
                
                await obsidian.appendNote(fileInfo.relativePath, `\n\n${TEXT.markdown.xPostSuccessHeader}\nTweet ID: ${result.id}\n\n${fullPostContent}\n`);
            } catch (e: any) {
                console.error(`\n${TEXT.errors.xPostFailed} ${e.message}`);
                await obsidian.appendNote(fileInfo.relativePath, `\n\n${TEXT.markdown.xPostFailHeader}\nError: ${e.message}\n`);
            }
        } else {
            console.log(`\n${TEXT.logs.xPostCancel}`);
        }
    }

    protected createXService(): XService {
        return new XService();
    }
}
