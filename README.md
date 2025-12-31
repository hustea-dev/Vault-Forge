# Vault-Forge

[🇯🇵 日本語のREADMEはこちら](./README_ja.md)

**Hone new ideas from your Obsidian Vault with AI.**

Vault-Forge is a CLI tool that seamlessly integrates your terminal workflow with Obsidian and AI (Google Gemini). It captures fleeting notes, logs, and ideas, processes them with AI, and stores them in your vault, which you can then use as a space to hone and refine your creative ideas.

## Features

-   **Seamless Integration**: Pipe any text from your terminal directly into your Obsidian vault, tagged and organized.
-   **AI-Powered Analysis**: Leverage Google Gemini to summarize, debug, or repurpose your content.
-   **Multiple Modes**:
    -   **General (`ai`)**: Summarize and analyze any text directly in your terminal.
    -   **Debug (`debug`)**: Analyze error logs and save the session to Obsidian.
    -   **X-Post (`xpost`)**: Generate tweet drafts from your notes and save the session to Obsidian.
-   **Flexible Input**: Works with both file paths and standard input (pipes).
-   **Customizable Prompts**: Easily modify AI instructions directly within Obsidian (`_AI_Prompts/`).
-   **Interactive CLI**: Select post candidates and confirm actions interactively.

## Prerequisites

1.  **Node.js**: v18 or higher.
2.  **Environment Variables**: Create a `.env` file in the project root:

    ```
    # .env
    GEMINI_API_KEY="YOUR_GOOGLE_GEMINI_API_KEY"
    OBSIDIAN_VAULT_PATH="/path/to/your/ObsidianVault"
    APP_LANG="en" # or "ja"

    # Required for X-Post mode
    X_API_KEY="YOUR_X_APP_API_KEY"
    X_API_SECRET="YOUR_X_APP_API_SECRET"
    X_ACCESS_TOKEN="YOUR_X_APP_ACCESS_TOKEN"
    X_ACCESS_SECRET="YOUR_X_APP_ACCESS_SECRET"
    ```

## Installation & Setup

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/your-username/vault-forge.git
    cd vault-forge
    ```

2.  **Install dependencies:**
    ```sh
    npm install
    ```

3.  **Set up shell aliases:**
    Add the following to your `.bashrc` or `.zshrc`:

    ```sh
    export VAULT_FORGE_PATH="/path/to/vault-forge"
    alias vf='npx ts-node $VAULT_FORGE_PATH/src/index.ts'
    alias ai='vf --mode=general'
    alias xpost='vf --mode=xpost'
    alias debug='vf --mode=debug'
    ```

## Usage

```sh
vf --mode=<mode> [file] [instruction]
```

## Modes in Detail

### 1. General Mode (`ai`)
The most versatile mode. It sends the input text to AI and displays the response.
Useful for summarization, translation, proofreading, or simple Q&A.

**Examples:**
```sh
# Ask a question directly
ai "What is the capital of France?"

# Summarize a text file
cat long_document.txt | ai "Summarize this in 3 bullet points"
```

### 2. Debug Mode (`debug`)
Designed for developers. It analyzes error logs, explains the root cause, and suggests solutions.
The analysis result is automatically saved to your Obsidian Vault (`Inbox/YYYY-MM-DD/log_HHMMSS.md`).

**Examples:**
```sh
# Analyze a log file
debug error.log

# Pipe logs from another command
kubectl logs my-pod | debug
```

### 3. X-Post Mode (`xpost`)
Turns your Obsidian notes into engaging social media posts (for X/Twitter).
It generates multiple draft options with hashtags. You can interactively select, regenerate, or edit the post before publishing.

**Features:**
-   **Interactive Selection**: Choose from 3 AI-generated drafts.
-   **Regenerate**: Not satisfied? Ask AI to try again.
-   **Save & Exit**: Save the drafts to Obsidian without posting.

**Examples:**
```sh
xpost ./posts/my-new-article.md
```

## Customizing Prompts

You can fully customize the system prompts directly from your Obsidian Vault.

### How it works
1.  **Auto-Generation**: When you run a mode for the first time, Vault-Forge automatically creates a prompt file in your Obsidian Vault.
2.  **Location**: Files are stored in `_AI_Prompts/prompts/{lang}/`.
    -   `general.md`: For General mode
    -   `debug.md`: For Debug mode
    -   `xpost.md`: For X-Post mode
3.  **Editing**: Simply edit these Markdown files in Obsidian. The changes are applied immediately to your next CLI execution.

<p align="center">
  <img src="assets/customprompt-en.png" alt="custom prompt" width="600">
</p>

## License

MIT License
