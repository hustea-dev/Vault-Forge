// ⚠️ このファイルはシステムメッセージ定義用です。
// AIへのプロンプトを変更したい場合は、src/config/prompts/ja.ts を編集してください。

export const MESSAGES = {
    appDescription: "AIの力でObsidian Vaultから新しいアイデアを創造する。",
    logs: {
        obsidianSaved: "📄 Obsidianに記録しました",
        aiAnalyzing: "🤖 {provider}が解析中",
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
        xPostSaveExit: "💾 保存して終了します。",
        runningInBackground: "🚀 バックグラウンドで実行中...",
        searchingWithRipgrep: "🔍 ripgrepで「{query}」を検索中...",
        ripgrepNotFoundOpeningObsidian: "ℹ️  ripgrepが見つかりません。Obsidianを開きます...",
        noResultsFound: "該当する結果は見つかりませんでした。",
        unknownProviderFallback: "⚠️ 未知のプロバイダー '{provider}' です。Geminiにフォールバックします。"
    },
    errors: {
        noInput: "パイプ経由で入力データが渡されていません。",
        aiApi: "❌ AI API エラー:",
        envMissing: "❌ エラー: .env ファイルが見つかりません。",
        invalidMode: "❌ エラー: 無効なモード",
        availableModes: "ℹ️  使用可能なモード",
        executionError: "❌ 実行エラー:",
        analysisFailed: "解析結果を取得できませんでした。",
        jsonParseFailed: "⚠️ AIの回答をJSONとしてパースできませんでした。対話モードをスキップします。",
        noCandidates: "⚠️ 有効な投稿候補が見つかりませんでした。",
        notTTY: "⚠️ 標準入力がTTYではありません。対話モードを利用するには --file オプションを使用してください。",
        xAuthMissing: "❌ X APIの認証情報が .env に設定されていません。",
        xPostFailed: "❌ 投稿に失敗しました:",
        fileReadError: "❌ エラー: ファイルを読み込めませんでした:",
        unexpectedBackSignal: "非対話モードで予期しない戻るシグナルが発生しました。",
        generalBackgroundNotSupported: "Generalモードはバックグラウンド実行に対応していません。",
        searchError: "検索エラー:",
        editorExitError: "エディタがエラーコード {code} で終了しました",
        vaultPathNotSet: "OBSIDIAN_VAULT_PATH が .env ファイルに設定されていません。処理を中止します。",
        noAiKeys: "AIプロバイダーのAPIキーが .env ファイルに見つかりません。処理を中止します。",
        modelNotSpecified: "プロバイダー '{provider}' のモデルが指定されていません。.env ファイルまたはプロンプト設定を確認してください。",
        pipedInputTooLarge: "❌ エラー: パイプ入力のデータサイズが大きすぎます ({length} 文字)。",
        pipedInputLimit: "   制限は {limit} 文字です。入力サイズを減らしてください。",
        providerInferenceFailed: "モデル名からプロバイダーを推測できませんでした。ai-models.json を確認するか、プロバイダーを明示的に指定してください。",
        modelNotFound: "モデルが見つかりません: {model}",
        editorNotSet: "環境変数 EDITOR が設定されていません。",
        mainActionError: "mainActionでエラーが発生しました:",
        interactiveRequired: "非対話モードでは選択肢の入力を求めることはできません。",
        testEnvRestriction: "テスト環境ではプロンプトをロードできません。",
        detachNotSupported: "モード '{mode}' はバックグラウンド実行をサポートしていません。",
        optionConflict: "エラー: オプション '{option1}' はオプション '{option2}' と同時に使用できません。",
        missingServices: "handleResult に必要なサービスが不足しています。",
        streamNotSupported: "このプロバイダーはストリーミングモードに対応していません。"
    },
    markdown: {
        originalDataHeader: "## 📥 原文データ",
        analysisHeader: "## 🧠 解析結果",
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
        saveExitDesc: "投稿せずに終了します（ログは保存されています）",
        initWelcome: "Vault-Forge セットアップへようこそ！",
        initTitle: "初期化", 
        initCurrentSettings: "現在の設定",
        initVaultPath: "Vaultのパス",
        initLanguage: "言語",
        initAvailableAI: "利用可能なAI",
        initConfirm: "この設定で初期化を進めますか？",
        initCancelled: "初期設定を中断します。",
        initGeneratingFiles: "ファイルを生成中...",
        initPromptsGenerated: "プロンプトファイルがVault内に生成されました。",
        initTokenDirCreated: "トークン管理用ディレクトリが作成されました。",
        initTokenDirFailed: "トークン管理用ディレクトリの作成に失敗しました:",
        initEnvCreated: ".env ファイルが作成されました。",
        initEnvFailed: ".env ファイルの作成に失敗しました:",
        initDone: "セットアップが完了しました！",
        initResetPrompts: "プロンプトファイルを初期化（リセット）しますか？",
        initUpdateAI: "既存のプロンプトファイルのAI設定を変更しますか？",
        initAIUpdated: "AI設定が更新されました。",
        runInit: "`vf init` を実行して環境をセットアップしてください。",
        selectAIForMode: "{mode} モードで使用するAIを選択してください",
        aiSettingsUpdatedFor: "{mode} のAI設定を更新しました",
        backOption: "↩️  戻る (Back)",
        operationCancelled: "操作がキャンセルされました。",
        selectOutputMode: "{mode} モードの出力方法を選択してください",
        outputModeNormal: "通常 (一括表示)",
        outputModeStream: "ストリーミング (リアルタイム表示・トークン計測不可の場合あり)",
        outputModeBackground: "バックグラウンド (裏で実行)",
        diaryInputMessage: "今日のメモを入力してください:",
        diaryInputPlaceholder: "アイデアをメモ... #tag",
        diarySaved: "日記に保存しました",
        ripgrepInstalled: "🚀 ripgrepがインストールされています。高速検索モードが有効です。",
        ripgrepNotFound: "ℹ️ ripgrepが見つかりません。検索はObsidianアプリで行います。",
        ripgrepInstallHint: "より高速な検索のため、ripgrepのインストールを推奨します (例: `brew install ripgrep`)。",
        searchResultsFound: "{count} 件の結果が見つかりました。開くファイルを選択してください:",
        selectModel: "使用するモデルを選択してください:",
        enterCustomModel: "モデル名を手動入力:",
        customModelOption: "✏️  手動入力 (Custom)",
        customModelPlaceholder: "例: gpt-4-32k",
        tagsJsonCreated: "tags.json が作成されました。",
        aiModelsJsonCreated: "ai-models.json が作成されました。",
        setupCompletionConfirm: "タブ補完をセットアップしますか？（推奨）",
        setupCompletionFailed: "補完の自動セットアップに失敗しました。",
        setupCompletionManual: "手動でセットアップするには `vf completion` を実行してください。",
        confirmLargeInput: "⚠️ 入力データが大きすぎます ({length} 文字)。本当に日記に追記しますか？",
        completionAlreadySetUp: "ℹ️ タブ補完は既にシェル設定ファイルに設定されています。",
        initCompleted: "初期化が完了しました",
        completionInstallStart: "🚀 シェル補完のセットアップを開始します...",
        completionInstallInfo: "ℹ️  以下の設定がシェル設定ファイル (.zshrc, .bashrc 等) に追記されます:\n\n# tabtab source for packages\n[[ -f ~/.config/tabtab/zsh/__tabtab.zsh ]] && . ~/.config/tabtab/zsh/__tabtab.zsh || true\n\n(キャンセルするには Ctrl+C を押してください)"
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
    },
    commands: {
        completion: {
            description: "タブ補完をセットアップします"
        },
        init: {
            description: "Vault-Forgeの設定を初期化します"
        },
        diary: {
            description: "日記のエントリを作成します",
            args: {
                input: "日記の内容"
            },
            options: {
                task: "タスクとして作成します"
            }
        },
        search: {
            description: "Vault内を検索します",
            args: {
                query: "検索クエリ"
            }
        },
        run: {
            description: "Vault-Forgeの解析を実行します",
            args: {
                input: "直接入力するテキスト"
            },
            options: {
                mode: "実行モード (general, debug, xpost)",
                file: "入力ファイルのパス",
                instruction: "追加の指示",
                detach: "バックグラウンドで実行します"
            }
        },
        ai: {
            options: {
                preset: "使用するプリセット（戦略）",
                instruction: "AIへの追加の指示",
                detach: "バックグラウンドで実行",
                model: "この実行で使用するモデルを上書き",
                file: "入力ファイルのパス",
                stream: "ストリーミング出力を強制",
                normal: "通常（一括）出力を強制"
            }
        }
    }
};
