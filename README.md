# padtools_ts

padtools_ts はPAD図を活用することを目的として作成された、PAD作成ツールです。 思考を止めず記述できることを目指しています。

---

このプロジェクトは、padtools (https://github.com/knaou/padtools) をTypeScriptで書き直したものです。

[![CI](https://github.com/steelpipe75/padtools_ts/actions/workflows/pipeline.yml/badge.svg)](https://github.com/steelpipe75/padtools_ts/actions/workflows/pipeline.yml) [![codecov](https://codecov.io/gh/steelpipe75/padtools_ts/branch/main/graph/badge.svg)](https://codecov.io/gh/steelpipe75/padtools_ts)

## 今すぐ試す

インストール不要で、ブラウザからすぐにPAD図の作成を試すことができます。

**[Web版を開く (GitHub Pages)](https://steelpipe75.github.io/padtools_ts/)**

![Web版スクリーンショット](screenshot.png)

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

また、開発時には `tsx` を使って直接ソースコードを実行することも可能です。

```shell
npm run start -- -i sample_input.spd -o sample_output.svg
```
上記の `npm run start` は、`package.json` のスクリプト定義に基づいて `tsx src/cli/cli.ts` を実行します。

### Webツールの起動

Webブラウザ上で動作するエディタを起動するには、以下のコマンドを実行します。

```shell
npm run start:web
```

このコマンドを実行すると開発用サーバーが立ち上がり、通常、`http://localhost:1234` でツールにアクセスできるようになります。

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
*   `--list-render-type <listRenderType>`: SVGのリスト描画タイプを指定します (`Original` または `TerminalOffset`)。
*   `-h, --help`: コマンドのヘルプ情報を表示します。

## REST API

`padtools_ts` は、SPDファイルをSVGに変換するREST APIを提供します。Swagger UIを使用してAPIをテストできます。

### APIサーバーの起動

APIサーバーを起動するには、以下のコマンドを実行します。

```shell
npm run start:api
```

これにより、通常、ローカルアドレス (例: `http://localhost:3000`) でサーバーが起動します。

### Swagger UI

APIのドキュメントとテストは、Swagger UIで確認できます。

- URL: `http://localhost:3000/api-docs`

### APIエンドポイント

#### GET /health

APIサーバーの稼働状況を確認します。

**レスポンス:**
```json
{
  "status": "ok"
}
```

#### POST /convert

SPDテキストをSVGに変換します。

**リクエストボディ:**
```json
{
  "spd": ":terminal Start\nprocess\n:terminal End",
  "options": {
    "fontSize": 14,
    "fontFamily": "monospace",
    "strokeWidth": 1,
    "strokeColor": "#000000",
    "backgroundColor": "#ffffff",
    "baseBackgroundColor": "none",
    "textColor": "#000000",
    "lineHeight": 1.2,
    "listRenderType": "TerminalOffset",
    "prettyprint": true
  }
}
```

**レスポンス:**
```json
{
  "svg": "<svg>...</svg>"
}
```

#### POST /convert/download

SPDテキストをSVGに変換し、ファイルとしてダウンロードします。

**リクエストボディ:**
`POST /convert` と同じです。

**レスポンス:**
SVGファイル (`image/svg+xml`) が返されます。

### オプション詳細

- `fontSize`: フォントサイズ (数値)
- `fontFamily`: フォントファミリー (文字列)
- `strokeWidth`: 線の太さ (数値)
- `strokeColor`: 線の色 (文字列)
- `backgroundColor`: 背景色 (文字列)
- `baseBackgroundColor`: ベース背景色 (文字列)
- `textColor`: テキスト色 (文字列)
- `lineHeight`: 行の高さ (数値)
- `listRenderType`: リスト描画タイプ (`Original` または `TerminalOffset`)
- `prettyprint`: SVGを整形して出力 (真偽値)

## MCP (Model Context Protocol) サーバー

`padtools_ts` は、AIエージェント（Claudeなど）から直接利用可能な MCP サーバーを提供します。これにより、AIエージェントがプログラムのロジックを解析し、即座にPAD図として可維化できるようになります。

### MCPサーバーの種類

2種類のトランスポート方式を提供しています。

1.  **stdio (標準入出力) モード**: ローカルの AI エージェント（Claude Desktopなど）から直接コマンドとして実行する場合に使用します。
2.  **Streamable HTTP モード**: Hono API サーバーの一部として動作し、ネットワーク越しに MCP クライアントから接続する場合に使用します。

---

### stdio モード (ローカル実行)

#### 起動コマンド

```shell
npm run start:mcp
```

#### MCP Inspector による動作確認

MCP Inspector を使用して、ブラウザ上でツールの動作やリソース、プロンプトを直接テストできます。

```shell
npx @modelcontextprotocol/inspector npx tsx src/mcp/server.ts
```

コマンドを実行すると、通常 `http://localhost:6274` で Inspector が起動し、ブラウザが自動的に開きます。

※ `npm run start:mcp` を使用すると、npm の出力メッセージが JSON RPC のメッセージとして解釈されようとして通信エラーが発生する場合があるため、上記のように `npx tsx` で直接サーバーを起動することを推奨します。

#### AIエージェントへの設定例 (Claude Desktop)

`claude_desktop_config.json` に以下の設定を追加することで、Claude からツールとして利用可能になります。

```json
{
  "mcpServers": {
    "padtools": {
      "command": "npx",
      "args": [
        "-y",
        "tsx",
        "C:/path/to/padtools_ts/src/mcp/server.ts"
      ],
      "cwd": "C:/path/to/padtools_ts"
    }
  }
}
```
※ `C:/path/to/padtools_ts` は実際のインストールパスに置き換えてください。

---

### HTTP モード (API経由)

Hono API サーバーを起動すると、`/mcp` エンドポイントが MCP サーバーとして機能します。

#### サーバーの起動

```shell
npm run start:api
```

これにより、`http://localhost:3000/mcp` で MCP サービスが提供されます。

#### MCP Inspector による動作確認

1.  APIサーバーを起動します (`npm run start:api`)。
2.  別のターミナルで Inspector を起動します。
    ```shell
    npx @modelcontextprotocol/inspector
    ```
3.  ブラウザで表示された画面にて以下の設定を行います：
    - **Transport Type**: `Streamable HTTP` を選択
    - **URL**: `http://localhost:3000/mcp` を入力
4.  **Connect** をクリックして接続します。

---

### 提供されるリソース

#### `spd://docs/explanation`

SPD (Simple PAD Description) 記法の詳細な説明と、各ノードの記述例を提供します。

### 提供されるプロンプト

#### `explain-spd`

SPD 記法についての説明と具体的な記述例を生成するよう AI に促します。

#### `generate-spd`

与えられた処理内容の説明（自然言語）から、対応する SPD テキストを生成するよう AI に促します。

### 提供されるツール

#### `convert_spd_to_svg`

SPDテキストを解析し、SVG形式のPAD図を生成して返します。

- **引数**:
  - `spd` (string, 必須): 変換対象の SPD テキスト。
  - `options` (object, 任意): フォントサイズや色などの描画オプション（REST APIと同様）。

#### `get_spd_explanation`

SPD 記法の仕様とサンプルコードを取得します。

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

これにより、`dist-web` ディレクトリに静的ファイルが生成されます。

### WebツールのビルドとGitHub Pagesへのデプロイ

Webツールをビルドし、GitHub Pages にデプロイするための準備を行うには、以下を実行します。

```shell
npm run build:web:gh-pages
```

このコマンドは `gh-pages` ディレクトリに静的ファイルを生成し、GitHub Pages で Jekyll プロセスが実行されないように `.nojekyll` ファイルを作成します。このコマンドの実行後、GitHub Actions のワークフローが自動的にこれらのファイルを GitHub Pages にデプロイします。

## ライセンス

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

このプロジェクトはMITライセンスです。詳細については、[LICENSE](LICENSE)ファイルをご覧ください。

このプロジェクトでは、以下の主要なオープンソースライブラリを使用しています。

-   [commander](https://github.com/tj/commander.js): CLIコマンドの解析に使用。 (MIT License)
-   [xml-formatter](https://github.com/chrisbottin/xml-formatter): SVG出力の整形 (`--prettyprint` オプション) に使用。 (MIT License)
-   [svgo](https://github.com/svg/svgo): SVGの最適化（`--prettyprint` オプションが有効な場合）に使用。 (MIT License)
-   [eastasianwidth](https://github.com/komagata/eastasianwidth): 文字の幅計算に使用。 (MIT License)
-   [hono](https://github.com/honojs/hono): REST APIサーバーの実装に使用。 (MIT License)
-   [@hono/node-server](https://github.com/honojs/node-server): Node.jsでHonoを実行するために使用。 (MIT License)
-   [@hono/zod-openapi](https://github.com/honojs/middleware/tree/main/packages/zod-openapi): OpenAPI仕様の生成に使用。 (MIT License)
-   [@hono/swagger-ui](https://github.com/honojs/middleware/tree/main/packages/swagger-ui): APIドキュメントのSwagger UI表示に使用。 (MIT License)
-   [zod](https://github.com/colinhacks/zod): スキーマバリデーションに使用。 (MIT License)
-   [fastmcp](https://github.com/jlowin/fastmcp): MCPサーバーの実装に使用。 (Apache License 2.0)
-   [@hono/mcp](https://github.com/honojs/mcp): HonoでのMCPサーバー実装に使用。 (MIT License)
-   [@modelcontextprotocol/sdk](https://github.com/modelcontextprotocol/typescript-sdk): MCP SDK。 (MIT License)
-   [sanitize-html](https://github.com/apostrophecms/sanitize-html): SVG内のテキストのサニタイズに使用。 (MIT License)

各ライブラリのライセンス詳細については、それぞれのリンク先をご確認ください。

## リンク

- GitHub : [https://github.com/steelpipe75/padtools_ts](https://github.com/steelpipe75/padtools_ts)
- 公開サイト : [https://steelpipe75.github.io/padtools_ts/](https://steelpipe75.github.io/padtools_ts/)
