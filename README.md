[🇯🇵 日本語](https://github.com/hustea-dev/Vault-Forge/blob/main/README_ja.md)

<a id="top"></a>
# Vault-Forge v2.0

**Obsidian × Terminal × AI**
Vault-Forge is the CLI tool for accelerating intellectual production by directly manipulating your Obsidian Vault from the terminal and leveraging the power of Generative AI.

v2.0 features a revamped architecture with **Multi-AI Support**, **High-Speed Search**, and **Diary Functionality**.

## Table of Contents

1.  [🚀 New Features in v2.0](#-new-features-in-v20)
2.  [📦 Installation and Setup](#-installation-and-setup)
3.  [📖 Command Guide](#-command-guide)
    *   [1. 📔 Diary & Memo (`vf diary`)](#1--diary--memo-vf-diary)
    *   [2. 🔍 Search (`vf search`)](#2--search-vf-search)
    *   [3. 🤖 AI Analysis & Generation (`vf ai`)](#3--ai-analysis--generation-vf-ai)
    *   [4. Recommended Alias Settings (`Aliases`)](#4-recommended-alias-settings-aliases)
4.  [🛠️ Customization (The Forge)](#️-customization-the-forge)
5.  [📊 Token Management](#-token-management)
6.  [⌨️ Shell Completion](#️-shell-completion)

---

## 🚀 New Features in v2.0

*   **🧠 Multi-AI Support**: Freely switch between Gemini, OpenAI, Groq, and Claude for each mode.
*   **📔 Diary Mode**: A lightning-fast memo function like `jrnl`. Create tasks and tags instantly from the CLI.
*   **🔍 Search Mode**: Blazing fast search powered by `ripgrep`. Open files directly in Vim or Obsidian.
*   **⚙️ Automated Configuration**: AI model lists and tags learn from your usage and are saved to `json`, growing your completion candidates.
*   **📄 Obsidian First**: Prompts and settings are all managed as Obsidian notes.

[↑ Top](#top)
---

## 📦 Installation and Setup

### 1. Prerequisites
*   Node.js (v18 or higher recommended)
*   Obsidian
*   (Recommended) `ripgrep`: For using high-speed search mode (e.g., `brew install ripgrep`)

### 2. Installation
Install as an npm package.

```sh
npm install -g vault-forge
```
### Setup for Development Environment
If you are cloning the repository:
```bash
git clone https://github.com/your-repo/vault-forge.git
cd vault-forge
npm install
npm run build
npm link # Link vf command globally
```

### 3. Environment Variables
Create a `.env` file in the project root (refer to `.env.example`).

### 3.1 Setting Environment Variables

First, copy `.env.example` in the project root to create a `.env` file and configure the necessary settings.

```bash
cp .env.example .env
nano .env # or edit with your favorite editor
```
Set the following information in the `.env` file:
*   `OBSIDIAN_VAULT_PATH`: The absolute path to your Obsidian Vault
*   API keys for each AI provider (`OPENAI_API_KEY`, `GEMINI_API_KEY`, etc.)

```sh
# Required: Absolute path to Obsidian Vault
OBSIDIAN_VAULT_PATH=/absolute/path/to/your/vault

# Optional: Language setting (ja/en)
APP_LANG=en

# Optional: Editor setting (effective only when ripgrep is used)
# Access md files via default editor instead of Obsidian.
EDITOR=code
# EDITOR=vim

# AI API Keys (Only set the ones you use)
GEMINI_API_KEY=...
OPENAI_API_KEY=...
GROQ_API_KEY=...
CLAUDE_API_KEY=...
```

### 4. Initialization (`vf init`)
Be sure to run this first. It generates necessary directories and configuration files within your Vault.

```sh
vf init
```

In interactive mode, you can configure the **AI Provider** and **Model** to use for each mode (general, debug, xpost).
The model names entered here are saved to `_AI_Prompts/ai-models.json` and will be displayed as options next time.

[↑ Top](#top)
---

## 📖 Command Guide

### 1. 📔 Diary & Memo (`vf diary`)
Quickly append to Obsidian's Daily Note (`Daily/YYYY-MM-DD.md`). * **AI is not used.**

**Basic:**
```sh
vf diary "Came up with a great idea"
# -> - **HH:MM** Came up with a great idea
```

**Interactive Mode (no arguments):**
```sh
vf diary
# -> Input prompt launches. Comfortable input experience.
```

**Useful Features:**
*   **Task Creation**: Use `-t` option, or include `#task` / `#todo` to save with a checkbox (`- [ ]`).
    ```sh
    vf diary -task "Buy milk" # -> [ ] Buy milk
    vf diary -t "Buy milk" # -> [ ] Buy milk
    vf diary "Drink milk #task" # -> [ ] Drink milk #task
    ```
*   **Headings**: Include `#h2` or `#heading2` to save as a Markdown heading.
    ```sh
    vf diary "About Project A #h2" 
    ```
*   **Tags**: `#tag` is automatically extracted and recorded as a #tag in the Obsidian body.
    ```sh
    vf diary "Configured new CLI tool today #dev" 
    # ->  **16:10** Configured new CLI tool today #dev 
    ```

## 2. 🔍 Search (`vf search` `vf tag`)
High-speed search within the Vault. Alias `vf s` is also available. * **AI is not used.**

* Note: The search function only searches within the directory configured in `OBSIDIAN_VAULT_PATH=` in the .env file.

```sh
vf search "search query"
vf s "search query"
```
* **Editor Integration**:

  If `ripgrep` is installed, it uses the editor configured in the `EDITOR` environment variable (e.g., `export EDITOR=code`) to open files in the Vault.
  
  If `ripgrep` is not installed or `EDITOR` is not set, it opens in Obsidian.

### About Tags:
**Tag Search:**
```bash
vf tag test
```
Searches for notes containing the `#test` tag "in the body".

### 4.3 Diary & Memo (`vf diary`)

```bash
vf diary "Configured new CLI tool today #dev"
```
Appends to the Obsidian daily note. Use the `-t` option to add as a task.

By combining this tag function and search function, you can smoothly perform the cycle of:

        Record with tag -> Search by tag -> Edit -> Input body -> Search body

directly from the terminal.


### 3. 🤖 AI Analysis & Generation (`vf ai`)
Process text using AI. Behavior changes depending on the preset (mode).

**Basic:**
```shell
vf ai "Ask AI something" 
```        

**Specifying Preset (`-p` / `--preset`):**
*   **general** (Default): General questions and text generation.
    ```sh
    vf ai --preset general --instruction "Ask AI something"
    vf ai -p general -i "Ask AI something"
    vf ai -p general "Ask AI something" # -i can be omitted
    ```
*   **debug**: Analyze error logs and code.
    ```sh 
    vf ai -preset debug "[WARN] An error occurred! This is an error log..."
    vf ai -p debug -f error.log "Analyze this error log" 
    cat error.log | vf ai -p debug # Can also be passed via pipe
    ```
*   **xpost**: Create X (Twitter) post drafts from memos and post them directly.
    ```sh 
    vf ai -p xpost -f blog.md "With a humorous tone for engineers"
    
    # In detached mode, drafts are saved to Vault and process exits (does not post automatically)
    vf ai -p xpost -f blog.md --detach "With a humorous tone for engineers"     
    ```

**Options:**
*   `-f, --file <path>`: Use file content as input.
*   `-i, --instruction <text>`: Give additional instructions.
*   `-d, --detach`: Run in background (results are saved to log file).
*   `-m, --model <name>`: Temporarily change the model to use.

### 4. Recommended Alias Settings (`Aliases`)
To use Vault-Forge even more conveniently, we recommend adding the following aliases to your shell configuration file (`.zshrc` or `.bashrc`).

```bash
# Append to ~/.zshrc or ~/.bashrc

# Basic AI analysis (General preset)
alias ai='vf ai -p general'

# X (Twitter) post creation preset
alias xpost='vf ai -p xpost'

# Error log analysis preset
alias debug='vf ai -p debug'

# Create diary entry
alias diary='vf diary'

# Search
alias search='vf search'
```

To apply the settings, restart your shell or run `source ~/.zshrc`.

### 4.1 Application: Combining Aliases and Pipes

With recommended aliases, operation becomes even more intuitive.

**Create X post draft from blog article:**
```bash
cat blog_draft.md | xpost "In a friendly tone"
```

**Analyze Kubernetes logs:**
```bash
kubectl logs my-pod | debug "Are there any abnormal logs?"
```

**Create commit message draft from Git diff:**
```bash
git diff | ai "Think of a commit message"
```

[↑ Top](#top)
---

## 🛠️ Customization (The Forge)

The biggest feature of Vault-Forge is that **settings and prompts can be managed on Obsidian**.

### Editing Prompts
Running `vf init` generates prompt files (Markdown) in `_AI_Prompts/prompts/en/` (or `ja/` depending on language setting) within your Vault.

By editing these in Obsidian, you can freely customize the AI's behavior.

**Example: `xpost.md`**

<img src="assets/customprompt-en.png" alt="Demo Image" width="600">

**Switching AI**: 
*   You can change the AI model used by directly describing it in the `model` field in the Obsidian header (Frontmatter).

    <img src="assets/aimodel.png" alt="Demo Image" width="600">
    
*   You can also change the model for that mode from the command line using `-m` or `--model` options.
    ```sh 
    vf ai -m <TAB> # -> Press TAB to see model names as candidates
    claude-haiku-4-5      gemini-2.0-flash  ... 
    ```
*   **Tag Completion**: Since model names are included in Obsidian tags during `vf init`, model names are completed when you type `#` on Obsidian.

    (Please note not to include # when registering model names.)

### Adding AI Models
If you want to use a new model (e.g., `gpt-7`), you can add it in one of the following ways:

1.  **Add via `vf init`**: Select `Custom` during model selection and enter manually.
2.  **Edit JSON**: Directly edit `_AI_Prompts/ai-models.json`.
3.  **Edit from Obsidian**: Directly edit the prompt in Obsidian.
4.  **Run via command**: Running with an unregistered model like `vf ai -m gpt-7 "test"` will automatically infer the provider and register it.
    ```sh
    vf ai -m gpt-7 "Can I use Gpt-7?"
    ```
No need to rewrite code.

[↑ Top](#top)
---

## 📊 Token Management
AI usage is automatically recorded in `_AI_Prompts/TokenUsage/`.
It is visualized as Mermaid charts on Obsidian, so cost management is perfect.

<img src="assets/tokenusage.png" alt="Demo Image" width="400">

[↑ Top](#top)
---

## ⌨️ Shell Completion
Powerful completion is provided by `tabtab`.

```sh
vf completion
```

Normally, it is automatically set up at the end of `vf init`, but run the above command if you want to set it up manually.
This enables completion for commands, presets, options, and **hashtags recorded in `tags.json`**.


*   **Command Completion**: `vf <TAB>` -> `ai`, `diary`, `search`, `tag`, `init`
*   **Tag Completion**: `vf ai <TAB>` -> List of tags in Vault
*   **Option Completion**: `vf ai -<TAB>` -> `-p`, `-m`, `-i`, `-f` ...
*   **Value Completion**:
    *   `vf ai -p <TAB>` -> `general`, `debug`, `xpost`
    *   `vf ai -m <TAB>` -> `gpt-4`, `gemini-pro` ...
    *   `vf ai -f <TAB>` -> List of files in current directory

[↑ Top](#top)
---

### 🤝 Contributing

Bug reports and feature suggestions are welcome via Issue or Pull Request.

### 📜 License
MIT License
