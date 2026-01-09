import { Command } from 'commander';
import tabtab from 'tabtab';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { AppMode } from '../types/constants.js';
import { TEXT } from '../config/text.js';
import { ConfigService } from '../services/ConfigService.js';

/**
 * タグのリストを取得する（#を付けない）。
 * Retrieves a list of tags (without the # prefix).
 * @returns {string[]} タグの配列 / Array of tags.
 */
export const getTags = (): string[] => {
    try {
        const config = new ConfigService();
        const vaultPath = config.vaultPath;
        const candidates: string[] = [];
        
        const tagsPath = path.join(vaultPath, '_AI_Prompts', 'tags.json');
        if (fs.existsSync(tagsPath)) {
            const tags = JSON.parse(fs.readFileSync(tagsPath, 'utf-8'));
            if (Array.isArray(tags)) candidates.push(...tags); 
        }
        return candidates;
    } catch (e) { return []; }
};

/**
 * モデルのリストを取得する。
 * Retrieves a list of AI models.
 * @returns {string[]} モデル名の配列 / Array of model names.
 */
export const getModels = (): string[] => {
    try {
        const config = new ConfigService();
        const vaultPath = config.vaultPath;
        const candidates: string[] = [];

        const modelsPath = path.join(vaultPath, '_AI_Prompts', 'ai-models.json');
        if (fs.existsSync(modelsPath)) {
            const modelsData = JSON.parse(fs.readFileSync(modelsPath, 'utf-8'));
            Object.values(modelsData).forEach((models: any) => {
                if (Array.isArray(models)) candidates.push(...models);
            });
        }
        return candidates;
    } catch (e) { return []; }
};

/**
 * 従来の getCandidates (互換性のため)。
 * Legacy getCandidates (for compatibility).
 * @returns {string[]} タグとモデルの結合リスト / Combined list of tags and models.
 */
export const getCandidates = (): string[] => {
    return [...getTags(), ...getModels()];
};

/**
 * 補完ロジックのセットアップ。
 * 補完リクエストを処理した場合は true を返す。
 * Sets up the completion logic.
 * Returns true if a completion request was handled.
 * @returns {boolean} 処理されたかどうか / Whether it was handled.
 */
export const setupCompletion = (): boolean => {
    if (process.env.NODE_ENV === 'test') {
        return false;
    }

    const env = tabtab.parseEnv(process.env);
    if (!env.complete) return false;

    // vf <TAB>
    if (env.words === 1) {
        tabtab.log(['ai', 'diary', 'search', 'tag', 'init', 'completion']);
        return true;
    }

    const prev = env.prev;
    const line = env.line;

    // vf ai -m <TAB>
    if (prev === '-m' || prev === '--model') {
        tabtab.log(getModels());
        return true;
    }

    // vf ai -p <TAB>
    if (prev === '-p' || prev === '--preset') {
        const strategies = Object.values(AppMode).filter(mode => mode !== AppMode.DIARY);
        tabtab.log(strategies);
        return true;
    }

    // vf ai -f <TAB>
    if (prev === '-f' || prev === '--file') {
        try {
            const files = fs.readdirSync(process.cwd());
            tabtab.log(files);
        } catch (e) {}
        return true;
    }

    // vf ai <TAB>
    if (['ai', 'diary', 'search', 'tag'].some(cmd => line.includes(`vf ${cmd}`))) {
        const options = [
            '-m', '--model',
            '-p', '--preset',
            '-i', '--instruction',
            '-d', '--detach',
            '-f', '--file',
            '-t', '--task'
        ];
        
        tabtab.log([...getTags(), ...options]);
        return true;
    }

    return false;
};

/**
 * Commander コマンド定義。
 * Commander command definition.
 * @param {Command} program - Commander プログラムインスタンス / Commander program instance.
 */
export function registerCompletionCommand(program: Command) {
    program.command('completion')
        .description(TEXT.commands.completion.description)
        .action(async () => {
            console.log(TEXT.ui.completionInstallStart);
            console.log(TEXT.ui.completionInstallInfo);

            await tabtab.install({
                name: 'vf',
                completer: 'vf'
            });
        });
}
