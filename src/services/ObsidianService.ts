import * as fs from 'fs/promises';
import * as path from 'path';
import { TEXT } from '../config/text.ts';
import { AppMode } from '../types/constants.ts';
import { createNoteContent } from '../templates/obsidianNote.ts';

export class ObsidianService {
    private vaultPath: string;

    constructor(vaultPath: string) {
        this.vaultPath = vaultPath;
    }

    /**
     * ログファイルの初期作成を行う高レベルAPI
     */
    async createInitialLog(
        date: Date,
        mode: AppMode,
        inputData: string,
        relativePath: string
    ): Promise<string> {
        const frontmatter = createNoteContent({
            date: date,
            mode: mode,
            inputData: inputData
        });

        const fullPath = await this.createNote(relativePath, frontmatter);
        console.log(`\n${TEXT.logs.obsidianSaved}: ${fullPath}`);
        return fullPath;
    }

    /**
     * 新しいノートを作成する (基本操作)
     */
    async createNote(relativePath: string, content: string): Promise<string> {
        const fullPath = path.join(this.vaultPath, relativePath);
        const dirPath = path.dirname(fullPath);

        await fs.mkdir(dirPath, { recursive: true });

        await fs.writeFile(fullPath, content, 'utf-8');
        return fullPath;
    }

    /**
     * ノートの内容を読み込む (基本操作)
     */
    async readNote(relativePath: string): Promise<string> {
        const fullPath = path.join(this.vaultPath, relativePath);
        return await fs.readFile(fullPath, 'utf-8');
    }

    /**
     * コンテキストとしてノートを読み込む（ログ出力付き）
     */
    async readContextNote(relativePath: string): Promise<string> {
        console.log(`${TEXT.logs.readingFromObsidian}: ${relativePath}`);
        return await this.readNote(relativePath);
    }

    /**
     * ノートに追記する (基本操作)
     */
    async appendNote(relativePath: string, content: string): Promise<void> {
        const fullPath = path.join(this.vaultPath, relativePath);
        await fs.appendFile(fullPath, content, 'utf-8');
    }

    /**
     * ノートを削除する (基本操作)
     */
    async deleteNote(relativePath: string): Promise<void> {
        const fullPath = path.join(this.vaultPath, relativePath);
        await fs.unlink(fullPath);
    }

    /**
     * AI解析結果をフォーマットして追記する
     */
    async appendAnalysisResult(relativePath: string, responseText: string, header: string): Promise<void> {
        const analysisSection = `\n${header}\n${responseText}\n`;
        await this.appendNote(relativePath, analysisSection);
        
        console.log(`\n${TEXT.logs.fileRecorded}: ${relativePath}`);
    }
}
