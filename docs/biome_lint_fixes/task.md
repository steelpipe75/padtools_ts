# タスク: npm run check の指摘事項修正

## 概要
`npm run check`（Biome）で検出されたエラー2件、警告18件、情報2件の全指摘を修正し、`npm run check` が警告・エラーなく通過することを確認する。

## タスクリスト
- [x] 実装計画の作成 <!-- id: 0 -->
- [x] `biome.json` の `$schema` バージョン更新 <!-- id: 1 -->
- [x] `web/index.html` のアクセシビリティ指摘 (`noAriaHiddenOnFocusable`) 修正 <!-- id: 2 -->
- [x] `web/index_styles.css` の CSS 詳細度順序指摘 (`noDescendingSpecificity`) 修正 <!-- id: 3 -->
- [x] `web/src/editor-worker.ts` の `@ts-ignore` -> `@ts-expect-error` 修正 <!-- id: 4 -->
- [x] `web/src/main.ts` の指摘修正 (`organizeImports`, `@ts-expect-error`, `useArrowFunction`, `noExplicitAny`) <!-- id: 5 -->
- [x] `web/src/spd-lsp-client.ts` の指摘修正 (`noUselessConstructor`, `useOptionalChain`, `noNonNullAssertion`, `noExplicitAny`) <!-- id: 6 -->
- [x] `npm run check` および `npm test` による検証 <!-- id: 7 -->
- [x] Walkthrough ドキュメントの作成 <!-- id: 8 -->
