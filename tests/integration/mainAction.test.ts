import { jest } from '@jest/globals';
import { mainAction } from '../../src/lib/mainAction';
import { AppMode } from '../../src/types/constants';
import { ObsidianService } from '../../src/services/ObsidianService';
import { AIOrchestratorService } from '../../src/services/AIOrchestratorService';
import { PromptSmith } from '../../src/core/PromptSmith';
import { ConfigService } from '../../src/services/ConfigService';

// ConfigService をモック化
jest.spyOn(ConfigService.prototype, 'vaultPath', 'get').mockReturnValue('/fake/vault');
jest.spyOn(ConfigService.prototype, 'language', 'get').mockReturnValue('ja');

// 他のServiceのメソッドをモック化
const createInitialLogSpy = jest.spyOn(ObsidianService.prototype, 'createInitialLog').mockResolvedValue('/fake/path/log.md');
const appendAnalysisResultSpy = jest.spyOn(ObsidianService.prototype, 'appendAnalysisResult').mockResolvedValue(undefined);

const mockGenerateContent = jest.fn().mockResolvedValue({ text: 'Mocked AI Response' });
const createAIServiceSpy = jest.spyOn(AIOrchestratorService.prototype, 'createAIService').mockReturnValue({
  generateContent: mockGenerateContent,
  generateContentStream: jest.fn() as any,
});
const addModelSpy = jest.spyOn(AIOrchestratorService.prototype, 'addModel').mockResolvedValue(undefined);
const inferProviderSpy = jest.spyOn(AIOrchestratorService.prototype, 'inferProvider').mockResolvedValue('openai');

const loadPromptSpy = jest.spyOn(PromptSmith.prototype, 'load').mockResolvedValue({
  content: 'This is a mock prompt.',
  aiProvider: 'openai',
  model: 'gpt-5.2',
});


describe('Integration Test: mainAction for "vf ai"', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // process.env の設定は不要になった
  });

  it('should run the general strategy and call appropriate services', async () => {
    const input = 'hello world';
    const options = {
      strategy: AppMode.GENERAL,
    };

    await mainAction(input, options);

    expect(createInitialLogSpy).toHaveBeenCalled();
    expect(loadPromptSpy).toHaveBeenCalledWith(AppMode.GENERAL);
    expect(createAIServiceSpy).toHaveBeenCalled();
    expect(mockGenerateContent).toHaveBeenCalled();
    expect(appendAnalysisResultSpy).toHaveBeenCalledWith(
      expect.any(String),
      'Mocked AI Response',
      expect.any(String)
    );
  });
});
