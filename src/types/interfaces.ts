import { AppMode } from './constants.js';
import { ObsidianService } from '../services/ObsidianService.js';
import { PromptSmith } from '../core/PromptSmith.js';
import { AIOrchestratorService } from '../services/AIOrchestratorService.js';
import { ConfigService } from '../services/ConfigService.js';

export interface VaultForgeConfig {
    vaultPath: string;
    inputData: string;
    mode: AppMode;
    instruction?: string;
    date?: Date;
    cliOptions?: Record<string, any>;
    isPiped?: boolean;
}

export interface ModeStrategy {
    execute(
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
    ): Promise<any>;
}

export type StrategyConstructor = {
    new (): ModeStrategy;
    readonly supportsDetach: boolean;
};

export interface AIService {
    generateContent(prompt: string): Promise<AIResponse>;
    generateContentStream(prompt: string): AsyncGenerator<string, AIResponse, unknown>;
}

export interface AIResponse {
    text: string;
    usage?: TokenUsage;
}

export interface TokenUsage {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
}

export interface PromptData {
    content: string;
    aiProvider?: string;
    model?: string;
    outputMode?: 'normal' | 'stream' | 'background';
}

export interface XPostCandidate {
    content: string;
    hashtags: string[];
}

export interface NoteData {
    date: Date;
    mode: AppMode;
    inputData: string;
}
