import * as fs from 'fs/promises';
import * as path from 'path';
import { PromptLoader } from './src/core/PromptLoader.ts';
import { ObsidianService } from './src/services/ObsidianService.ts';
import { TEXT } from './src/config/text.ts';

// テスト用のダミーVaultパス
const TEST_VAULT_PATH = path.join(process.cwd(), 'test_vault');
const LANG = 'ja';
const PROMPT_NAME = 'general';
const PROMPT_FILE_PATH = path.join(TEST_VAULT_PATH, '_AI_Prompts', 'prompts', LANG, `${PROMPT_NAME}.md`);

async function runCheck() {
    console.log("🚀 PromptLoader 動作チェック開始\n");

    // 0. 準備: テスト用ディレクトリのクリーンアップ
    try {
        await fs.rm(TEST_VAULT_PATH, { recursive: true, force: true });
        await fs.mkdir(TEST_VAULT_PATH, { recursive: true });
    } catch (e) {}

    const obsidian = new ObsidianService(TEST_VAULT_PATH);
    const loader = new PromptLoader(obsidian, LANG);

    // 1. ファイルがない状態での読み込み (自動作成の確認)
    console.log("--- Test 1: ファイルがない状態 ---");
    try {
        const prompt = await loader.load(PROMPT_NAME);
        console.log("✅ 読み込み成功 (デフォルト値)");
        const fileExists = await fs.stat(PROMPT_FILE_PATH).then(() => true).catch(() => false);
        if (fileExists) console.log("✅ ファイルが自動作成されました");
        else console.error("❌ ファイルが作成されていません");
    } catch (e) {
        console.error("❌ エラー発生:", e);
    }

    // 2. ファイルがある状態での読み込み (正常読み込みの確認)
    console.log("\n--- Test 2: ファイルがある状態 ---");
    try {
        const prompt = await loader.load(PROMPT_NAME);
        console.log("✅ 読み込み成功");
        if (prompt.includes("要約")) console.log("✅ 内容も正しいです");
        else console.error("❌ 内容が期待と異なります");
    } catch (e) {
        console.error("❌ エラー発生:", e);
    }

    // 3. ファイルが壊れている状態 (バリデーションエラーの確認)
    console.log("\n--- Test 3: ファイルが壊れている状態 (空ファイル) ---");
    try {
        await fs.writeFile(PROMPT_FILE_PATH, "", 'utf-8');
        await loader.load(PROMPT_NAME);
        console.error("❌ エラーが発生しませんでした (期待: バリデーションエラー)");
    } catch (e: any) {
        console.log("✅ 期待通りのエラーが発生しました");
        if (e.message.includes(TEXT.validation.promptTooShort)) {
            console.log("✅ エラーメッセージも正しいです (日本語)");
        } else {
            console.error("❌ エラーメッセージが期待と異なります");
            console.error(`   実際の値: ${e.message}`);
        }
    }

    // 4. 未知のプロンプト名を指定した場合
    console.log("\n--- Test 4: 未知のプロンプト名 ---");
    try {
        await loader.load('unknown_mode');
        console.error("❌ エラーが発生しませんでした (期待: noDefaultPromptエラー)");
    } catch (e: any) {
        console.log("✅ 期待通りのエラーが発生しました");
        const expectedMessage = TEXT.loader.noDefaultPrompt.replace('{promptName}', 'unknown_mode');
        if (e.message === expectedMessage) {
            console.log("✅ エラーメッセージも正しいです (日本語)");
        } else {
            console.error("❌ エラーメッセージが期待と異なります");
            console.error(`   実際の値: ${e.message}`);
        }
    }

    console.log("\n✨ チェック完了");
    
    // 後始末
    await fs.rm(TEST_VAULT_PATH, { recursive: true, force: true });
}

runCheck();
