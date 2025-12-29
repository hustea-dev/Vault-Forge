import * as path from 'path';
import { AppMode } from '../types/constants.ts';
import type { ModeStrategy, VaultForgeConfig, AIService } from '../types/interfaces.ts';
import { ObsidianService } from '../services/ObsidianService.ts';
import { PromptLoader } from './PromptLoader.ts';
import { createNoteContent } from "../templates/obsidianNote.ts";
import { DebugStrategy } from "../strategies/DebugStrategy.ts";
import { GeneralStrategy } from "../strategies/GeneralStrategy.ts";
import { XPostStrategy } from "../strategies/XPostStrategy.ts";
import { TEXT } from '../config/text.ts';
import { AIServiceFactory } from '../services/ai/AIServiceFactory.ts';

const MODE_CONFIG = {
    [AppMode.X_POST]: { Strategy: XPostStrategy, saveInput: true },
    [AppMode.DEBUG]: { Strategy: DebugStrategy, saveInput: true },
    [AppMode.GENERAL]: { Strategy: GeneralStrategy, saveInput: false },
} as const;

export class VaultForge {
    private aiService: AIService;
    private config: VaultForgeConfig;
    private obsidian: ObsidianService;
    private promptLoader: PromptLoader;

    constructor(config: VaultForgeConfig) {
        this.config = config;
        this.aiService = AIServiceFactory.create(config.aiProvider, config.apiKey);
        this.obsidian = new ObsidianService(config.vaultPath);
        
        const lang = process.env.APP_LANG || 'ja';
        this.promptLoader = new PromptLoader(this.obsidian, lang);
    }

    async run() {
        const { inputData, mode } = this.config;
        const now = this.config.date || new Date();

        if (!inputData.trim()) {
            throw new Error(TEXT.errors.noInput);
        }

        const modeConfig = MODE_CONFIG[mode as AppMode] || MODE_CONFIG[AppMode.GENERAL];
        
        const strategy: ModeStrategy = new modeConfig.Strategy();
        const shouldSaveInput = modeConfig.saveInput;

        const dateStr = now.toISOString().split('T')[0] || 'unknown-date';
        const timeStr = now.toTimeString().split(' ')[0]?.replace(/:/g, '') || '000000';

        const relativePath = path.join('Inbox', dateStr, `log_${timeStr}.md`);
        let fullPath = "";

        if (shouldSaveInput) {
            const frontmatter = createNoteContent({
                date: now,
                mode: mode,
                inputData: inputData
            })

            fullPath = await this.obsidian.createNote(relativePath, frontmatter);
            console.log(`\n${TEXT.logs.obsidianSaved}: ${fullPath}`);
        }
        
        const result = await strategy.execute(
            inputData,
            this.obsidian,
            this.aiService,
            this.promptLoader,
            { relativePath, fullPath },
            this.config.instruction
        );
        
        return { filePath: fullPath, ...result };
    }
}
