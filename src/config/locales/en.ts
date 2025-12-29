// ⚠️ This file is for system messages.
// To customize AI prompts, please edit src/config/prompts/en.ts

export const MESSAGES = {
    logs: {
        obsidianSaved: "📄 Saved to Obsidian",
        geminiAnalyzing: "🤖 Gemini is analyzing",
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
        xPostSaveExit: "💾 Saving and exiting."
    },
    errors: {
        noInput: "No input data provided via pipe.",
        geminiApi: "❌ Gemini API Error:",
        envMissing: "❌ Error: GOOGLE_API_KEY or OBSIDIAN_VAULT_PATH is not set.",
        invalidMode: "❌ Error: Invalid mode",
        availableModes: "ℹ️  Available modes",
        executionError: "❌ Execution Error:",
        analysisFailed: "Failed to retrieve analysis result.",
        jsonParseFailed: "⚠️ Failed to parse Gemini response as JSON. Skipping interactive mode.",
        noCandidates: "⚠️ No valid post candidates found.",
        notTTY: "⚠️ Standard input is not a TTY. Use --file option for interactive mode.",
        xAuthMissing: "❌ X API credentials are not set in .env.",
        xPostFailed: "❌ Failed to post:",
        fileReadError: "❌ Error: Could not read file:"
    },
    markdown: {
        originalDataHeader: "## 📥 Original Data",
        analysisHeader: "## 🧠 Gemini Analysis Result",
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
        saveExitDesc: "Exit without posting (log is already saved)"
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
    }
};
