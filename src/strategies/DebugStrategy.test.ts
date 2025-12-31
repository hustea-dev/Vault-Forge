import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import { DebugStrategy } from './DebugStrategy.ts';
import { ObsidianService } from '../services/ObsidianService.ts';
import { PromptLoader } from '../core/PromptLoader.ts';
import { AppMode } from '../types/constants.ts';
import type { AIService, AIResponse } from '../types/interfaces.ts';

// モックの定義
class MockObsidianService extends ObsidianService {
    constructor() { super('/tmp'); }
    
    appendCalled = false;
    lastAppendPath = "";
    lastAppendContent = "";
    lastAppendHeader = "";
    
    // シグネチャ変更: mode -> header
    async appendAnalysisResult(relativePath: string, content: string, header: string) { 
        this.appendCalled = true;
        this.lastAppendPath = relativePath;
        this.lastAppendContent = content;
        this.lastAppendHeader = header;
        return; 
    }
    
    async createInitialLog(date: Date, mode: AppMode, inputData: string, relativePath: string): Promise<string> {
        return `/tmp/${relativePath}`;
    }
}

class MockAIService implements AIService {
    async generateContent(prompt: string): Promise<AIResponse> {
        return {
            text: "Debug Analysis Result",
            usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 }
        };
    }
}

describe('DebugStrategy', () => {
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;

    before(() => {
        console.log = () => {};
        console.error = () => {};
        console.warn = () => {};
    });

    after(() => {
        console.log = originalLog;
        console.error = originalError;
        console.warn = originalWarn;
    });

    it('should execute analysis AND append to Obsidian', async () => {
        const strategy = new DebugStrategy();
        const mockObsidian = new MockObsidianService();
        const mockAIService = new MockAIService();
        
        const mockLoader = {
            load: async (name: string) => "default prompt"
        } as unknown as PromptLoader;

        const inputData = "Error log content";
        const fileInfo = { relativePath: "debug_log.md", fullPath: "/tmp/debug_log.md" };

        const result = await strategy.execute(
            inputData,
            mockObsidian,
            mockAIService,
            mockLoader,
            fileInfo,
            new Date()
        );

        assert.strictEqual(result.responseText, "Debug Analysis Result");
        assert.strictEqual(mockObsidian.appendCalled, true, "Should call appendAnalysisResult");
        assert.strictEqual(mockObsidian.lastAppendPath, fileInfo.relativePath);
        // ヘッダーが含まれているかチェック
        assert.ok(mockObsidian.lastAppendHeader.includes("Gemini 解析結果"), "Header should contain analysis title");
        assert.ok(mockObsidian.lastAppendHeader.includes(AppMode.DEBUG), "Header should contain mode name");
        assert.strictEqual(mockObsidian.lastAppendContent, "Debug Analysis Result");
    });
});
