# 実装計画: npm run check の指摘事項修正

`npm run check` (Biome 2.5.15) で検出された全指摘を修正するための計画書。

## 修正対象一覧と方針

### 1. `biome.json`
- **指摘**: スキーマバージョン不一致 (`2.5.7` -> `2.5.15`)
- **対応**: `$schema` URL を `https://biomejs.dev/schemas/2.5.15/schema.json` に更新。

### 2. `web/index.html`
- **指摘**: `lint/a11y/noAriaHiddenOnFocusable`
- **対応**: 75行目の `<textarea id="spdInput" style="display: none;" aria-hidden="true"></textarea>` から不要な `aria-hidden="true"` を削除。

### 3. `web/index_styles.css`
- **指摘**: `lint/style/noDescendingSpecificity`
- **対応**: 詳細度の高いセレクタ `.display-mode-group input[type="radio"]:disabled + label` (0, 3, 2) を `index_styles.css` 内の末尾（他の label セレクタより後）に配置し、詳細度の降順を解消。

### 4. `web/src/editor-worker.ts`
- **指摘**: `lint/suspicious/noTsIgnore`
- **対応**: `// @ts-ignore` を `// @ts-expect-error` に置換。

### 5. `web/src/main.ts`
- **指摘**:
  1. `assist/source/organizeImports`: import 順序の不一致
  2. `lint/suspicious/noTsIgnore`: `@ts-ignore` の使用
  3. `lint/complexity/useArrowFunction`: `getWorker: function` の使用
  4. `lint/suspicious/noExplicitAny`: `(window as any).__spdEditor = editor;`
- **対応**:
  1. `import { registerSpdLanguage, SPD_LANGUAGE_ID } from "./spd-language";` に並び替え
  2. `@ts-expect-error` に置換
  3. アロー関数式にリファクタリング
  4. `declare global { interface Window { __spdEditor?: monaco.editor.IStandaloneCodeEditor; } }` で型定義を追加し、`window.__spdEditor = editor;` とする。

### 6. `web/src/spd-lsp-client.ts`
- **指摘**:
  1. `lint/complexity/noUselessConstructor`: 空のコンストラクタ
  2. `lint/complexity/useOptionalChain`: `!result || !result.contents`
  3. `lint/style/noNonNullAssertion`: `this.pendingRequests.get(message.id)!`
  4. `lint/suspicious/noExplicitAny`: 9箇所の `any` 使用
- **対応**:
  1. 不要な `constructor() {}` を削除
  2. `!result?.contents` に変更
  3. `this.pendingRequests.get(message.id)` の戻り値を null チェック
  4. LSP のメッセージ・補完・診断・送受信リクエストに対して適切なインターフェース型およびジェネリクス (`unknown`, `LspCompletionItem`, `LspDiagnostic` 等) を定義・適用

## 検証計画
1. `npm run check`: 指摘ゼロ（エラー0, 警告0, 情報0）でパスすることを確認
2. `npm run build`: TypeScript コンパイルが正常に通ることを確認
3. `npm test`: 既存テストが全てパスすることを確認
