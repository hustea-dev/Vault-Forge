import { test, describe, it, mock } from 'node:test';
import assert from 'node:assert';
import { GeneralStrategy } from './GeneralStrategy.ts';
import { ObsidianService } from '../services/ObsidianService.ts';
import { PromptLoader } from '../core/PromptLoader.ts';
import type { AIService, AIResponse } from '../types/interfaces.ts';

class MockObsidianService extends ObsidianService {
    constructor() { super('/tmp'); }
    appendCalled = false;
    
    async appendAnalysisResult() { 
        this.appendCalled = true;
        return; 
    }
    async readContextNote() { return "mock content"; }
}

class MockAIService implements AIService {
    async generateContent(prompt: string): Promise<AIResponse> {
        return {
            text: "Mock AI Response",
            usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 }
        };
    }
}

describe('GeneralStrategy', () => {
    it('should execute analysis but NOT append to Obsidian', async () => {
        const strategy = new GeneralStrategy();
        const mockObsidian = new MockObsidianService();
        const mockAIService = new MockAIService();
        
        const mockLoader = {
            load: async (name: string, defaultPrompt: string) => defaultPrompt
        } as unknown as PromptLoader;

        const originalLog = console.log;
        console.log = () => {};

        try {
            const result = await strategy.execute(
                "test input",
                mockObsidian,
                mockAIService,
                mockLoader,
                { relativePath: "test.md", fullPath: "/tmp/test.md" }
            );

            assert.strictEqual(result.responseText, "Mock AI Response");

            assert.strictEqual(mockObsidian.appendCalled, false);
        } finally {
            console.log = originalLog;
        }
    });
});
