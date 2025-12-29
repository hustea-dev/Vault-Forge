# Vault-Forge

**AIと共に、Obsidian Vaultから新しい発想を鍛造（Forge）する。**

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

### 使用例

#### **通常モード (`ai`)**
```sh
ai "今日の調子はどう？"
cat my-notes.md | ai "要約して"
```

#### **X投稿モード (`xpost`)**
```sh
xpost ./posts/my-article.md
```
<p align="center">
  <img src="assets/xpost_demo.gif" alt="xpost demo" width="600">
</p>

#### **デバッグモード (`debug`)**
```sh
debug error.log
kubectl logs my-pod | debug
```
<p align="center">
  <img src="assets/debug_demo.gif" alt="debug demo" width="600">
</p>

## プロンプトのカスタマイズ

Geminiに送信されるシステムプロンプトを、Obsidian Vault内のMarkdownファイルとして直接編集できます。
`_AI_Prompts/prompts/{lang}/` 内のファイルを編集してください。

<p align="center">
  <img src="assets/customprompt.png" alt="custom prompt" width="600">
</p>

## ライセンス

MIT License
