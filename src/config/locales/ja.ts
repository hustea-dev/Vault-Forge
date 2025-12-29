// ⚠️ このファイルはシステムメッセージ定義用です。
// AIへのプロンプトを変更したい場合は、src/config/prompts/ja.ts を編集してください。

export const MESSAGES = {
    logs: {
        obsidianSaved: "📄 Obsidianに記録しました",
        geminiAnalyzing: "🤖 Geminiが解析中",
        modeSuffix: "モード",
        analysisResult: "✨ 解析結果",
        obsidianAppended: "✅ 解析結果をファイルに追記しました",
        readingFromObsidian: "📂 Obsidianからノートを読み込んでいます",
        stdinReading: "⏳ 標準入力を読み込み中...",
        appRun: "🏃 app.run() を実行します...",
        completed: "✅ 完了しました",
        xPostStart: "🚀 X投稿モードを開始します...",
        xPostSelected: "📝 選択された投稿内容:",
        xPostSuccess: "✅ Xに投稿しました！",
        xPostCancel: "❌ 投稿をキャンセルしました。",
        fileRecorded: "☑️  解析結果をファイルに記録しました",
        tokenUsage: "📊 トークン使用量: 入力={input}, 出力={output}, 合計={total}",
        xPostRetry: "🔄 再生成します...",
        xPostSaveExit: "💾 保存して終了します。"
    },
    errors: {
        noInput: "パイプ経由で入力データが渡されていません。",
        geminiApi: "❌ Gemini API エラー:",
        envMissing: "❌ エラー: GOOGLE_API_KEY または OBSIDIAN_VAULT_PATH が設定されていません。",
        invalidMode: "❌ エラー: 無効なモード",
        availableModes: "ℹ️  使用可能なモード",
        executionError: "❌ 実行エラー:",
        analysisFailed: "解析結果を取得できませんでした。",
        jsonParseFailed: "⚠️ Geminiの回答をJSONとしてパースできませんでした。対話モードをスキップします。",
        noCandidates: "⚠️ 有効な投稿候補が見つかりませんでした。",
        notTTY: "⚠️ 標準入力がTTYではありません。対話モードを利用するには --file オプションを使用してください。",
        xAuthMissing: "❌ X APIの認証情報が .env に設定されていません。",
        xPostFailed: "❌ 投稿に失敗しました:",
        fileReadError: "❌ エラー: ファイルを読み込めませんでした:"
    },
    markdown: {
        originalDataHeader: "## 📥 原文データ",
        analysisHeader: "## 🧠 Gemini 解析結果",
        xPostHeader: "## 🐦 X投稿案",
        xPostSuccessHeader: "## 🚀 X投稿完了",
        xPostFailHeader: "## ❌ X投稿失敗"
    },
    ui: {
        selectPost: "投稿する案を選択してください:",
        confirmPost: "この内容でXに投稿しますか？",
        retryOption: "🔄 再生成 (Retry)",
        retryDesc: "AIに投稿案を再生成させます",
        saveExitOption: "💾 保存して終了 (Save & Exit)",
        saveExitDesc: "投稿せずに終了します（ログは保存されています）"
    },
    loader: {
        loadError: "カスタムプロンプトの読み込みに失敗しました。",
        reason: "理由",
        confirmContinue: "内蔵のデフォルトプロンプトを使用して処理を続行しますか？",
        usingDefault: "デフォルトプロンプトを使用します。",
        aborting: "処理を中止しました。",
        loadErrorDetail: "プロンプトファイルの読み込みに失敗しました: {filePath}",
        createdDefaultFile: "ℹ️  情報: デフォルトのプロンプトファイルを作成しました: {filePath}",
        createDefaultError: "デフォルトのプロンプトファイルの作成に失敗しました: {filePath}",
        defaultPromptDescription: "{promptName} 用に自動生成されたプロンプト",
        noDefaultPrompt: "デフォルトのプロンプトが見つかりません: {promptName}"
    },
    labels: {
        additionalInstruction: "追加の指示",
        targetData: "対象データ"
    },
    validation: {
        promptTooShort: "プロンプトが短すぎます (10文字以上必要です)"
    }
};
