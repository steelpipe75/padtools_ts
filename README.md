# padtools_ts

padtools_ts はPAD図を活用することを目的として作成された、PAD作成ツールです。 思考を止めず記述できることを目指しています。

---

このプロジェクトは、padtools (https://github.com/knaou/padtools) をTypeScriptで書き直したものです。

[![CI](https://github.com/steelpipe75/padtools_ts/actions/workflows/ci.yml/badge.svg)](https://github.com/steelpipe75/padtools_ts/actions/workflows/ci.yml) [![codecov](https://codecov.io/gh/steelpipe75/padtools_ts/branch/main/graph/badge.svg)](https://codecov.io/gh/steelpipe75/padtools_ts)

## インストール

### グローバルインストール

`padtools_ts` をCLIツールとしてどこからでも使用できるようにするには、以下のコマンドを実行します。

```shell
npm install -g .
```

### 開発用インストール

プロジェクトを開発するためにローカルにインストールするには、以下のコマンドを実行します。

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
npm test -- --coverage
```

## CLIの使用方法

`padtools_ts` CLIツールを使用するには、以下のようにコマンドを実行します。

```shell
padtools_ts -i sample_input.spd -o sample_output.svg
```

または、グローバルインストールしていない場合は、以下のようにコマンドを実行します。

```shell
npm run start -- -i sample_input.spd -o sample_output.svg
```

### コマンドラインオプション

`padtools_ts` は以下のオプションをサポートしています。

*   `-V, --version`: バージョン番号を出力します。
*   `-i, --input <inputFilePath>`: 入力SPDテキストファイルへのパスを指定します。
*   `-o, --output <outputFilePath>`: 出力SVGファイルへのパスを指定します。
*   `-p, --prettyprint`: 出力SVGを整形して出力します。
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

これにより、`docs` ディレクトリに GitHub Pages 用の静的ファイルが生成されます。

## ライセンス

このプロジェクトはMITライセンスです。詳細については、[LICENSE](LICENSE)ファイルをご覧ください。

このプロジェクトでは、以下のオープンソースライブラリを使用しています。

-   commander: [MIT License](https://github.com/tj/commander.js/blob/master/LICENSE)
-   xml-formatter: [MIT License](https://github.com/chrisbottin/xml-formatter/blob/master/LICENSE)
-   svgo: [MIT License](https://github.com/svg/svgo/blob/main/LICENSE)

各ライブラリのライセンス詳細については、それぞれのリンク先をご確認ください。

## リンク

- GitHub : [https://github.com/steelpipe75/padtools_ts](https://github.com/steelpipe75/padtools_ts)
- 公開サイト : [https://steelpipe75.github.io/padtools_ts/](https://steelpipe75.github.io/padtools_ts/)
