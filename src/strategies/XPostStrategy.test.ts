import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import { XPostStrategy } from './XPostStrategy.ts';
import { ObsidianService } from '../services/ObsidianService.ts';
import { XService } from '../services/XService.ts';
import { UserInteraction } from '../services/UserInteraction.ts';
import { PromptLoader } from '../core/PromptLoader.ts';
import { AppMode } from '../types/constants.ts';
import type { XPostCandidate, AIService, AIResponse } from '../types/interfaces.ts';

class MockObsidianService extends ObsidianService {
    constructor() { super('/tmp'); }
    appendCalled = false;
    readCalled = false;
    lastReadPath = "";
    
    // シグネチャ変更: mode -> header
    async appendAnalysisResult(relativePath: string, content: string, header: string) { 
        this.appendCalled = true;
    }
    
    async readContextNote(relativePath: string) { 
        this.readCalled = true;
        this.lastReadPath = relativePath;
        return "Content from Obsidian Note"; 
    }
    
    async appendNote() {}

    async createInitialLog(date: Date, mode: AppMode, inputData: string, relativePath: string): Promise<string> {
        return `/tmp/${relativePath}`;
    }
}

class MockAIService implements AIService {
    lastPrompt = "";
    mockResponseText = "";

    async generateContent(prompt: string): Promise<AIResponse> {
        this.lastPrompt = prompt;
        return { 
            text: this.mockResponseText || "Mock AI Response",
            usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 }
        };
    }
}

class MockXService extends XService {
    constructor() { super(); }
    async postTweet(content: string) {
        return { id: "12345", text: content };
    }
}

class MockUserInteraction extends UserInteraction {
    mockSelectedCandidateIndex = 0;
    mockConfirmResult = true;

    override isInteractive() { return true; }

    override async askSelect<T>(message: string, choices: { value: T }[]): Promise<T> {
        return choices[this.mockSelectedCandidateIndex].value;
    }

    override async askConfirm(message: string, defaultResponse: boolean): Promise<boolean> {
        return this.mockConfirmResult;
    }
}

class TestableXPostStrategy extends XPostStrategy {
    postTweetCalled = false;
    postedContent = "";

    constructor(mockUI: MockUserInteraction) {
        super();
        this.ui = mockUI;
    }

    protected override createXService(): XService {
        const mockService = new MockXService();
        mockService.postTweet = async (content: string) => {
            this.postTweetCalled = true;
            this.postedContent = content;
            return { id: "mock-id", text: content };
        };
        return mockService;
    }
}

describe('XPostStrategy', () => {
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;

    before(() => {
        console.log = () => {};
        console.error = () => {};
        console.warn = () => {};
        process.env.X_API_KEY = "dummy";
        process.env.X_API_SECRET = "dummy";
        process.env.X_ACCESS_TOKEN = "dummy";
        process.env.X_ACCESS_SECRET = "dummy";
    });

    after(() => {
        console.log = originalLog;
        console.error = originalError;
        console.warn = originalWarn;
    });

    it('should read from Obsidian, analyze with Gemini, and post to X', async () => {
        const mockUI = new MockUserInteraction();
        const strategy = new TestableXPostStrategy(mockUI);
        const mockObsidian = new MockObsidianService();
        const mockAIService = new MockAIService();
        
        const mockLoader = {
            load: async (name: string) => "default prompt"
        } as unknown as PromptLoader;

        const mockCandidates = [
            { content: "Post 1", hashtags: ["#tag1"] },
            { content: "Post 2", hashtags: ["#tag2"] }
        ];
        
        mockAIService.mockResponseText = JSON.stringify(mockCandidates);

        const fileInfo = { relativePath: "blog_post.md", fullPath: "/tmp/blog_post.md" };

        await strategy.execute(
            "Initial Input",
            mockObsidian, 
            mockAIService, 
            mockLoader,
            fileInfo,
            new Date()
        );

        assert.strictEqual(mockObsidian.readCalled, true, "Should read from Obsidian");
        assert.strictEqual(strategy.postTweetCalled, true, "Should post to X");
        assert.match(strategy.postedContent, /Post 1/, "Posted content should match selection");
    });
});
