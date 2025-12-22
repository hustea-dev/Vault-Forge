import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import { XPostStrategy } from './XPostStrategy.ts';
import { ObsidianService } from '../core/ObsidianService.ts';
import { XService } from '../core/XService.ts';
import type { XPostCandidate } from '../types/interfaces.ts';
import { AppMode } from '../types/constants.ts';

// モック用のクラス定義
class MockObsidianService extends ObsidianService {
    constructor() { super('/tmp'); }
    appendCalled = false;
    readCalled = false;
    lastReadPath = "";
    
    async appendAnalysisResult() { 
        this.appendCalled = true;
    }
    
    // コンテキスト読み込みのモック
    async readContextNote(relativePath: string) { 
        this.readCalled = true;
        this.lastReadPath = relativePath;
        return "Content from Obsidian Note"; 
    }
    
    async appendNote() {}
}

class MockGenAI {
    lastPrompt = "";
    async generateContent(params: any) {
        // プロンプトの内容を保存して後で検証できるようにする
        this.lastPrompt = params.contents[0].parts[0].text;
        return { text: "Mock AI Response" };
    }
    models = { generateContent: this.generateContent.bind(this) }
}

class MockXService extends XService {
    constructor() { 
        super();
    }
    async postTweet(content: string) {
        return { id: "12345", text: content };
    }
}

// テスト対象のクラスを継承して、対話部分をモック化
class TestableXPostStrategy extends XPostStrategy {
    mockSelectedCandidateIndex = 0;
    mockConfirmResult = true;
    postTweetCalled = false;
    postedContent = "";

    protected override async selectPostCandidate(candidates: XPostCandidate[]): Promise<XPostCandidate> {
        return candidates[this.mockSelectedCandidateIndex]!;
    }

    protected override async confirmPost(): Promise<boolean> {
        return this.mockConfirmResult;
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
        Object.defineProperty(process.stdin, 'isTTY', { value: true, configurable: true });
    });

    after(() => {
        console.log = originalLog;
        console.error = originalError;
        console.warn = originalWarn;
    });

    it('should read from Obsidian, analyze with Gemini, and post to X', async () => {
        const strategy = new TestableXPostStrategy();
        const mockObsidian = new MockObsidianService();
        const mockGenAI = new MockGenAI() as any;

        const mockCandidates = [
            { content: "Post 1", hashtags: ["#tag1"] },
            { content: "Post 2", hashtags: ["#tag2"] }
        ];
        
        mockGenAI.models.generateContent = async (params: any) => {
            mockGenAI.lastPrompt = params.contents[0].parts[0].text;
            return { text: JSON.stringify(mockCandidates) };
        };

        const fileInfo = { relativePath: "blog_post.md", fullPath: "/tmp/blog_post.md" };

        await strategy.execute(
            "Initial Input (Ignored in XPost)", // XPostではこれは使わず、Obsidianから読み込むはず
            mockObsidian, 
            mockGenAI, 
            fileInfo
        );

        assert.strictEqual(mockObsidian.readCalled, true, "Should read from Obsidian");
        assert.strictEqual(mockObsidian.lastReadPath, "blog_post.md");

        assert.match(mockGenAI.lastPrompt, /Content from Obsidian Note/, "Prompt should contain content read from Obsidian");

        assert.strictEqual(strategy.postTweetCalled, true, "Should post to X");
        assert.match(strategy.postedContent, /Post 1/, "Posted content should match selection");
    });
});
