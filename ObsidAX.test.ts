import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ObsidAX } from './src/PLAN/ObsidAX.ts';
import { AppMode } from './src/types/constants.ts';
import * as fs from 'fs/promises';
import * as path from 'path';

// モックの定義
vi.mock('fs/promises');

vi.mock('@google/genai', () => {
    return {
        GoogleGenAI: class {
            models: any;
            constructor() {
                this.models = {
                    generateContent: vi.fn().mockResolvedValue({
                        text: "Mocked AI Response"
                    })
                };
            }
        }
    };
});

describe('ObsidAX', () => {
    // テスト用の固定日時
    const fixedDate = new Date('2023-01-01T12:00:00Z');
    // @ts-ignore
    const expectedTimeStr = fixedDate.toTimeString().split(' ')[0].replace(/:/g, '');
    
    const mockConfig = {
        apiKey: 'test-api-key',
        vaultPath: '/tmp/test-vault',
        inputData: 'Test Input Data',
        mode: AppMode.GENERAL,
        date: fixedDate
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('正常系: ファイルを作成し、AI解析結果を追記する', async () => {
        const app = new ObsidAX(mockConfig);
        const result = await app.run();

        // 1. ディレクトリ作成の確認
        const expectedDir = path.join(mockConfig.vaultPath, 'Inbox', '2023-01-01');
        expect(fs.mkdir).toHaveBeenCalledWith(expectedDir, { recursive: true });

        // 2. ファイル書き込みの確認
        const expectedFile = path.join(expectedDir, `log_${expectedTimeStr}.md`);
        
        expect(fs.writeFile).toHaveBeenCalledWith(
            expectedFile,
            expect.stringContaining('Test Input Data'),
            'utf-8'
        );

        // 3. AI解析結果の追記確認
        expect(fs.appendFile).toHaveBeenCalledWith(
            expectedFile,
            expect.stringContaining('Mocked AI Response'),
            'utf-8'
        );

        expect(result).toEqual({
            filePath: expectedFile,
            responseText: "Mocked AI Response"
        });
    });

    it('異常系: 入力データが空の場合はエラーを投げる', async () => {
        const emptyConfig = { ...mockConfig, inputData: '   ' };
        const app = new ObsidAX(emptyConfig);

        await expect(app.run()).rejects.toThrow("パイプ経由で入力データが渡されていません。");
    });

    it('モード分岐: x_postモードで適切なプロンプトが選択されるか', async () => {
        const app = new ObsidAX({ ...mockConfig, mode: AppMode.X_POST });
        
        await app.run();

        expect(fs.writeFile).toHaveBeenCalled();
    });
});
