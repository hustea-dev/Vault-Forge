import { AppMode } from './constants.ts';
import { ObsidianService } from '../services/ObsidianService.ts';
import { PromptLoader } from '../core/PromptLoader.ts';
// import {AIService} from './interfaces.ts';

export interface VaultForgeConfig {
    apiKey: string;
    vaultPath: string;
    inputData: string;
    mode: AppMode;
    date?: Date;
    instruction?: string;
    filePath?: string;
    aiProvider?: string;
}

export interface TokenUsage {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
}

export interface AIResponse {
    text: string;
    usage?: TokenUsage;
}

export interface AIService {
    generateContent(prompt: string): Promise<AIResponse>;
}

export interface ModeStrategy {
    execute(
        inputData: string,
        obsidian: ObsidianService,
        aiService: AIService,
        promptLoader: PromptLoader,
        fileInfo: { relativePath: string; fullPath: string },
        date: Date,
        instruction?: string
    ): Promise<any>;
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
