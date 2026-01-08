import { ConfigService } from './ConfigService.js';
import { TEXT } from '../config/text.js';

const config = new ConfigService();
const isTestEnv = config.isTestEnv;

/**
 * ユーザーとの対話（CLI上のUI）を抽象化するクラス。
 * テスト環境では、ハングアップを防ぐために全てのUI処理をスキップする。
 * A class that abstracts user interaction (UI on the CLI).
 * In a test environment, it skips all UI processing to prevent hanging.
 */
export class UserInteraction {
    
    /**
     * 現在の環境が対話可能（TTY）かどうかを判定する。
     * Determines if the current environment is interactive (TTY).
     * @returns {boolean} true if interactive, false otherwise.
     */
    isInteractive(): boolean {
        return !isTestEnv && process.stdout.isTTY;
    }

    /**
     * `@clack/prompts` を動的にインポートする。テスト環境ではnullを返す。
     * Dynamically imports `@clack/prompts`. Returns null in a test environment.
     * @private
     */
    private async getClack() {
        if (isTestEnv) return null;
        return await import('@clack/prompts');
    }

    /**
     * introメッセージを表示する。
     * Displays an intro message.
     * @param {string} message - 表示するメッセージ / The message to display.
     */
    async intro(message: string): Promise<void> {
        const clack = await this.getClack();
        clack?.intro(message);
    }

    /**
     * outroメッセージを表示する。
     * Displays an outro message.
     * @param {string} message - 表示するメッセージ / The message to display.
     */
    async outro(message: string): Promise<void> {
        const clack = await this.getClack();
        clack?.outro(message);
    }

    /**
     * ユーザーにYes/Noの確認を求める。
     * Asks the user for a Yes/No confirmation.
     * @param {string} message - 質問メッセージ / The question message.
     * @param {boolean} [initialValue=false] - 初期値 / The initial value.
     * @returns {Promise<boolean>} ユーザーの回答 / The user's answer.
     */
    async askConfirm(message: string, initialValue: boolean = false): Promise<boolean> {
        if (!this.isInteractive()) return initialValue;
        const clack = await this.getClack();
        if (!clack) return initialValue;

        const result = await clack.confirm({ message, initialValue });
        if (clack.isCancel(result)) {
            await this.cancel();
            return process.exit(0);
        }
        return result;
    }

    /**
     * ユーザーに選択肢から一つを選ばせる。
     * Lets the user choose one from a list of options.
     * @param {string} message - 質問メッセージ / The question message.
     * @param {Array<object>} options - 選択肢の配列 / The array of options.
     * @returns {Promise<T>} 選択された値 / The selected value.
     */
    async askSelect<T>(message: string, options: { name: string, value: T, label?: string }[]): Promise<T> {
        if (!this.isInteractive()) throw new Error(TEXT.errors.interactiveRequired);
        const clack = await this.getClack();
        if (!clack) throw new Error(TEXT.errors.testEnvRestriction);

        const result = await clack.select({ message, options: options as any });
        if (clack.isCancel(result)) {
            await this.cancel();
            return process.exit(0);
        }
        return result as T;
    }

    /**
     * ユーザーにテキスト入力を求める。
     * Asks the user for text input.
     * @param {string} message - 質問メッセージ / The question message.
     * @param {string} [placeholder] - プレースホルダー / The placeholder text.
     * @returns {Promise<string>} 入力されたテキスト / The entered text.
     */
    async askText(message: string, placeholder?: string): Promise<string> {
        if (!this.isInteractive()) return "";
        const clack = await this.getClack();
        if (!clack) return "";

        const result = await clack.text({ message, placeholder });
        if (clack.isCancel(result)) {
            await this.cancel();
            return process.exit(0);
        }
        return result as string;
    }

    /**
     * 情報メッセージをログに出力する。
     * Logs an informational message.
     * @param {string} message - メッセージ / The message.
     */
    async info(message: string): Promise<void> {
        const clack = await this.getClack();
        clack?.log.info(message);
    }

    /**
     * 警告メッセージをログに出力する。
     * Logs a warning message.
     * @param {string} message - メッセージ / The message.
     */
    async warn(message: string): Promise<void> {
        const clack = await this.getClack();
        clack?.log.warn(message);
    }

    /**
     * エラーメッセージをログに出力する。
     * Logs an error message.
     * @param {string} message - メッセージ / The message.
     */
    async error(message: string): Promise<void> {
        const clack = await this.getClack();
        clack?.log.error(message);
    }

    /**
     * 成功メッセージをログに出力する。
     * Logs a success message.
     * @param {string} message - メッセージ / The message.
     */
    async success(message: string): Promise<void> {
        const clack = await this.getClack();
        clack?.log.success(message);
    }

    /**
     * キャンセルメッセージを表示する。
     * Displays a cancellation message.
     * @param {string} [message="Operation cancelled."] - メッセージ / The message.
     */
    async cancel(message: string = "Operation cancelled."): Promise<void> {
        const clack = await this.getClack();
        clack?.cancel(message);
    }

    /**
     * スピナーオブジェクトを返す。
     * Returns a spinner object.
     */
    async spinner() {
        const clack = await this.getClack();
        if (!clack) {
            return {
                start: () => {},
                stop: () => {},
                message: () => {},
            };
        }
        return clack.spinner();
    }
}
