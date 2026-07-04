# 実装計画: Langiumによるフルパーサへの移行

## 1. カスタムLexerの開発 (`src/spd/langium/spd-lexer.ts`)
- `DefaultLexer` を拡張し、`tokenize` メソッドをオーバーライドする。
- ソースコードの各行の先頭のタブ(`\t`)をカウントし、前行の深さとの差分に基づいて `INDENT` または `DEDENT` トークンを挿入する。
- DI設定 (`src/spd/langium/spd-module.ts`) にカスタムLexerを登録する。

## 2. グラマーの更新 (`src/spd/langium/spd.langium`)
- `INDENT` / `DEDENT` をターミナルとして定義する。
- 階層構造を表現するための `Block` ルールを追加する。
- 各種コマンド (`IfStatement`, `WhileStatement` 等) に、オプショナルな `block` フィールドを追加する。
- インデント構造を含めたコメントやマルチラインコンテンツを適切に扱えるよう、ターミナルルールの順序（`LINE_COMMENT` と `Content`）を調整する。

## 3. AST変換ロジックの実装 (`src/spd/parser.ts`)
- 行単位で回していた `while` ループ処理を廃止し、Langiumが生成した `Model` 内の `statements` を再帰的に処理する `processBlock` 関数を実装する。
- 各ASTノードの型（`isIfStatement`, `isProcessStatement` 等）に応じた判定処理を行い、従来の内部フォーマット(`Node`)にマッピングする。
- `Content` 末尾の `@` 記号による改行指定や、テキストのクリーニング処理（先頭タブの除去など）を再実装する。

## 4. エラーハンドリングとテスト修正
- Langiumのパーサエラー (`parseResult.parserErrors`) を検知し、未定義のコマンド (`UnknownCommandException`) やインデント違反 (`IllegalIndentException`) などの既存例外に変換してスローする仕組みを構築。
- 引数の不要なコマンド（例: `:else`）に引数が渡された場合や、異常なブロック構成に対する例外を再現する。
- `npm run test` により、全252件の単体・E2Eテストがパスすることを確認し、後方互換性を100%保証する。
