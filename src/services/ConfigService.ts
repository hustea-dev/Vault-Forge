import { AIProvider } from '../types/constants.js';
import { TEXT } from '../config/text.js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

/**
 * 環境変数や設定値を一元管理するサービスクラス。
 * アプリケーション全体で process.env を直接参照せず、このクラスを通じて値を取得する。
 * Service class for centralized management of environment variables and configuration values.
 * The application should access values through this class instead of referencing process.env directly.
 */
export class ConfigService {
    
    constructor() {
        if (process.env.NODE_ENV === 'test' && process.env.VAULT_PATH_FOR_TEST) {
            const envPath = path.join(process.env.VAULT_PATH_FOR_TEST, '.env');
            if (fs.existsSync(envPath)) {
                dotenv.config({ path: envPath });
            }
            return;
        }

        if (process.env.NODE_ENV !== 'test') {
            const envPath = path.join(process.cwd(), '.env');
            if (fs.existsSync(envPath)) {
                dotenv.config({ path: envPath });
            }
        }
    }

    /**
     * .env ファイルが存在するかどうかを確認する。
     * Checks if the .env file exists.
     */
    hasEnvFile(): boolean {
        if (process.env.NODE_ENV === 'test' && process.env.VAULT_PATH_FOR_TEST) {
            return fs.existsSync(path.join(process.env.VAULT_PATH_FOR_TEST, '.env'));
        }
        return fs.existsSync(path.join(process.cwd(), '.env'));
    }

    /**
     * アプリケーションが設定済みかどうかを確認する。
     * .env ファイルが存在するか、または必須の環境変数 (OBSIDIAN_VAULT_PATH) が設定されていれば true を返す。
     * Checks if the application is configured.
     * Returns true if the .env file exists OR if the required environment variable (OBSIDIAN_VAULT_PATH) is set.
     */
    isConfigured(): boolean {
        return this.hasEnvFile() || this.hasVaultPath();
    }

    /**
     * Vault Path が設定されているかどうかを確認する。
     * Checks if the Vault Path is set.
     */
    hasVaultPath(): boolean {
        return !!process.env.OBSIDIAN_VAULT_PATH;
    }

    /**
     * Obsidian Vaultのパスを取得する。
     * Gets the path to the Obsidian Vault.
     * @throws {Error} 環境変数が設定されていない場合 / If the environment variable is not set.
     */
    get vaultPath(): string {
        let vaultPath = process.env.OBSIDIAN_VAULT_PATH;
        if (!vaultPath) {
            throw new Error(TEXT.errors.vaultPathNotSet);
        }

        if (vaultPath.startsWith('~')) {
            vaultPath = path.join(os.homedir(), vaultPath.slice(1));
        }

        return vaultPath;
    }

    /**
     * 使用するエディタのコマンドを取得する。
     * Gets the editor command to use.
     * @returns {string | undefined} エディタコマンド、または未設定の場合はundefined / Editor command, or undefined if not set.
     */
    get editor(): string | undefined {
        return process.env.EDITOR;
    }

    /**
     * アプリケーションの言語設定を取得する。
     * Gets the application language setting.
     * @returns {string} 言語コード (デフォルトは 'en') / Language code (defaults to 'en').
     */
    get language(): string {
        return process.env.VF_LANG || process.env.APP_LANG || 'en';
    }

    /**
     * テスト環境かどうかを判定する。
     * Determines if the application is running in a test environment.
     */
    get isTestEnv(): boolean {
        return process.env.NODE_ENV === 'test';
    }

    /**
     * バックグラウンド（デタッチ）モードで実行されているかどうかを判定する。
     * Determines if the application is running in detached mode.
     */
    get isDetachedMode(): boolean {
        return process.env.VF_DETACHED_MODE === 'true';
    }

    /**
     * 指定されたプロバイダーのAPIキーを取得する。
     * Gets the API key for the specified provider.
     * @param {string} provider - AIプロバイダー名 / The name of the AI provider.
     * @returns {string} APIキー / The API key.
     * @throws {Error} APIキーが設定されていない場合 / If the API key is not set.
     */
    getApiKey(provider: string): string {
        let apiKey = "";

        switch (provider) {
            case AIProvider.OPENAI:
                apiKey = process.env.OPENAI_API_KEY || "";
                break;
            case AIProvider.GROQ:
                apiKey = process.env.GROQ_API_KEY || "";
                break;
            case AIProvider.CLAUDE:
                apiKey = process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY || "";
                break;
            case AIProvider.GEMINI:
            default:
                apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";
                break;
        }

        if (!apiKey) {
            throw new Error(TEXT.errors.noAiKeys);
        }

        return apiKey;
    }

    /**
     * 利用可能な（APIキーが設定されている）プロバイダーのリストを取得する。
     * Gets a list of available providers (those with API keys set).
     */
    getAvailableProviders(): string[] {
        return Object.values(AIProvider).filter(provider => {
            try {
                this.getApiKey(provider);
                return true;
            } catch (e) {
                return false;
            }
        });
    }
}
