# obsidian-ai-cli

[🇯🇵 日本語のREADMEはこちら](./README_ja.md)

Obsidian, Google Gemini, and X (formerly Twitter) integrated CLI tool to supercharge your note-taking and knowledge-sharing workflow.

## Features

-   **Seamless Integration**: Pipe any text from your terminal directly into your Obsidian vault, tagged and organized (for `debug` and `xpost` modes).
-   **AI-Powered Analysis**: Leverage Google Gemini to summarize, debug, or repurpose your content based on the selected mode.
-   **Multiple Modes**:
    -   **General (`ai`)**: Summarize and analyze any text directly in your terminal. **Does not save to Obsidian.**
    -   **Debug (`debug`)**: Analyze error logs and save the session to Obsidian.
    -   **X-Post (`xpost`)**: Generate tweet drafts from your notes and save the session to Obsidian.
-   **Flexible Input**: Works with both file paths and standard input (pipes).
-   **Customizable Prompts**: Easily modify AI instructions and switch languages.

## Prerequisites

1.  **Node.js**: v18 or higher.
2.  **Environment Variables**: Create a `.env` file in the project root with the following keys:

    ```
    # .env
    GEMINI_API_KEY="YOUR_GOOGLE_GEMINI_API_KEY"
    OBSIDIAN_VAULT_PATH="/path/to/your/obsidian/vault"

    # Language setting (en or ja)
    APP_LANG="en"

    # Required for X-Post mode
    X_API_KEY="YOUR_X_APP_API_KEY"
    X_API_SECRET="YOUR_X_APP_API_SECRET"
    X_ACCESS_TOKEN="YOUR_X_APP_ACCESS_TOKEN"
    X_ACCESS_SECRET="YOUR_X_APP_ACCESS_SECRET"
    ```

## Installation & Setup

1.  **Clone the repository:**

    ```sh
    git clone https://github.com/your-username/obsidian-ai-cli.git
    cd obsidian-ai-cli
    ```

2.  **Install dependencies:**

    ```sh
    npm install
    ```

3.  **Set up shell aliases:**
    Add the following to your `.bashrc`, `.zshrc`, or shell configuration file to create convenient commands.

    ```sh
    # ~/.zshrc or ~/.bashrc

    # Set the absolute path to your cloned repository
    export OBSIDIAN_AI_CLI_PATH="/path/to/your/obsidian-ai-cli"

    # Aliases
    alias ai='npx ts-node $OBSIDIAN_AI_CLI_PATH/src/index.ts --mode=general'
    alias xpost='npx ts-node $OBSIDIAN_AI_CLI_PATH/src/index.ts --mode=xpost'
    alias debug='npx ts-node $OBSIDIAN_AI_CLI_PATH/src/index.ts --mode=debug'
    ```
    *Remember to reload your shell configuration (`source ~/.zshrc`) after editing.*

## Configuration & Customization

### Switching Languages

You can switch the output language and default prompts between English and Japanese by setting the `APP_LANG` environment variable in your `.env` file.

```bash
# .env
APP_LANG="ja" # Switch to Japanese
# APP_LANG="en" # Switch to English (Default)
```

### Customizing Prompts

You can fully customize the system prompts sent to Gemini to suit your workflow.
Edit the files located in `src/config/locales/`:

-   **English**: `src/config/locales/en.ts`
-   **Japanese**: `src/config/locales/ja.ts`

For example, to change the behavior of the **General Mode**, modify the `prompts.general` field:

```typescript
// src/config/locales/en.ts
export const TEXT = {
    prompts: {
        // Change this to whatever you like!
        general: "Please summarize the following content in a poetic style.", 
        // ...
    },
    // ...
};
```

This allows you to fine-tune the AI's personality and output format for each mode.

## Usage

### Command Syntax

The tool follows a simple command structure:

```sh
<command> [file] [instruction] [options]
```

-   **`<command>`**: `ai`, `xpost`, or `debug`.
-   **`[file]`** (Optional): Path to the text file to analyze. If omitted, the tool will read from standard input (pipe).
-   **`[instruction]`** (Optional): Additional instructions for the AI.

### Commands & Options

| Command | `--mode`  | Description                                                                 |
| :------ | :-------- | :-------------------------------------------------------------------------- |
| `ai`    | `general` | **General Mode**: Summarizes or analyzes text. (Default, does not save to Obsidian) |
| `xpost` | `xpost`   | **X-Post Mode**: Creates tweet drafts from text and saves the session to Obsidian.    |
| `debug` | `debug`   | **Debug Mode**: Analyzes error logs and saves the session to Obsidian.                 |

| Argument / Option        | Short Form / Alias      | Description                               |
| :----------------------- | :---------------------- | :---------------------------------------- |
| `[file]`                 | (none)                  | Path to the input text file.              |
| `[instruction]`          | (none)                  | Additional instruction for the AI.        |
| `--file=<path>`          | (none)                  | Explicitly specify the input file.        |
| `--instruction=<text>`   | `-i=<text>`, `--inst=<text>` | Explicitly specify the AI instruction.    |

### Examples

#### **General Mode (`ai`)**

```sh
# Just chat with Gemini (No file, no pipe)
ai "How are you today?"

# Summarize a file (output to terminal only)
ai my-notes.md

# Summarize text from a pipe
cat my-notes.md | ai

# Summarize with an additional instruction
ai my-notes.md "Summarize this in three bullet points"

# Use a pipe with an instruction
cat my-notes.md | ai "What is the main conclusion of this article?"
```

#### **X-Post Mode (`xpost`)**

```sh
# Create tweet drafts from an article (saves to Obsidian)
xpost ./posts/my-article.md

# Create drafts from clipboard content
pbpaste | xpost

# Create drafts with a specific instruction (long form)
xpost my-article.md --instruction="Make it appealing to engineers, with a bit of humor"

# Same as above, using the short form
xpost my-article.md -i="Make it appealing to engineers, with a bit of humor"

# You can also omit the option name for instructions
xpost my-article.md "Make it appealing to engineers, with a bit of humor"
```

#### **Debug Mode (`debug`)**

```sh
# Analyze an error log file (saves to Obsidian)
debug error.log

# Analyze logs from a pipe
kubectl logs my-pod | debug
```
