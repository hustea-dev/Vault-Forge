import { ObsidianService } from '../services/ObsidianService.js';
import { TEXT } from '../config/text.js';
import { AppMode } from '../types/constants.js';
import { BaseStrategy } from './BaseStrategy.js';
import { PromptSmith, BACK_SIGNAL } from '../core/PromptSmith.js';
import { AIOrchestratorService } from '../services/AIOrchestratorService.js';
import { ConfigService } from '../services/ConfigService.js';
import { confirm, isCancel, cancel, intro, log, spinner } from '@clack/prompts';
import * as path from 'path';
import * as fs from 'fs/promises';

export class InitStrategy extends BaseStrategy {
    protected mode = AppMode.INIT;
    protected saveInput = false;
    protected shouldProcessResult = false;
    static readonly supportsDetach = false;

    override async execute(
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
        
        console.log('\n');
        intro(TEXT.ui.initWelcome);

        let vaultPath = "";
        try {
            vaultPath = configService.vaultPath;
        } catch (e) {
            cancel(TEXT.errors.vaultPathNotSet);
            return process.exit(1);
        }

        const lang = configService.language;
        
        const availableProviders = configService.getAvailableProviders();

        if (availableProviders.length === 0) {
            cancel(TEXT.errors.noAiKeys);
            return process.exit(1);
        }

        const settings = [
            `${TEXT.ui.initVaultPath}: ${vaultPath}`,
            `${TEXT.ui.initLanguage}: ${lang}`,
            `${TEXT.ui.initAvailableAI}: ${availableProviders.join(', ')}`
        ].join('\n');
        
        log.info(`${TEXT.ui.initCurrentSettings}:\n${settings}`);

        const shouldContinue = await confirm({
            message: TEXT.ui.initConfirm,
        });

        if (isCancel(shouldContinue) || !shouldContinue) {
            cancel(TEXT.ui.initCancelled);
            return process.exit(0);
        }

        const modesToSetup = [AppMode.GENERAL, AppMode.DEBUG, AppMode.X_POST];

        const shouldInitializePrompts = await confirm({
            message: TEXT.ui.initResetPrompts,
        });

        if (isCancel(shouldInitializePrompts)) {
            cancel(TEXT.ui.initCancelled);
            return process.exit(0);
        }

        if (shouldInitializePrompts) {
            const s = spinner();
            s.start(TEXT.ui.initGeneratingFiles);
            
            let i = 0;
            while (i < modesToSetup.length) {
                const mode = modesToSetup[i]!;
                const result = await promptSmith.create(mode, true);
                if (result === BACK_SIGNAL) {
                    if (i > 0) {
                        i--; 
                    } else {
                        cancel(TEXT.ui.operationCancelled);
                        process.exit(0);
                    }
                } else {
                    i++;
                }
            }
            s.stop(TEXT.ui.initPromptsGenerated);
        } else {
            const shouldUpdateAI = await confirm({
                message: TEXT.ui.initUpdateAI,
            });

            if (isCancel(shouldUpdateAI)) {
                cancel(TEXT.ui.initCancelled);
                return process.exit(0);
            }

            if (shouldUpdateAI) {
                let i = 0;
                while (i < modesToSetup.length) {
                    const mode = modesToSetup[i]!;
                    const result = await promptSmith.updateAI(mode);
                    if (result === BACK_SIGNAL) {
                        if (i > 0) {
                            i--;
                        } else {
                            cancel(TEXT.ui.operationCancelled);
                            process.exit(0);
                        }
                    } else {
                        i++;
                    }
                }
                log.success(TEXT.ui.initAIUpdated);
            }
        }
        
        const tokenUsageDir = path.join(vaultPath, '_AI_Prompts', 'TokenUsage');
        try {
            await fs.mkdir(tokenUsageDir, { recursive: true });
            log.success(`${TEXT.ui.initTokenDirCreated}: ${tokenUsageDir}`);
        } catch (e: any) {
            if (e.code !== 'EEXIST') {
                cancel(`${TEXT.ui.initTokenDirFailed} ${e.message}`);
            }
        }

        const modelsCreated = await aiOrchestrator.initialize();
        if (modelsCreated) {
            log.success(TEXT.ui.aiModelsJsonCreated);
        }

        return { responseText: TEXT.ui.initCompleted };
    }
}
