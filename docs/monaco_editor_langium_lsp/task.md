# タスクリスト: WebアプリのMonaco Editor化とLangium LSP連携

## 概要
Webアプリ（`web/`）のテキスト入力欄を `textarea` から Monaco Editor に置き換え、Langium で構築された LSP（Language Server Protocol）と Web Worker 経由で連携させる。

---

## タスク一覧

- [/] 1. 準備・環境構築 <!-- id: 1 -->
  - [x] 依存関係のインストール（`monaco-editor`） <!-- id: 1-1 -->
  - [x] SWC環境依存の修正とテスト確認 <!-- id: 1-2 -->
  - [x] 実装計画書（`implementation_plan.md`）とタスクリスト（`task.md`）の作成 <!-- id: 1-3 -->
- [ ] 2. Langium LSP サービスおよび Web Worker の実装 <!-- id: 2 -->
  - [ ] `src/spd/langium/spd-module.ts` に LSP モジュール（`createSpdServices`）の定義を追加 <!-- id: 2-1 -->
  - [ ] ブラウザ Web Worker 用の LSP サーバーエントリポイント（`web/src/spd-lsp-worker.ts`）を作成 <!-- id: 2-2 -->
  - [ ] `package.json` の alias / ビルド設定の調整（Worker解決・ブラウザ向けLSPモジュール） <!-- id: 2-3 -->
- [ ] 3. Monaco Editor の導入と UI / 機能の統合 <!-- id: 3 -->
  - [ ] `web/index.html` および `web/index_styles.css` の改修（`<textarea id="spdInput">` から Monaco コンテナへ差し替え、レイアウト調整） <!-- id: 3-1 -->
  - [ ] Monaco Editor のワーカー設定（`editor.worker.js`）および言語（`spd`）登録 <!-- id: 3-2 -->
  - [ ] `web/src/main.ts` のエディタ制御の移行（内容変更検知、リアルタイムSVG描画、共有URL読み込み、ファイルインポート/エクスポート） <!-- id: 3-3 -->
- [ ] 4. Monaco Editor と Langium LSP の接続 <!-- id: 4 -->
  - [ ] Web Worker と Monaco Editor 間の通信（LSPメッセージハンドリング）の実装 <!-- id: 4-1 -->
  - [ ] 診断情報（Diagnostics: 文法・構文エラーの波線表示）の Monaco への反映 <!-- id: 4-2 -->
  - [ ] コード補完（Completion: コマンド名 `:if`, `:while` 等）の連携 <!-- id: 4-3 -->
  - [ ] シンタックスハイライト（Monarch または Semantic Tokens）の設定 <!-- id: 4-4 -->
- [ ] 5. 検証とドキュメント作成 <!-- id: 5 -->
  - [ ] ビルド検証（`npm run build:web`, `npm run build`） <!-- id: 5-1 -->
  - [ ] 既存テストおよび Web アプリ動作検証（Playwright / Jest） <!-- id: 5-2 -->
  - [ ] 変更内容の確認書（`walkthrough.md`）の作成 <!-- id: 5-3 -->
