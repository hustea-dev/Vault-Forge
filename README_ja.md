# Vault-Forge

**AIと共に、Obsidian Vaultから新しい発想を（Forge）鍛える。**

Vault-Forgeは、ターミナルワークフローとObsidian、そしてAI (Google Gemini) をシームレスに統合するCLIツールです。
ふとしたメモ、ログ、アイデアをキャプチャし、AIで処理してVaultに保存することで、クリエイティブな発想を鍛える場として活用できます。

## 特徴

-   **シームレスな統合**: ターミナルからのテキスト入力を、Obsidian Vault に直接保存・整理します。
-   **AIによる解析**: Google Gemini を活用し、コンテンツの要約、デバッグ、再利用を行います。
-   **複数のモード**:
    -   **General (`ai`)**: ターミナル上で直接テキストを要約・解析します。
    -   **Debug (`debug`)**: エラーログを解析し、セッションをObsidianに保存します。
    -   **X-Post (`xpost`)**: ノートからツイートの下書きを生成し、セッションをObsidianに保存します。
-   **柔軟な入力**: ファイルパスの指定と標準入力（パイプ）の両方に対応しています。
-   **カスタマイズ可能なプロンプト**: AIへの指示をObsidian上（`_AI_Prompts/`）から直接編集できます。
-   **対話型CLI**: 投稿候補の選択やアクションの確認を対話的に行えます。

## 前提条件

1.  **Node.js**: v18 以上。
2.  **環境変数**: プロジェクトルートに `.env` ファイルを作成してください:

    ```
    # .env
    GEMINI_API_KEY="YOUR_GOOGLE_GEMINI_API_KEY"
    OBSIDIAN_VAULT_PATH="/path/to/your/ObsidianVault"
    APP_LANG="ja" # or "en"

    # X-Post モードを使用する場合に必要
    X_API_KEY="YOUR_X_APP_API_KEY"
    X_API_SECRET="YOUR_X_APP_API_SECRET"
    X_ACCESS_TOKEN="YOUR_X_APP_ACCESS_TOKEN"
    X_ACCESS_SECRET="YOUR_X_APP_ACCESS_SECRET"
    ```

## インストールとセットアップ

1.  **リポジトリをクローン:**
    ```sh
    git clone https://github.com/your-username/vault-forge.git
    cd vault-forge
    ```

2.  **依存関係をインストール:**
    ```sh
    npm install
    ```

3.  **シェルエイリアスの設定:**
    `.bashrc` や `.zshrc` に以下を追加します:

    ```sh
    export VAULT_FORGE_PATH="/path/to/vault-forge"
    alias vf='npx ts-node $VAULT_FORGE_PATH/src/index.ts'
    alias ai='vf --mode=general'
    alias xpost='vf --mode=xpost'
    alias debug='vf --mode=debug'
    ```

## 使い方

```sh
vf --mode=<mode> [file] [instruction]
```

## 各モードの詳細

### 1. 通常モード (`ai`)
最も汎用的なモードです。入力されたテキストをAIに送信し、応答を表示します。
要約、翻訳、校正、ちょっとした質問などに便利です。

**使用例:**
```sh
# 直接質問する
ai "フランスの首都は？"

# テキストファイルを要約する
cat long_document.txt | ai "3行で要約して"
```

### 2. デバッグモード (`debug`)
開発者向けに設計されています。エラーログを解析し、根本原因と解決策を提示します。
解析結果は自動的にObsidian Vault (`Inbox/YYYY-MM-DD/log_HHMMSS.md`) に保存されます。

**使用例:**
```sh
# ログファイルを解析
debug error.log

# 他のコマンドの出力をパイプで渡す
kubectl logs my-pod | debug
```

### 3. X投稿モード (`xpost`)
Obsidianのノートを元に、SNS (X/Twitter) 向けの投稿案を作成します。
ハッシュタグ付きの複数のドラフトが生成され、対話的に選択・再生成・投稿が可能です。

**主な機能:**
-   **対話的選択**: AIが生成した3つの案から選択できます。
-   **再生成**: 気に入らない場合は、何度でも作り直せます。
-   **保存して終了**: 投稿せずに、ドラフトをObsidianに保存して終了することも可能です。

**使用例:**
```sh
xpost ./posts/my-new-article.md
```

## プロンプトのカスタマイズ

Geminiに送信されるシステムプロンプトを、Obsidian Vault内のMarkdownファイルとして直接編集できます。

### 仕組み
1.  **自動生成**: 各モードを初めて実行した際に、Obsidian Vault内にプロンプトファイルが自動生成されます。
2.  **保存場所**: `_AI_Prompts/prompts/{lang}/` ディレクトリに保存されます。
    -   `general.md`: 通常モード用
    -   `debug.md`: デバッグモード用
    -   `xpost.md`: X投稿モード用
3.  **編集**: ObsidianでこれらのMarkdownファイルを編集するだけで、次回の実行から即座に反映されます。

<p align="center">
  <img src="assets/customprompt.png" alt="custom prompt" width="600">
</p>

## ライセンス

MIT License
