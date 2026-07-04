# 修正内容の確認 (Walkthrough)

## カスタムLexerの登録と設定
- **`src/spd/langium/spd-lexer.ts`**: インデントレベルの増減を計算し、`INDENT` トークンと `DEDENT` トークンをChevrotainのトークン列の適切な位置に挿入する `SpdLexer` クラスを実装しました。
- **`src/spd/langium/spd-module.ts`**: Langiumの依存性注入コンテナ (`SpdModule`) の `parser.Lexer` に `SpdLexer` を割り当て、カスタムLexerが動作するようにしました。

## Langiumグラマーの最適化
- **`src/spd/langium/spd.langium`**:
  - `Block: INDENT (statements+=Statement)+ DEDENT;` という階層ルールを定義しました。
  - 各種ステートメントに対して `(block=Block)?` を追加し、構文レベルでブロックをパース可能にしました。
  - `LINE_COMMENT` の定義順を `Content` の前に移動することで、コメント行が誤って `ProcessStatement` として解析される不具合を解消しました。
  - `:else` 文に対しては引数を持たないことを明示し、曖昧さを排除しました。

## パーサ本体のリファクタリング
- **`src/spd/parser.ts`**:
  - `processBlock(statements)` 関数を新設し、LangiumのASTを再帰的にトラバースして `Node` 群を生成するアーキテクチャに刷新しました。
  - `cleanText` ヘルパー関数を追加し、Lexerで抽出された生テキストから先頭タブの削除や、`@` によるマルチライン指定の結合などを一貫して処理できるようにしました。
  - 構文エラー発生時、エラーメッセージに含まれるキーワード（`INDENT` や `synthetic:indent` など）を元に、従来の `IllegalIndentException` 等へ適切にマッピングしてスローするようにしました。
  - `:else` 文に対する `NotRequireArgumentException` や、不正な `:case` に対する例外など、細かいバリデーションを `processBlock` 内に実装しました。

## テストスイートのパス
- これらの修正により、パーサ本体のエラーハンドリングや出力AST構造が古い正規表現パーサの仕様と完全に一致するようになり、全ての単体テスト・E2Eテストがグリーンになりました。
