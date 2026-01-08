import * as path from 'path';
import * as fs from 'fs/promises';
import { AppMode, AIProvider } from '../types/constants.js';
import type { ModeStrategy, VaultForgeConfig, StrategyConstructor } from '../types/interfaces.js';
import { ObsidianService } from '../services/ObsidianService.js';
import { PromptSmith } from './PromptSmith.js';
import { DebugStrategy } from "../strategies/DebugStrategy.js";
import { GeneralStrategy } from "../strategies/GeneralStrategy.js";
import { XPostStrategy } from "../strategies/XPostStrategy.js";
import { DiaryStrategy } from "../strategies/DiaryStrategy.js";
import { InitStrategy } from "../strategies/InitStrategy.js";
import { TEXT } from '../config/text.js';
import { confirm, isCancel, cancel, intro, log, spinner } from '@clack/prompts';
import { AIOrchestratorService } from '../services/AIOrchestratorService.js';
import { ConfigService } from '../services/ConfigService.js';

const MODE_CONFIG: Record<AppMode, { Strategy: StrategyConstructor }> = {
    [AppMode.GENERAL]: { Strategy: GeneralStrategy },
    [AppMode.DEBUG]: { Strategy: DebugStrategy },
    [AppMode.X_POST]: { Strategy: XPostStrategy },
    [AppMode.DIARY]: { Strategy: DiaryStrategy },
    [AppMode.INIT]: { Strategy: InitStrategy },
};

export class VaultForge {
    private config: VaultForgeConfig;
    private obsidian: ObsidianService;
    private promptSmith: PromptSmith;
    private aiOrchestrator: AIOrchestratorService;
    private configService: ConfigService;

    constructor(config: VaultForgeConfig) {
        this.config = config;
        const vaultPath = config.vaultPath;

        this.configService = new ConfigService();
        const lang = this.configService.language;

        this.obsidian = new ObsidianService(vaultPath);
        this.promptSmith = new PromptSmith(this.obsidian, lang, this.configService);
        this.aiOrchestrator = new AIOrchestratorService(vaultPath, this.configService);
    }

    /**
     * 指定されたモードが detach (バックグラウンド実行) をサポートしているか判定する。
     * Determines if the specified mode supports detach (background execution).
     */
    static supportsDetach(mode: AppMode): boolean {
        const modeConfig = MODE_CONFIG[mode] || MODE_CONFIG[AppMode.GENERAL];
        return modeConfig.Strategy.supportsDetach;
    }

    async run() {

        const { inputData, mode, cliOptions } = this.config;
        const now = this.config.date || new Date();
        const modeConfig = MODE_CONFIG[mode] || MODE_CONFIG[AppMode.GENERAL];
        const strategy: ModeStrategy = new modeConfig.Strategy();

        if (this.configService.isDetachedMode && !modeConfig.Strategy.supportsDetach) {
             throw new Error(TEXT.errors.detachNotSupported.replace('{mode}', mode));
        }

        const dateStr = now.toISOString().split('T')[0] || 'unknown-date';
        const timeStr = now.toTimeString().split(' ')[0]?.replace(/:/g, '') || '000000';
        const relativePath = path.join('Inbox', mode, dateStr, `log_${timeStr}.md`);
        
        let resolvedOverrideModel = cliOptions?.model ? { provider: '', model: cliOptions.model } : undefined;
        
        if (mode !== AppMode.INIT && resolvedOverrideModel && !resolvedOverrideModel.provider) {
            const provider = await this.aiOrchestrator.inferProvider(resolvedOverrideModel.model);
            if (provider) {
                resolvedOverrideModel = { ...resolvedOverrideModel, provider };
            } else {
                console.error(TEXT.errors.modelNotFound.replace('{model}', resolvedOverrideModel.model));
                console.error(TEXT.errors.providerInferenceFailed);
                process.exit(1);
            }
        }

        const result = await strategy.execute(
            inputData,
            this.obsidian,
            this.promptSmith,
            this.aiOrchestrator,
            this.configService,
            { relativePath, fullPath: "" },
            now,
            this.config.instruction,
            resolvedOverrideModel,
            cliOptions
        );

        if (resolvedOverrideModel) {
            await this.aiOrchestrator.addModel(resolvedOverrideModel.provider, resolvedOverrideModel.model);
        }

        return result;
    }
}
