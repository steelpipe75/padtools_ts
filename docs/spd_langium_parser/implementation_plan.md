# 実装計画

1. **Langium環境のセットアップ**
   - 必要な依存関係のインストール（langium, langium-cli はnpm installで追加済み）。
   - Langium用の設定ファイル（`langium-config.json`など）を作成する。

2. **文法定義 (Grammar)**
   - `src/spd/langium/spd.langium` を作成し、文法ルールを定義する。
   - インデント（タブ）による階層構造を表現するための字句解析・構文解析ルールを定義する。
   - コマンド（`:if`, `:while`, `:call`等）と通常のプロセス行を区別する。

3. **AST変換処理 (Mapper)**
   - Langiumが生成したASTから、既存の `src/spd/ast.ts` の構造へ変換する処理を作成する。

4. **パーサーの置き換え**
   - `src/spd/parser.ts` を修正し、Langiumを用いたパース処理と変換処理を呼び出すように変更する。

5. **テストと動作検証**
   - 既存のテストがパスすることを確認し、必要に応じて微調整を行う。
