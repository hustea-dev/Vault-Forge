# Vault-Forge

[🇯🇵 日本語のREADMEはこちら](./README_ja.md)

**Forge new ideas from your Obsidian Vault with AI.**

Vault-Forge is a CLI tool that seamlessly integrates your terminal workflow with Obsidian and AI (Google Gemini). It captures fleeting notes, logs, and ideas, processes them with AI, and stores them in your vault, which you can then use as a space to forge and refine your creative ideas.
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

### Examples

#### **General Mode (`ai`)**
```sh
ai "How are you today?"
cat my-notes.md | ai "Summarize this"
```

#### **X-Post Mode (`xpost`)**
```sh
xpost ./posts/my-article.md
```
<p align="center">
  <img src="assets/xpost_demo.gif" alt="xpost demo" width="600">
</p>

#### **Debug Mode (`debug`)**
```sh
debug error.log
kubectl logs my-pod | debug
```
<p align="center">
  <img src="assets/debug_demo.gif" alt="debug demo" width="600">
</p>

## Customizing Prompts

You can fully customize the system prompts directly from your Obsidian Vault.
Edit the Markdown files in `_AI_Prompts/prompts/{lang}/`.

<p align="center">
  <img src="assets/customprompt.png" alt="custom prompt" width="600">
</p>

## License

MIT License
