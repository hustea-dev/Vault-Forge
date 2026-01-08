import { jest } from '@jest/globals';
import * as path from 'path';
import { AIProvider } from '../../src/types/constants';

// 1. モックを定義
jest.unstable_mockModule('fs/promises', () => ({
  access: jest.fn(),
  readFile: jest.fn(),
  writeFile: jest.fn(),
  mkdir: jest.fn(),
}));

// ConfigService をモック化
const mockGetApiKey = jest.fn();
const mockIsTestEnv = jest.fn().mockReturnValue(false); // デフォルトはfalseにしておく

jest.unstable_mockModule('../../src/services/ConfigService', () => ({
  ConfigService: jest.fn().mockImplementation(() => ({
    getApiKey: mockGetApiKey,
    get isTestEnv() { return mockIsTestEnv(); }
  })),
}));

// 2. モックされたモジュールをインポート
const { access, readFile, writeFile, mkdir } = await import('fs/promises');
const mockedFs = { access, readFile, writeFile, mkdir };

// 3. テスト対象のモジュールを動的にインポート
const { AIOrchestratorService } = await import('../../src/services/AIOrchestratorService');
const { GeminiService } = await import('../../src/services/ai/GeminiService');
const { OpenAIService } = await import('../../src/services/ai/OpenAIService');
const { ConfigService } = await import('../../src/services/ConfigService');

describe('AIOrchestratorService', () => {
  const vaultPath = '/fake/vault';
  let orchestrator: InstanceType<typeof AIOrchestratorService>;
  let configService: InstanceType<typeof ConfigService>;

  beforeEach(() => {
    jest.clearAllMocks();
    configService = new ConfigService();
    orchestrator = new AIOrchestratorService(vaultPath, configService);
    
    // ConfigService のモック設定
    mockGetApiKey.mockReturnValue('fake-api-key');
    mockIsTestEnv.mockReturnValue(false);
  });

  describe('initialize', () => {
    it('should create ai-models.json if it does not exist', async () => {
      (mockedFs.access as jest.Mock).mockRejectedValue(new Error('ENOENT'));
      
      (mockedFs.readFile as jest.Mock)
        .mockRejectedValueOnce(new Error('ENOENT'))
        .mockResolvedValueOnce(JSON.stringify({ openai: ['gpt-5.2'] }));

      const result = await orchestrator.initialize();

      expect(result).toBe(true);
      expect(mockedFs.writeFile).toHaveBeenCalled();
    });

    it('should not create file if it exists', async () => {
      (mockedFs.access as jest.Mock).mockResolvedValue(undefined);

      const result = await orchestrator.initialize();

      expect(result).toBe(false);
      expect(mockedFs.writeFile).not.toHaveBeenCalled();
    });
  });

  describe('getModels', () => {
    it('should return models for a provider', async () => {
      const mockData = { openai: ['gpt-5.2', 'gpt-5.2-pro'] };
      (mockedFs.readFile as jest.Mock).mockResolvedValue(JSON.stringify(mockData));

      const models = await orchestrator.getModels('openai');

      expect(models).toEqual(['gpt-5.2', 'gpt-5.2-pro']);
    });
  });

  describe('addModel', () => {
    it('should add a new model and save', async () => {
      const mockData = { openai: ['gpt-5.2'] };
      (mockedFs.readFile as jest.Mock).mockResolvedValue(JSON.stringify(mockData));

      await orchestrator.addModel('openai', 'gpt-5-nano');

      expect(mockedFs.writeFile).toHaveBeenCalled();
      const writtenData = JSON.parse((mockedFs.writeFile as jest.Mock).mock.calls[0][1] as string);
      expect(writtenData.openai).toContain('gpt-5-nano');
    });
  });

  describe('inferProvider', () => {
    it('should infer provider from known models', async () => {
      const mockData = { openai: ['gpt-5.2'], gemini: ['gemini-2.0-flash'] };
      (mockedFs.readFile as jest.Mock).mockResolvedValue(JSON.stringify(mockData));

      expect(await orchestrator.inferProvider('gpt-5.2')).toBe('openai');
      expect(await orchestrator.inferProvider('gemini-2.0-flash')).toBe('gemini');
    });

    it('should return "mock" if isTestEnv is true', async () => {
        mockIsTestEnv.mockReturnValue(true);
        expect(await orchestrator.inferProvider('any-model')).toBe('mock');
    });
  });

  describe('createAIService', () => {
    it('should create OpenAIService for openai provider', () => {
      const service = orchestrator.createAIService(AIProvider.OPENAI, 'gpt-5.2');
      expect(service).toBeInstanceOf(OpenAIService);
      expect(mockGetApiKey).toHaveBeenCalledWith(AIProvider.OPENAI);
    });

    it('should create GeminiService for gemini provider', () => {
      const service = orchestrator.createAIService(AIProvider.GEMINI, 'gemini-2.0-flash');
      expect(service).toBeInstanceOf(GeminiService);
      expect(mockGetApiKey).toHaveBeenCalledWith(AIProvider.GEMINI);
    });

    it('should return MockAIService if isTestEnv is true', () => {
        mockIsTestEnv.mockReturnValue(true);
        const service = orchestrator.createAIService(AIProvider.OPENAI, 'gpt-5.2');
        // MockAIService の型チェックは難しいので、クラス名などで判断するか、
        // 単にエラーにならないことを確認する
        expect(service.constructor.name).toBe('MockAIService');
    });
  });
});
