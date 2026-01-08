[🇺🇸 English](https://github.com/hustea-dev/Vault-Forge/blob/main/README.md)

<a id="top"></a>
# Vault-Forge v2.0

**Obsidian × Terminal × AI**
Vault-Forge は、Obsidian の Vault をターミナルから直接操作し、生成 AI の力を借りて知的生産を加速させるための CLI ツールです。

v2.0 ではアーキテクチャを刷新し、**マルチAIサポート**、**高速検索**、**日記機能** を搭載しました。

## 目次 (Table of Contents)

1.  [🚀 v2.0 の新機能](#-v20-の新機能)
2.  [📦 インストールと準備](#-インストールと準備)
3.  [📖 コマンドガイド](#-コマンドガイド)
    *   [1. 📔 日記・メモ (`vf diary`)](#1--日記メモ-vf-diary)
    *   [2. 🔍 検索 (`vf search`)](#2--検索-vf-search)
    *   [3. 🤖 AI解析・生成 (`vf ai`)](#3--ai解析生成-vf-ai)
    *   [4. 推奨エイリアス設定(`Aliases`)](#4-推奨エイリアス設定Aliases)
4.  [🛠️ カスタマイズ (The Forge)](#️-カスタマイズ-the-forge)
5.  [📊 トークン管理](#-トークン管理)
6.  [⌨️ シェル補完 (Completion)](#️-シェル補完-completion)

---

## 🚀 v2.0 の新機能

*   **🧠 マルチAIサポート**: Gemini, OpenAI, Groq, Claude をモードごとに自由に使い分け可能。
*   **📔 Diaryモード**: `jrnl` ライクな爆速メモ機能。タスク化やタグ付けもCLIから一発。
*   **🔍 Searchモード**: `ripgrep` を活用した爆速検索。Vim などのエディタや Obsidian で直接開けます。
*   **⚙️ 設定の自動化**: AIモデルリストやタグは、使えば使うほど `json` に学習され、補完候補が育ちます。
*   **📄 Obsidianファースト**: プロンプトも設定もすべて Obsidian のノートとして管理。

[↑ Top](#top)
---

## 📦 インストールと準備

### 1. 必須要件
*   Node.js (v18以上推奨)
*   Obsidian
*   (推奨) `ripgrep`: 高速検索モードを利用する場合 (`brew install ripgrep` 等)

### 2. インストール
npm パッケージとしてインストールします。

```sh
npm install -g vault-forge
```
### 開発環境でのセットアップ
リポジトリをクローンして使用する場合：
```bash
git clone https://github.com/your-repo/vault-forge.git
cd vault-forge
npm install
npm run build
npm link # vf コマンドをグローバルにリンク
```

### 3. 環境変数の設定
プロジェクトルートに `.env` ファイルを作成します（`.env.example.ja` を参照）。

### 3.1 環境変数の設定

まず、プロジェクトルートにある `.env.example` をコピーして `.env` ファイルを作成し、必要な設定を行ってください。

```bash
cp .env.example .env
nano .env # またはお好みのエディタで編集
```
`.env` ファイルには以下の情報を設定します：
*   `OBSIDIAN_VAULT_PATH`: あなたの Obsidian Vault の絶対パス
*   各AIプロバイダーの API キー (`OPENAI_API_KEY`, `GEMINI_API_KEY` など)

```sh
# 必須: Obsidian Vaultのパス
OBSIDIAN_VAULT_PATH=/absolute/path/to/your/vault

# 任意: 言語設定 (ja/en)
APP_LANG=ja

# 任意：エディター設定 ripgrep使用時のみ有効
# obsidianではなく、デフォルトのエディターからmdファイルへアクセスします。
EDITOR=code
# EDITOR=vim

# AI APIキー (使用するものだけでOK)
GEMINI_API_KEY=...
OPENAI_API_KEY=...
GROQ_API_KEY=...
CLAUDE_API_KEY=...
```

### 4. 初期化 (`vf init`)
最初に必ず実行してください。必要なディレクトリや設定ファイルを Vault 内に生成します。

```sh
vf init
```

対話モードで、各モード（general, debug, xpost）で使用する **AIプロバイダー** と **モデル** を設定できます。
ここで入力したモデル名は `_AI_Prompts/ai-models.json` に保存され、次回から選択肢として表示されます。

[↑ Top](#top)
---

## 📖 コマンドガイド

### 1. 📔 日記・メモ (`vf diary`)
Obsidian の Daily Note (`Daily/YYYY-MM-DD.md`) に素早く追記します。※ **AI は使用しません。**

**基本:**
```sh
vf diary "素晴らしいアイデアを思いついた"
# -> - **HH:MM** 素晴らしいアイデアを思いついた
```

**対話モード (引数なし):**
```sh
vf diary
# -> 入力プロンプトが起動。日本語入力も快適。
```

**便利な機能:**
*   **タスク化**: `-t` オプション、または `#task` / `#todo` を含めると、チェックボックス (`- [ ]`) 付きで保存。
    ```sh
    vf diary -task "牛乳を買う" # -> [ ] 牛乳を買う
    vf diary -t 牛乳を買う # -> [ ] 牛乳を買う
    vf diary "牛乳を飲む #task" # -> [ ] 牛乳を飲む #task
    ```
*   **見出し**: `#h2` や `#見出し2` を含めると、Markdown の見出しとして保存。
    ```sh
    vf diary "プロジェクトAIについて #h2" # -> ## プロジェクトAIについて 
    vf diary "プロジェクトAIについて #見出し２" #
    ```
*   **タグ**: `#tag` は自動的に抽出され Obsidianの本文に#タグとして記録されます。
    ```sh
    vf diary "今日は新しいCLIツールの設定をした #dev" 
    # ->  **16:10** 今日は新しいCLIツールの設定をした #dev 
    ```
## 2. 🔍 検索 (`vf search` `vf tag`)
Vault 内のファイルを高速検索します。エイリアス `vf s` も使用可能です。※ **AIは使用しません。**

※ 検索機能は.envファイルで`OBSIDIAN_VAULT_PATH=`で設定されているディレクトリ内だけを検索します。

```sh
vf search "検索ワード"
vf s 検索ワード
```
* **エディタ連携**:

  `ripgrep`がインストールされていれば、環境変数 `EDITOR` (例: `export EDITOR=code`)  で設定されているエディタを使用して、Vault内のファイルを開きます。
  
  `ripgrep`のインストールと`EDITOR`の設定がない場合は Obsidian で開きます。

### tagについて：
**タグ検索:**
```bash
vf tag test
```
`#test` タグが「本文に」含まれているノートを検索します。

### 4.3 日記・メモ (`vf diary`)

```bash
vf diary "今日は新しいCLIツールの設定をした #dev"
```
Obsidian のデイリーノートに追記されます。`-t` オプションを付けるとタスクとして追加されます。

このタグ機能と検索の機能を組み合わせることで、Vault内のアイデアを

        タグで記録 -> タグで検索 -> 編集 -> 本文入力 -> 本文検索

のように、ターミナル上からスムーズに行うことができます。


### 3. 🤖 AI解析・生成 (`vf ai`)
AI を使ってテキスト処理を行います。プリセット（モード）によって挙動が変わります。

**基本:**
```shell
vf ai "AIに聞きたいこと" 
```        

**プリセットの指定 (`-p` / `--preset`):**
*   **general** (デフォルト): 一般的な質問や文章生成。
    ```sh
    vf ai --preset general --instruction "AIに聞きたいこと"
    vf ai -p general -i "AIに聞きたいこと"
    vf ai -p general AIに聞きたいこと # -iは省略も出来ます
    ```
*   **debug**: エラーログやコードを解析。
    ```sh 
    vf ai -preset debug "【WARN】エラーが発生これはエラーログです！！..."
    vf ai -p debug -f error.log エラーログを解析して 
    cat error.log | vf ai -p debug # パイプで渡すこともできます
    ```
*   **xpost**: メモから X (Twitter) 用の投稿案を作成し、そのまま投稿まで可能。
    ```sh 
    vf ai -p xpost -f blog.md "エンジニア向けにユーモアを交えて"
    
    # バックグラウンド時は投稿案がVaultに保存されて終了する（自動では投稿しません）
    vf ai -p xpost -f blog.md --detach "エンジニア向けにユーモアを交えて"     
    ```

**オプション:**
*   `-f, --file <path>`: ファイルの内容を入力とする。
*   `-i, --instruction <text>`: 追加の指示を与える。
*   `-d, --detach`: バックグラウンドで実行する（結果はログファイルに保存）。
*   `-m, --model <name>`: 使用するモデルを一時的に変更する。

### 4. 推奨エイリアス設定(`Aliases`)
Vault-Forge をさらに便利に使うために、以下のようなエイリアスをシェル設定ファイル (`.zshrc` や `.bashrc`) に追加することを推奨します。

```bash
# ~/.zshrc または ~/.bashrc に追記

# 基本的なAI解析 (Generalプリセット)
alias ai='vf ai -p general'

# X (Twitter) 投稿作成プリセット
alias xpost='vf ai -p xpost'

# エラーログ解析プリセット
alias debug='vf ai -p debug'

# 日記作成
alias diary='vf diary'

# 検索
alias search='vf search'
```

設定を反映させるには、シェルを再起動するか `source ~/.zshrc` を実行してください。

### 4.1 応用: エイリアスとパイプの組み合わせ

推奨エイリアスを設定していれば、さらに直感的に操作できます。

**ブログ記事から X 投稿案を作成:**
```bash
cat blog_draft.md | xpost 親しみやすいトーンで
```

**Kubernetes のログを解析:**
```bash
kubectl logs my-pod | debug 異常なログはある?
```

**Git の差分からコミットメッセージ案を作成:**
```bash
git diff | ai コミットメッセージを考えて
```

[↑ Top](#top)
---

## 🛠️ カスタマイズ (The Forge)

Vault-Forge の最大の特徴は、**設定やプロンプトを Obsidian 上で管理できる** ことです。

### プロンプトの編集
`vf init` を実行すると、Vault 内の `_AI_Prompts/prompts/ja/` にプロンプトファイル（Markdown）が生成されます。

これを Obsidian で編集することで、AI の挙動を自由自在にカスタマイズできます。

**例: `xpost.md`**

<img src="assets/customprompt.png" alt="Demo Image" width="600">

**AIの切り替え**: 
*   Obsidianのヘッダーにあるmodelという箇所に直接使用するAIモデルを記述して変更することができます。

    <img src="assets/aimodel.png" alt="Demo Image" width="600">
    
* コマンドライン上からも`-m`や `--model` のオプションを使って、そのモードで使う AI を変更できます。
    ```sh 
    vf ai -m <TAB> # -> タブを押すとモデル名が候補として表示されます
    claude-haiku-4-5      gemini-2.0-flash  ... 
    ```
*   **タグ補完**: `vf init` 時にObsidianのタグにモデル名が含まれているため、Obsidian 上で `#` を入力するとモデル名が補完されます。

    （モデル名の登録には#を付けないようにご注意ください。）

### AIモデルの追加
新しいモデル（例: `gpt-7`）を使いたい場合は、以下のいずれかの方法で追加できます。

1.  **`vf init` で追加**: モデル選択時に `Custom` を選び、手入力する。
2.  **JSONを編集**: `_AI_Prompts/ai-models.json` を直接編集する。
3.  **Onsidianから編集**： Obsidianのプロンプトを直接編集する。
3.  **コマンドで実行**: `vf ai -m gpt-7 "test"` のように未登録モデルを指定して実行すると、自動的にプロバイダーを推測して登録されます。
    ```sh
    vf ai -m gpt-7 "Gpt-7は使えますか？"
    ```
コードを書き換える必要はありません。

[↑ Top](#top)
---

## 📊 トークン管理
AI の使用量は `_AI_Prompts/TokenUsage/` に自動的に記録されます。
Obsidian 上で Mermaid チャートとして可視化されるため、コスト管理も万全です。

<img src="assets/tokenusage.png" alt="Demo Image" width="400">

[↑ Top](#top)
---

## ⌨️ シェル補完 (Completion)
`tabtab` による強力な補完機能を提供しています。

```sh
vf completion
```

通常は `vf init` の最後で自動的にセットアップされますが、手動で設定する場合は上記コマンドを実行してください。
これにより、コマンド、プリセット、オプション、そして **`tags.json` に記録されたハッシュタグ** の補完が可能になります。


*   **コマンド補完**: `vf <TAB>` -> `ai`, `diary`, `search`, `tag`, `init`
*   **タグ補完**: `vf ai <TAB>` -> Vault内のタグ一覧
*   **オプション補完**: `vf ai -<TAB>` -> `-p`, `-m`, `-i`, `-f` ...
*   **値補完**:
    *   `vf ai -p <TAB>` -> `general`, `debug`, `xpost`
    *   `vf ai -m <TAB>` -> `gpt-4`, `gemini-pro` ...
    *   `vf ai -f <TAB>` -> カレントディレクトリのファイル一覧

[↑ Top](#top)
---

### 🤝 Contributing

バグ報告や機能追加の提案は Issue または Pull Request でお待ちしています。

### 📜 License
MIT License
