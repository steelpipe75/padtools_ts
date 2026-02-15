# padtools_ts

padtools_ts はPAD図を活用することを目的として作成された、PAD作成ツールです。 思考を止めず記述できることを目指しています。

---

このプロジェクトは、padtools (https://github.com/knaou/padtools) をTypeScriptで書き直したものです。

[![CI](https://github.com/steelpipe75/padtools_ts/actions/workflows/ci.yml/badge.svg)](https://github.com/steelpipe75/padtools_ts/actions/workflows/ci.yml) [![codecov](https://codecov.io/gh/steelpipe75/padtools_ts/branch/main/graph/badge.svg)](https://codecov.io/gh/steelpipe75/padtools_ts)

## インストール

### 依存関係のインストール

プロジェクトの開発に必要な依存関係をローカルにインストールするには、以下のコマンドを実行します。

```shell
npm install
```

## テスト

プロジェクトのテストを実行するには、以下のコマンドを実行します。

```shell
npm test
```

## テストカバレッジ

テストカバレッジレポートを生成するには、以下のコマンドを実行します。

```shell
npm run test:cov
```

## CLIの使用方法

`padtools_ts` は、SPDファイルをSVGに変換するCLIツールを提供します。

```shell
npx padtools_ts -i sample_input.spd -o sample_output.svg
```

また、開発時には `ts-node` を使って直接ソースコードを実行することも可能です。

```shell
npm run start -- -i sample_input.spd -o sample_output.svg
```
上記の `npm run start` は、`package.json` のスクリプト定義に基づいて `ts-node src/cli/cli.ts` を実行します。

### ローカルWebサーバーの起動

`padtools_ts` には、Webツールをローカルで確認するためのWebサーバー機能も含まれています。

```shell
npx padtools_ts web
```

このコマンドは、ビルドされたWebツール（`dist/web`）をホスティングし、ブラウザでアクセスできるようにします。

### コマンドラインオプション

`padtools_ts` は以下のオプションをサポートしています。

*   `-V, --version`: バージョン番号を出力します。
*   `-i, --input <inputFilePath>`: 入力SPDテキストファイルへのパスを指定します。
*   `-o, --output <outputFilePath>`: 出力SVGファイルへのパスを指定します。
*   `-p, --prettyprint`: 出力SVGを整形して出力します（`svgo` を使用）。
*   `--font-size <fontSize>`: SVGのフォントサイズを指定します。
*   `--font-family <fontFamily>`: SVGのフォントファミリーを指定します。
*   `--stroke-width <strokeWidth>`: SVGの線の太さを指定します。
*   `--stroke-color <strokeColor>`: SVGの線の色を指定します。
*   `--background-color <backgroundColor>`: SVGの背景色を指定します。
*   `--base-background-color <baseBackgroundColor>`: SVGのベース背景色を指定します。
*   `--text-color <textColor>`: SVGのテキスト色を指定します。
*   `--line-height <lineHeight>`: SVGの行の高さを指定します。
*   `--list-render-type <listRenderType>`: SVGのリスト描画タイプを指定します (`original` または `TerminalOffset`)。
*   `-h, --help`: コマンドのヘルプ情報を表示します。

## Webツール

このプロジェクトには、Webベースのツールも含まれています。

### Webツールの実行 (開発用)

開発モードでWebツールを起動するには、以下を実行します。

```shell
npm run start:web
```

これにより、通常、ローカルアドレス (例: `http://localhost:1234`) でブラウザにツールが開きます。

### Webツールのビルド

本番用にWebツールをビルドするには、以下を実行します。

```shell
npm run build:web
```

これにより、`dist/web` ディレクトリに静的ファイルが生成されます。

### WebツールのビルドとGitHub Pagesへのデプロイ

Webツールをビルドし、GitHub Pages にデプロイするための準備を行うには、以下を実行します。

```shell
npm run build:web:gh-pages
```

このコマンドは `docs` ディレクトリに静的ファイルを生成し、`gh-pages` ブランチにプッシュします。

## ライセンス

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

このプロジェクトはMITライセンスです。詳細については、[LICENSE](LICENSE)ファイルをご覧ください。

このプロジェクトでは、以下の主要なオープンソースライブラリを使用しています。

-   commander: CLIコマンドの解析に使用。[MIT License](https://github.com/tj/commander.js/blob/master/LICENSE)
-   serve: Webサーバー機能（`padtools_ts web`）に使用。[MIT License](https://github.com/vercel/serve/blob/main/LICENSE)
-   xml-formatter: SVG出力の整形 (`--prettyprint` オプション) に使用。[MIT License](https://github.com/chrisbottin/xml-formatter/blob/master/LICENSE)
-   svgo: SVGの最適化（`--prettyprint` オプションが有効な場合）に使用。[MIT License](https://github.com/svg/svgo/blob/main/LICENSE)
-   eastasianwidth: 文字の幅計算に使用。[MIT License](https://github.com/komagata/eastasianwidth)

各ライブラリのライセンス詳細については、それぞれのリンク先をご確認ください。

## リンク

- GitHub : [https://github.com/steelpipe75/padtools_ts](https://github.com/steelpipe75/padtools_ts)
- 公開サイト : [https://steelpipe75.github.io/padtools_ts/](https://steelpipe75.github.io/padtools_ts/)
