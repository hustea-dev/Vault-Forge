import * as path from 'path';
import { GoogleGenAI } from "@google/genai";
import { AppMode } from '../types/constants.ts';
import type { ModeStrategy, ObsidAXConfig } from '../types/interfaces.ts';
import { ObsidianService } from './ObsidianService.ts';
import { createNoteContent } from "../templates/obsidianNote.ts";
import { DebugStrategy } from "../strategies/DebugStrategy.ts";
import { GeneralStrategy } from "../strategies/GeneralStrategy.ts";
import { XPostStrategy } from "../strategies/XPostStrategy.ts";
import { TEXT } from '../config/text.ts';

const MODE_CONFIG = {
    [AppMode.X_POST]: { Strategy: XPostStrategy, saveInput: true },
    [AppMode.DEBUG]: { Strategy: DebugStrategy, saveInput: true },
    [AppMode.GENERAL]: { Strategy: GeneralStrategy, saveInput: false },
} as const;

export class ObsidAX {
    private genAI: GoogleGenAI;
    private config: ObsidAXConfig;
    private obsidian: ObsidianService;

    constructor(config: ObsidAXConfig) {
        this.config = config;
        this.genAI = new GoogleGenAI({ apiKey: config.apiKey });
        this.obsidian = new ObsidianService(config.vaultPath);
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
            this.genAI,
            { relativePath, fullPath },
            this.config.instruction
        );
        
        return { filePath: fullPath, ...result };
    }
}
