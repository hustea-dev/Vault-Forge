// ⚠️ This file is for system messages.
// To customize AI prompts, please edit src/config/prompts/en.ts

export const MESSAGES = {
    appDescription: "Forge new ideas from your Obsidian Vault with AI.",
    logs: {
        obsidianSaved: "📄 Saved to Obsidian",
        aiAnalyzing: "🤖 {provider} is analyzing",
        modeSuffix: "mode",
        analysisResult: "✨ Analysis Result",
        obsidianAppended: "✅ Analysis result appended to file",
        readingFromObsidian: "📂 Reading note from Obsidian",
        stdinReading: "⏳ Reading standard input...",
        appRun: "🏃 Running app.run()...",
        completed: "✅ Completed",
        xPostStart: "🚀 Starting X post mode...",
        xPostSelected: "📝 Selected post content:",
        xPostSuccess: "✅ Posted to X!",
        xPostCancel: "❌ Post cancelled.",
        fileRecorded: "☑️  Analysis result recorded in file",
        tokenUsage: "📊 Token Usage: Input={input}, Output={output}, Total={total}",
        xPostRetry: "🔄 Regenerating...",
        xPostSaveExit: "💾 Saving and exiting.",
        runningInBackground: "🚀 Running in background...",
        searchingWithRipgrep: "🔍 Searching for \"{query}\" with ripgrep...",
        ripgrepNotFoundOpeningObsidian: "ℹ️  ripgrep not found. Opening Obsidian...",
        noResultsFound: "No results found.",
        unknownProviderFallback: "⚠️ Unknown provider '{provider}', falling back to Gemini."
    },
    errors: {
        noInput: "No input data provided via pipe.",
        aiApi: "❌ AI API Error:",
        envMissing: "❌ Error: .env file not found.",
        invalidMode: "❌ Error: Invalid mode",
        availableModes: "ℹ️  Available modes",
        executionError: "❌ Execution Error:",
        analysisFailed: "Failed to retrieve analysis result.",
        jsonParseFailed: "⚠️ Failed to parse AI response as JSON. Skipping interactive mode.",
        noCandidates: "⚠️ No valid post candidates found.",
        notTTY: "⚠️ Standard input is not a TTY. Use --file option for interactive mode.",
        xAuthMissing: "❌ X API credentials are not set in .env.",
        xPostFailed: "❌ Failed to post:",
        fileReadError: "❌ Error: Could not read file:",
        unexpectedBackSignal: "Unexpected back signal in non-interactive mode.",
        generalBackgroundNotSupported: "General mode cannot be run in the background.",
        searchError: "Search error:",
        editorExitError: "Editor exited with code {code}",
        vaultPathNotSet: "OBSIDIAN_VAULT_PATH is not set in your .env file. Aborting.",
        noAiKeys: "No AI provider API keys found in your .env file. Aborting.",
        modelNotSpecified: "Model is not specified for provider '{provider}'. Please check your .env file or prompt settings.",
        pipedInputTooLarge: "❌ Error: Input data is too large ({length} chars) for piped input.",
        pipedInputLimit: "   Limit is {limit} chars. Please reduce the input size.",
        providerInferenceFailed: "Could not infer provider from model name. Please check ai-models.json or specify provider.",
        modelNotFound: "Model not found: {model}",
        editorNotSet: "EDITOR environment variable is not set.",
        mainActionError: "Error in mainAction:",
        interactiveRequired: "Cannot ask for selection in non-interactive mode.",
        testEnvRestriction: "Cannot load prompts in test env.",
        detachNotSupported: "Mode '{mode}' does not support detached execution.",
        optionConflict: "Error: option '{option1}' cannot be used with option '{option2}'",
        missingServices: "Required services are missing in handleResult",
        streamNotSupported: "Stream mode is not supported for this provider."
    },
    markdown: {
        originalDataHeader: "## 📥 Original Data",
        analysisHeader: "## 🧠 Analysis Result",
        xPostHeader: "## 🐦 X Post Drafts",
        xPostSuccessHeader: "## 🚀 X Post Completed",
        xPostFailHeader: "## ❌ X Post Failed"
    },
    ui: {
        selectPost: "Select a post candidate:",
        confirmPost: "Post this content to X?",
        retryOption: "🔄 Retry",
        retryDesc: "Regenerate post drafts with AI",
        saveExitOption: "💾 Save & Exit",
        saveExitDesc: "Exit without posting (log is already saved)",
        initWelcome: "Welcome to Vault-Forge Setup!",
        initTitle: "Initialization",
        initCurrentSettings: "Current Settings",
        initVaultPath: "Vault Path",
        initLanguage: "Language",
        initAvailableAI: "Available AI",
        initConfirm: "Do you want to proceed with these settings?",
        initCancelled: "Initialization aborted.",
        initGeneratingFiles: "Generating files...",
        initPromptsGenerated: "Prompt files have been generated in your Vault.",
        initTokenDirCreated: "Token usage directory created.",
        initTokenDirFailed: "Failed to create token usage directory:",
        initEnvCreated: ".env file has been created.",
        initEnvFailed: "Failed to create .env file:",
        initDone: "Setup completed!",
        initResetPrompts: "Initialize (reset) prompt files?",
        initUpdateAI: "Update AI settings for existing prompts?",
        initAIUpdated: "AI settings updated.",
        runInit: "Run `vf init` to setup your environment.",
        selectAIForMode: "Select AI Provider for {mode} mode",
        aiSettingsUpdatedFor: "Updated AI settings for {mode}",
        backOption: "↩️  Back",
        operationCancelled: "Operation cancelled.",
        selectOutputMode: "Select output mode for {mode} mode",
        outputModeNormal: "Normal (batch display)",
        outputModeStream: "Streaming (real-time display, token usage may be inaccurate)",
        outputModeBackground: "Background (run in background)",
        diaryInputMessage: "Enter your diary note:",
        diaryInputPlaceholder: "Write your idea... #tag",
        diarySaved: "Saved to Diary",
        ripgrepInstalled: "🚀 ripgrep is installed. Fast search mode is enabled.",
        ripgrepNotFound: "ℹ️ ripgrep not found. Search will open Obsidian app.",
        ripgrepInstallHint: "For a faster search experience, install ripgrep (e.g., `brew install ripgrep`).",
        searchResultsFound: "Found {count} results. Select to open:",
        selectModel: "Select AI Model:",
        enterCustomModel: "Enter custom model name:",
        customModelOption: "✏️  Custom",
        customModelPlaceholder: "e.g. gpt-4-32k",
        tagsJsonCreated: "tags.json created.",
        aiModelsJsonCreated: "ai-models.json created.",
        setupCompletionConfirm: "Do you want to setup tab completion? (Recommended)",
        setupCompletionFailed: "Failed to setup completion automatically.",
        setupCompletionManual: "You can try manually by running: vf completion",
        confirmLargeInput: "⚠️ Input data is large ({length} chars). Do you really want to append this to your daily note?",
        completionAlreadySetUp: "ℹ️ Tab completion is already set up in your shell config file.",
        initCompleted: "Init completed",
        completionInstallStart: "🚀 Starting shell completion setup...",
        completionInstallInfo: "ℹ️  The following settings will be appended to your shell config file (.zshrc, .bashrc, etc.):\n(Press Ctrl+C to cancel)\n\n# tabtab source for packages\n[[ -f ~/.config/tabtab/zsh/__tabtab.zsh ]] && . ~/.config/tabtab/zsh/__tabtab.zsh || true"
    },
    loader: {
        loadError: "Failed to load custom prompt.",
        reason: "Reason",
        confirmContinue: "Do you want to continue using the built-in default prompt?",
        usingDefault: "Using default prompt.",
        aborting: "Process aborted.",
        loadErrorDetail: "Failed to load prompt file: {filePath}",
        createdDefaultFile: "ℹ️  Info: Created default prompt file: {filePath}",
        createDefaultError: "Failed to create default prompt file: {filePath}",
        defaultPromptDescription: "Auto-generated prompt for {promptName}",
        noDefaultPrompt: "No default prompt found for: {promptName}"
    },
    labels: {
        additionalInstruction: "Additional Instructions",
        targetData: "Target Data"
    },
    validation: {
        promptTooShort: "Prompt is too short (at least 10 characters required)"
    },
    commands: {
        completion: {
            description: "Setup tab completion"
        },
        init: {
            description: "Initialize Vault-Forge settings"
        },
        diary: {
            description: "Create a diary entry",
            args: {
                input: "Diary content"
            },
            options: {
                task: "Create as a task"
            }
        },
        search: {
            description: "Search in Vault",
            args: {
                query: "Search query"
            }
        },
        run: {
            description: "Run Vault-Forge analysis",
            args: {
                input: "Input text directly"
            },
            options: {
                mode: "Execution mode (general, debug, xpost)",
                file: "Input file path",
                instruction: "Additional instruction",
                detach: "Run in background"
            }
        },
        ai: {
            options: {
                preset: "Preset (strategy) to use",
                instruction: "Instruction for the AI",
                detach: "Run in detached mode",
                model: "Override the model for this run",
                file: "Input file path",
                stream: "Force streaming output",
                normal: "Force normal (batch) output"
            }
        }
    }
};
