# 実装計画: Langiumによるパーサー移行

## 1. 開発環境の準備
- `feature/langium-spd-parser` ブランチを作成する。
- Langiumのパッケージ (`langium`, `langium-cli`) をインストールする。
- Langiumジェネレータの最小設定ファイル (`langium-config.json`) を作成する。

## 2. Grammar (文法) の定義
- 既存のコマンド体系 (`:if`, `:while`, `:process` など) をLangiumの文法ファイル (`src/spd/langium/spd.langium`) に定義する。
- 既存ロジックに合わせて、行単位のパースが可能なように `Statement` をエントリーポイントとする。
- Lexerによる予約語とターミナルパターンの競合を避けるため、正規表現を用いた厳格なトークン定義を行う。

## 3. パーサーの実装と統合
- `npx langium generate` を実行し、TypeScriptのASTインターフェースとパーサーを自動生成する。
- `src/spd/langium/spd-module.ts` を作成し、ジェネレータが生成したモジュールと組み合わせてLangiumサービスを提供する。
- `src/spd/parser.ts` の `handleBody` 関数を改修し、正規表現によるマッチングから、Langiumパーサーによる判定 (`LangiumParser.parse`) と型ガード (`isIfStatement` など) を使ったAST構築へと置き換える。

## 4. テストと修正
- `npm run test` を実行し、既存のすべてのテスト（CLI E2E、ユニットテスト等）が成功することを確認する。
- Jest環境でLangium関連のESMモジュール群（`langium`, `chevrotain`, `lodash-es`など）が正しく解決・トランスパイルされるように `jest.config.cjs` の設定を調整する。
