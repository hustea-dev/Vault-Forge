import * as fs from 'fs/promises';
import * as path from 'path';
import { TEXT } from '../config/text.js';
import { AppMode } from '../types/constants.js';
import { createNoteContent } from '../templates/obsidianNote.js';
import { createTokenUsageTemplate, type TokenLog, type DailyStat } from '../templates/tokenUsage.js';
import { createDailyNoteTemplate } from '../templates/dailyNote.js';
import type { TokenUsage } from '../types/interfaces.js';
import { TagService } from './TagService.js';
import { UserInteraction } from './UserInteraction.js';
import { ConfigService } from './ConfigService.js';
import { exec, spawn } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export class ObsidianService {
    private vaultPath: string;
    private tagService: TagService;
    private ui: UserInteraction;
    private configService: ConfigService;

    constructor(vaultPath: string) {
        this.vaultPath = vaultPath;
        this.tagService = new TagService(vaultPath);
        this.ui = new UserInteraction();
        this.configService = new ConfigService();
    }

    /**
     * Vaultのルートパスを取得する
     * Gets the root path of the Vault.
     */
    getVaultPath(): string {
        return this.vaultPath;
    }

    // ============================================================
    // High-Level APIs (Business Logic)
    // ============================================================

    /**
     * ログファイルの初期作成を行う高レベルAPI
     * High-level API for creating initial log files.
     * @param date 作成日時 / Creation date
     * @param mode アプリケーションモード / Application mode
     * @param inputData 入力データ / Input data
     * @param relativePath 保存先の相対パス / Relative path to save
     * @returns 作成されたファイルの絶対パス / Absolute path of the created file
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
        await this.ui.info(`\n${TEXT.logs.obsidianSaved}: ${fullPath}`);
        return fullPath;
    }

    /**
     * AI解析結果をフォーマットして追記する
     * Formats and appends AI analysis results.
     * @param relativePath 対象ファイルの相対パス / Relative path of the target file
     * @param responseText AIからの応答テキスト / Response text from AI
     * @param header セクションヘッダー / Section header
     */
    async appendAnalysisResult(relativePath: string, responseText: string, header: string): Promise<void> {
        const analysisSection = `\n${header}\n${responseText}\n`;
        await this.appendNote(relativePath, analysisSection);
        
        await this.ui.info(`\n${TEXT.logs.fileRecorded}: ${relativePath}`);
    }

    /**
     * トークン使用量を記録する
     * Records token usage.
     * @param mode 使用モード / Usage mode
     * @param provider AIプロバイダー / AI provider
     * @param model AIモデル / AI model
     * @param usage トークン使用量データ / Token usage data
     */
    async recordTokenUsage(
        mode: string,
        provider: string,
        model: string,
        usage: TokenUsage
    ): Promise<void> {
        const now = new Date();
        const offset = now.getTimezoneOffset() * 60000;
        const localDate = new Date(now.getTime() - offset);
        
        const yearMonth = localDate.toISOString().slice(0, 7);
        const dateStr = localDate.toISOString().slice(0, 10);
        const timeStr = now.toTimeString().slice(0, 8);

        const relativePath = path.join('_AI_Prompts', 'TokenUsage', provider, `${yearMonth}.md`);
        const fullPath = path.join(this.vaultPath, relativePath);

        const newLog: TokenLog = {
            date: dateStr,
            time: timeStr,
            mode,
            model,
            input: usage.promptTokens,
            output: usage.completionTokens,
            total: usage.totalTokens,
        };

        let existingLogs: TokenLog[] = [];

        try {
            const fileContent = await fs.readFile(fullPath, 'utf-8');
            const logTableMatch = fileContent.match(/\| Date \| Time \|(.|\n)*$/);
            if (logTableMatch) {
                const rows = logTableMatch[0].split('\n').slice(2);
                existingLogs = rows.map(row => {
                    const cells = row.split('|').map(cell => cell.trim());
                    if (cells.length < 8) return null;
                    return {
                        date: cells[1],
                        time: cells[2],
                        mode: cells[3],
                        model: cells[4],
                        input: parseInt(cells[5] || "0", 10) || 0,
                        output: parseInt(cells[6] || "0", 10) || 0,
                        total: parseInt(cells[7] || "0", 10) || 0,
                    };
                }).filter((log): log is TokenLog => log !== null);
            }
        } catch (e) {
        }

        const allLogs = [...existingLogs, newLog];

        const dailyStatsMap = new Map<string, DailyStat>();
        for (const log of allLogs) {
            const stat = dailyStatsMap.get(log.date) || { date: log.date, input: 0, output: 0 };
            stat.input += log.input;
            stat.output += log.output;
            dailyStatsMap.set(log.date, stat);
        }
        const dailyStats = Array.from(dailyStatsMap.values());

        const newContent = createTokenUsageTemplate(provider, yearMonth, dailyStats, allLogs);

        const dirPath = path.dirname(fullPath);
        await fs.mkdir(dirPath, { recursive: true });
        await fs.writeFile(fullPath, newContent, 'utf-8');
    }

    /**
     * Daily Noteに追記する
     * Appends content to the Daily Note.
     * @param content 追記する内容 / Content to append
     * @param tags 関連タグ / Related tags
     * @param isHeader 見出しとして追加するかどうか / Whether to add as a header
     * @returns 更新されたファイルのフルパス / Full path of the updated file
     */
    async appendToDailyNote(content: string, tags: string[], isHeader: boolean = false): Promise<string> {
        const now = new Date();
        const offset = now.getTimezoneOffset() * 60000;
        const localDate = new Date(now.getTime() - offset);
        const dateStr = localDate.toISOString().slice(0, 10);
        const timeStr = now.toTimeString().slice(0, 5);
        const relativePath = path.join('Daily', `${dateStr}.md`);
        const fullPath = path.join(this.vaultPath, relativePath);

        let fileContent = "";
        try {
            fileContent = await fs.readFile(fullPath, 'utf-8');
        } catch (e) {
            fileContent = createDailyNoteTemplate(dateStr);
        }

        const contentWithUpdatedTags = this.tagService.updateFrontmatterTags(fileContent, tags);
        
        let logEntry = "";
        if (isHeader) {
            logEntry = `\n\n${content}\n(${timeStr})`;
        } else {
            logEntry = `\n- **${timeStr}** ${content}`;
        }

        const finalContent = contentWithUpdatedTags + logEntry;
        const dirPath = path.dirname(fullPath);

        await fs.mkdir(dirPath, { recursive: true });
        await fs.writeFile(fullPath, finalContent, 'utf-8');
        
        await this.ui.info(`\n${TEXT.logs.obsidianSaved}: ${relativePath}`);
        return fullPath;
    }

    // ============================================================
    // Basic File Operations (Low-Level APIs)
    // ============================================================

    /**
     * 新しいノートを作成する (基本操作)
     * Creates a new note (basic operation).
     * @param relativePath 作成するファイルの相対パス / Relative path of the file to create
     * @param content ファイルの内容 / File content
     * @returns 作成されたファイルの絶対パス / Absolute path of the created file
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
     * Reads the content of a note (basic operation).
     * @param relativePath 読み込むファイルの相対パス / Relative path of the file to read
     * @returns ファイルの内容 / File content
     */
    async readNote(relativePath: string): Promise<string> {
        const fullPath = path.join(this.vaultPath, relativePath);
        return await fs.readFile(fullPath, 'utf-8');
    }

    /**
     * コンテキストとしてノートを読み込む（ログ出力付き）
     * Reads a note as context (with log output).
     * @param relativePath 読み込むファイルの相対パス / Relative path of the file to read
     * @returns ファイルの内容 / File content
     */
    async readContextNote(relativePath: string): Promise<string> {
        await this.ui.info(`${TEXT.logs.readingFromObsidian}: ${relativePath}`);
        return await this.readNote(relativePath);
    }

    /**
     * ノートに追記する (基本操作)
     * Appends content to a note (basic operation).
     * @param relativePath 対象ファイルの相対パス / Relative path of the target file
     * @param content 追記する内容 / Content to append
     */
    async appendNote(relativePath: string, content: string): Promise<void> {
        const fullPath = path.join(this.vaultPath, relativePath);
        await fs.appendFile(fullPath, content, 'utf-8');
    }

    /**
     * ノートを削除する (基本操作)
     * Deletes a note (basic operation).
     * @param relativePath 削除するファイルの相対パス / Relative path of the file to delete
     */
    async deleteNote(relativePath: string): Promise<void> {
        const fullPath = path.join(this.vaultPath, relativePath);
        await fs.unlink(fullPath);
    }

    // ============================================================
    // External Tools Integration
    // ============================================================

    /**
     * 指定されたファイルを環境変数EDITORで開く
     * Opens the specified file with the EDITOR environment variable.
     */
    async openFileInEditor(filePath: string): Promise<void> {
        const editor = this.configService.editor;
        if (!editor) {
            throw new Error(TEXT.errors.editorNotSet);
        }

        const child = spawn(editor, [filePath], {
            stdio: 'inherit'
        });

        return new Promise<void>((resolve, reject) => {
            child.on('exit', (code) => {
                if (code === 0) resolve();
                else reject(new Error(TEXT.errors.editorExitError.replace('{code}', (code ?? 'unknown').toString())));
            });
            child.on('error', reject);
        });
    }

    /**
     * 指定されたファイルをObsidianで開く
     * Opens the specified file in Obsidian.
     * @param filePath 開くファイルのパス / Path of the file to open
     */
    async openFileInObsidian(filePath: string): Promise<void> {
        const vaultName = path.basename(this.vaultPath);
        const relativePath = filePath.replace(this.vaultPath + '/', '');
        const encodedFile = encodeURIComponent(relativePath);
        const uri = `obsidian://open?vault=${vaultName}&file=${encodedFile}`;

        const openCommand = process.platform === 'darwin' ? 'open'
            : (process.platform === 'win32' ? 'start' : 'xdg-open');
        await execAsync(`${openCommand} "${uri}"`);
    }
}
