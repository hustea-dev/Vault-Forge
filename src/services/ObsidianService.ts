import * as fs from 'fs/promises';
import * as path from 'path';
import { TEXT } from '../config/text.ts';
import { AppMode } from '../types/constants.ts';

export class ObsidianService {
    private vaultPath: string;

    constructor(vaultPath: string) {
        this.vaultPath = vaultPath;
    }

    /**
     * 新しいノートを作成する (Create)
     * @param relativePath Vaultルートからの相対パス (例: "Inbox/2023-10-27/log.md")
     * @param content 書き込む内容
     */
    async createNote(relativePath: string, content: string): Promise<string> {
        const fullPath = path.join(this.vaultPath, relativePath);
        const dirPath = path.dirname(fullPath);

        await fs.mkdir(dirPath, { recursive: true });

        await fs.writeFile(fullPath, content, 'utf-8');
        return fullPath;
    }

    /**
     * ノートの内容を読み込む (Read)
     * @param relativePath Vaultルートからの相対パス
     */
    async readNote(relativePath: string): Promise<string> {
        const fullPath = path.join(this.vaultPath, relativePath);
        return await fs.readFile(fullPath, 'utf-8');
    }

    /**
     * コンテキストとしてノートを読み込む（ログ出力付き）
     * @param relativePath Vaultルートからの相対パス
     */
    async readContextNote(relativePath: string): Promise<string> {
        console.log(`${TEXT.logs.readingFromObsidian}: ${relativePath}`);
        return await this.readNote(relativePath);
    }

    /**
     * ノートに追記する (Update/Append)
     * @param relativePath Vaultルートからの相対パス
     * @param content 追記する内容
     */
    async appendNote(relativePath: string, content: string): Promise<void> {
        const fullPath = path.join(this.vaultPath, relativePath);
        await fs.appendFile(fullPath, content, 'utf-8');
    }

    /**
     * ノートを削除する (Delete)
     * @param relativePath Vaultルートからの相対パス
     */
    async deleteNote(relativePath: string): Promise<void> {
        const fullPath = path.join(this.vaultPath, relativePath);
        await fs.unlink(fullPath);
    }

    /**
     * AI解析結果をフォーマットして追記する
     * @param relativePath Vaultルートからの相対パス
     * @param responseText AIからの応答テキスト
     * @param mode 実行モード
     */
    async appendAnalysisResult(relativePath: string, responseText: string, mode: AppMode): Promise<void> {
        const header = mode === AppMode.X_POST
            ? TEXT.markdown.xPostHeader 
            : TEXT.markdown.analysisHeader;

        const analysisSection = `\n${header} (${mode})\n${responseText}\n`;
        await this.appendNote(relativePath, analysisSection);
        
        console.log(`\n${TEXT.logs.fileRecorded}: ${relativePath}`);
    }
}
