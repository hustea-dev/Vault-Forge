# obsidian-ai-cli

Obsidian、Google Gemini、そして X (旧 Twitter) を統合し、メモ作成と知識共有のワークフローを加速させるCLIツールです。

## 特徴

-   **シームレスな統合**: ターミナルからのテキスト入力を、Obsidian Vault に直接保存します (`debug` と `xpost` モード)。
-   **AIによる解析**: Google Gemini を活用し、選択したモードに応じてコンテンツの要約、デバッグ、または再利用を行います。
-   **複数のモード**:
    -   **General (`ai`)**: ターミナル上で直接テキストを要約・解析します。**Obsidianには保存されません。**
    -   **Debug (`debug`)**: エラーログを解析し、セッションをObsidianに保存します。
    -   **X-Post (`xpost`)**: ノートからツイートの下書きを生成し、セッションをObsidianに保存します。
-   **柔軟な入力**: ファイルパスの指定と標準入力（パイプ）の両方に対応しています。
-   **カスタマイズ可能なプロンプト**: AIへの指示や言語設定を簡単に変更できます。

## 前提条件

1.  **Node.js**: v18 以上。
2.  **環境変数**: プロジェクトルートに `.env` ファイルを作成し、以下のキーを設定してください:

    ```
    # .env
    GEMINI_API_KEY="YOUR_GOOGLE_GEMINI_API_KEY"
    
    # Obsidian Vaultの絶対パスを指定してください
    OBSIDIAN_VAULT_PATH="/home/user/Documents/ObsidianVault"

    # 言語設定 (ja または en)
    APP_LANG="ja"

    # X-Post モードを使用する場合に必要
    X_API_KEY="YOUR_X_APP_API_KEY"
    X_API_SECRET="YOUR_X_APP_API_SECRET"
    X_ACCESS_TOKEN="YOUR_X_APP_ACCESS_TOKEN"
    X_ACCESS_SECRET="YOUR_X_APP_ACCESS_SECRET"
    ```

## インストールとセットアップ

1.  **リポジトリをクローン:**

    ```sh
    git clone https://github.com/Yoshinori-Imada/obsidian-ai-cli.git
    cd obsidian-ai-cli
    ```

2.  **依存関係をインストール:**

    ```sh
    npm install
    ```

3.  **シェルエイリアスの設定:**
    `.bashrc` や `.zshrc` などの設定ファイルに以下を追加して、便利なコマンドを作成します。

    ```sh
    # ~/.zshrc または ~/.bashrc

    # クローンしたリポジトリの絶対パスを設定してください
    export OBSIDIAN_AI_CLI_PATH="/path/to/your/obsidian-ai-cli"

    # エイリアス
    alias ai='npx ts-node $OBSIDIAN_AI_CLI_PATH/src/index.ts --mode=general'
    alias xpost='npx ts-node $OBSIDIAN_AI_CLI_PATH/src/index.ts --mode=xpost'
    alias debug='npx ts-node $OBSIDIAN_AI_CLI_PATH/src/index.ts --mode=debug'
    ```
    *編集後は必ずシェル設定を再読み込み (`source ~/.zshrc`) してください。*

## 設定とカスタマイズ

### 言語の切り替え

`.env` ファイルの `APP_LANG` 環境変数を設定することで、出力言語とデフォルトのプロンプトを日本語と英語で切り替えることができます。

```bash
# .env
APP_LANG="ja" # 日本語に設定 (デフォルトは英語の場合があります)
# APP_LANG="en" # 英語に設定
```

### プロンプトのカスタマイズ

Geminiに送信されるシステムプロンプトを、自分のワークフローに合わせて自由にカスタマイズできます。
`src/config/locales/` 内にある以下のファイルを編集してください。

-   **日本語**: `src/config/locales/ja.ts`
-   **英語**: `src/config/locales/en.ts`

例えば、**Generalモード** の挙動を変えたい場合は、`prompts.general` フィールドを編集します。

```typescript
// src/config/locales/ja.ts
export const TEXT = {
    prompts: {
        // ここを好きな指示に変更できます！
        general: "以下の内容を慣習に従って厳格に、かつ、優しく人が傷つかないように丁寧に説明して。", 
        // ...
    },
    // ...
};
```

これにより、各モードにおけるAIの「人格」や出力フォーマットを細かく調整することが可能です。

## 使い方

### コマンド構文

このツールはシンプルなコマンド構造に従います:

```sh
<command> [file] [instruction] [options]
```

-   **`<command>`**: `ai`, `xpost`, または `debug`。
-   **`[file]`** (任意): 解析するテキストファイルのパス。省略した場合、ツールは標準入力（パイプ）からの入力を待ちます。
-   **`[instruction]`** (任意): AIへの追加指示。

### コマンドとオプション

| コマンド | `--mode`  | 説明                                                                 |
| :------ | :-------- | :-------------------------------------------------------------------------- |
| `ai`    | `general` | **通常モード**: テキストを要約または解析します。(デフォルト、Obsidianには保存されません) |
| `xpost` | `xpost`   | **X投稿モード**: テキストからツイート案を作成し、セッションをObsidianに保存します。    |
| `debug` | `debug`   | **デバッグモード**: エラーログを解析し、セッションをObsidianに保存します。                 |

| 引数 / オプション        | 短縮形 / エイリアス      | 説明                               |
| :----------------------- | :---------------------- | :---------------------------------------- |
| `[file]`                 | (なし)                  | 入力テキストファイルのパス。              |
| `[instruction]`          | (なし)                  | AIへの追加指示。        |
| `--file=<path>`          | (なし)                  | 入力ファイルを明示的に指定します。        |
| `--instruction=<text>`   | `-i=<text>`, `--inst=<text>` | AIへの指示を明示的に指定します。    |

### 使用例

#### **通常モード (`ai`)**

```sh
# Geminiとチャットする（ファイルもパイプも使わない）
ai "今日の調子はどう？"

# ファイルを要約（ターミナルに出力のみ）
ai my-notes.md

# パイプからのテキストを要約
cat my-notes.md | ai

# 追加指示付きで要約
ai my-notes.md "3つの箇条書きで要約して"

# パイプと追加指示を使用
cat my-notes.md | ai "この記事の主な結論は何？"
```

#### **X投稿モード (`xpost`)**

```sh
# 記事からツイート案を作成（Obsidianに保存されます）
xpost ./posts/my-article.md

# クリップボードの内容から案を作成
pbpaste | xpost

# 具体的な指示付きで案を作成（オプション指定）
xpost my-article.md --instruction="エンジニア向けに、少しユーモアを交えて"

# ショートハンド (-i) を使った場合
xpost my-article.md -i="エンジニア向けに、少しユーモアを交えて"

# オプションを省略した場合（最もシンプル）
xpost my-article.md "エンジニア向けに、少しユーモアを交えて"
```

#### **デバッグモード (`debug`)**

```sh
# エラーログファイルを解析（Obsidianに保存されます）
debug error.log

# パイプからログを解析
kubectl logs my-pod | debug
```

## ライセンス

このプロジェクトはMITライセンスの下で公開されています。詳細は [LICENSE](LICENSE) ファイルをご覧ください。
