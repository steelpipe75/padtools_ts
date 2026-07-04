# 実装計画: Langiumを用いたフルパーサー化

## 1. `spd.langium` の拡張
- エントリールールを `Model` (statements+=Statement*) に変更する。
- ターミナルとして `INDENT`, `DEDENT` を追加。
- 各 Statement に対して、省略可能な `Block` (INDENT statements+=Statement+ DEDENT) を持たせる。
- `Content` の正規表現を修正し、`@` による行の継続をサポートする。

## 2. TokenBuilder の実装
- `spd-token-builder.ts` を新規作成し、Langiumの `TokenBuilder` を継承・カスタマイズする。
- 行頭のタブ文字を数え、前の行のタブ数との差分から `INDENT` と `DEDENT` を合成して出力する。
- `spd-module.ts` にてDIを構成する。

## 3. parser.ts の修正
- Langiumのパーサーを呼び出し、全体を一度にパースする。
- エラーハンドリング（字句解析・構文解析エラーの捕捉）を行う。
- `Model` をトップダウンでトラバースし、SPDの既存のAST `Node`（IfNode, SwitchNode, ProcessNode 等）に変換するロジックを実装する。
- Context, stack, tabsのカウントなどの自前実装をすべて削除する。

## 4. テストと動作確認
- コンパイル (npm run build あるいは npm run langium:generate)
- テスト (npm run test) の実行と通過確認。
