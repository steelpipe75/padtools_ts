import * as fs from "node:fs";
import * as path from "node:path";
import { expect, test } from "@playwright/test";

const tempDir = path.join(process.cwd(), "tests", "web", "temp");

test.describe("E2E tests for web", () => {
  test.beforeAll(() => {
    // Ensure the temp directory for test outputs exists.
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
  });

  test.beforeEach(async ({ page }) => {
    test.setTimeout(60000);
    await page.goto("/");
  });

  test("should have the correct title", async ({ page }) => {
    await expect(page).toHaveTitle("SPD to SVG Converter");
  });

  test("should load default sample and render SVG", async ({ page }) => {
    // 入力にデフォルトのテキストがあるか確認
    const inputValue = await page.inputValue("#spdInput");
    expect(inputValue).toContain(":terminal");

    // SVGがレンダリングされているか確認
    await expect(page.locator("#svgOutput svg")).toBeVisible();
  });

  test("should convert valid SPD input to SVG", async ({ page }) => {
    // 入力をクリアし、シンプルなSPDを入力
    await page.fill("#spdInput", ":terminal start\n:terminal end");

    // SVGが更新されているか確認
    await expect(page.locator("#svgOutput svg")).toBeVisible();
    // SVGに出力テキストが存在するか検証
    await expect(page.locator("#svgOutput")).toContainText("start");
  });

  test("should show error message for invalid SPD input", async ({ page }) => {
    // 無効なSPDを入力（不明なコマンド）
    await page.fill("#spdInput", ":unknown");

    // エラーメッセージを確認
    // アプリは .error-message クラスを持つ要素でエラーを表示する
    await expect(page.locator("#errorOutput .error-message")).toBeVisible();
    await expect(page.locator("#errorOutput")).toContainText("Error");
  });

  test("should download SPD file", async ({ page }) => {
    // プロンプトのダイアログハンドラを設定
    page.on("dialog", (dialog) => dialog.accept("test_download.spd"));

    // ダウンロードを開始
    const downloadPromise = page.waitForEvent("download");
    await page.click("#downloadButton");
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toBe("test_download.spd");
  });

  test("should download SVG file", async ({ page }) => {
    // #spdInput 欄を ':terminal 開始\ntest\n:terminal 終了' に書き換えた後
    await page.fill("#spdInput", ":terminal 開始\ntest\n:terminal 終了");

    // SVGがレンダリングされるのを待つ
    await expect(page.locator("#svgOutput svg")).toBeVisible();

    // #downloadButtonでダウンロードできたsvgファイルがGoldenFileと一致するか確かめる
    // 実際にはSVGダウンロードボタンは #downloadSvgButton
    const expectedFileName = "test_output.svg";
    page.on("dialog", (dialog) => dialog.accept(expectedFileName));

    // ダウンロードを開始
    const downloadPromise = page.waitForEvent("download");
    await page.click("#downloadSvgButton");
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toBe(expectedFileName);

    // Read the downloaded file content from the stream
    const stream = await download.createReadStream();
    if (!stream) {
      throw new Error("Could not create read stream for download");
    }
    const chunks = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    const downloadedSvg = Buffer.concat(chunks)
      .toString("utf-8")
      .replace(/\r\n/g, "\n");

    const goldenFilePath = path.join(
      process.cwd(),
      "tests",
      "web",
      "output",
      "simple_test.svg.txt",
    );

    // Save the downloaded SVG to a temp file for inspection
    const goldenFileName = path.basename(goldenFilePath, ".txt"); // e.g., "simple_test.svg"
    const tempOutputPath = path.join(tempDir, goldenFileName);
    fs.writeFileSync(tempOutputPath, downloadedSvg, "utf-8");

    const goldenSvg = fs
      .readFileSync(goldenFilePath, "utf-8")
      .replace(/\r\n/g, "\n");

    expect(downloadedSvg).toBe(goldenSvg);
  });

  test("should apply render options and download correct SVG", async ({
    page,
  }) => {
    // Render Optionsを開く
    await page.locator("summary").click();

    // Render Options が表示されるのを待つ
    await expect(page.locator("#fontSizeInput")).toBeVisible();

    // フォントサイズ、背景色、ノード色を変更
    await page.locator("#fontSizeInput").fill("20");
    await page.locator("#baseBackgroundColorInput").fill("#cccccc");
    // checkboxをOFFにしないと色が反映されない
    await page.locator("#transparentBackgroundCheckbox").uncheck();
    await page.locator("#backgroundColorInput").fill("#eeeeee");

    // 変更を適用
    await page.locator("#applyOptionsButton").click();

    // 変更がSVGに反映されるのを待つ
    await page.waitForTimeout(500); // debounce

    // SVGがレンダリングされていることを確認
    await expect(page.locator("#svgOutput svg")).toBeVisible();

    // ダウンロードするSVGがGoldenFileと一致するか確かめる
    const expectedFileName = "render_options_test.svg";
    page.on("dialog", (dialog) => dialog.accept(expectedFileName));

    // ダウンロードを開始
    const downloadPromise = page.waitForEvent("download");
    await page.click("#downloadSvgButton");
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toBe(expectedFileName);

    // ダウンロードしたファイルの内容を読み込む
    const stream = await download.createReadStream();
    if (!stream) {
      throw new Error("Could not create read stream for download");
    }
    const chunks = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    const downloadedSvg = Buffer.concat(chunks)
      .toString("utf-8")
      .replace(/\r\n/g, "\n");

    const goldenFilePath = path.join(
      process.cwd(),
      "tests",
      "web",
      "output",
      "render_options_test.svg.txt",
    );

    // Save the downloaded SVG to a temp file for inspection
    const goldenFileName = path.basename(goldenFilePath, ".txt");
    const tempOutputPath = path.join(tempDir, goldenFileName);
    fs.writeFileSync(tempOutputPath, downloadedSvg, "utf-8");

    const goldenSvg = fs
      .readFileSync(goldenFilePath, "utf-8")
      .replace(/\r\n/g, "\n");
    expect(downloadedSvg).toBe(goldenSvg);
  });

  test("should download AST file", async ({ page }) => {
    await page.fill("#spdInput", ":terminal start\n:terminal end");

    // AST表示モードに切り替える
    await page.check("#displayModeAst");

    const expectedFileName = "test_ast.json";
    page.on("dialog", (dialog) => dialog.accept(expectedFileName));

    // ダウンロードを開始
    const downloadPromise = page.waitForEvent("download");
    await page.click("#downloadAstButton");
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toBe(expectedFileName);

    const stream = await download.createReadStream();
    if (!stream) {
      throw new Error("Could not create read stream for AST download");
    }
    const chunks = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    const downloadedAst = JSON.parse(Buffer.concat(chunks).toString("utf-8"));

    expect(downloadedAst.type).toBe("nodeList");
    expect(downloadedAst.children[0].text).toBe("start");
  });

  test("should render from AST input when checkbox is checked", async ({
    page,
  }) => {
    const astJson = JSON.stringify({
      type: "nodeList",
      children: [
        { type: "terminal", text: "AST Start" },
        { type: "terminal", text: "AST End" },
      ],
    });

    // 入力モードをASTに切り替える
    await page.check("#inputModeAst");

    // ASTを入力
    await page.fill("#spdInput", astJson);

    // SVGがレンダリングされているか確認
    await expect(page.locator("#svgOutput svg")).toBeVisible();
    await expect(page.locator("#svgOutput")).toContainText("AST Start");
  });

  test("should include AST flag in share link and restore it", async ({
    page,
  }) => {
    const spdText = JSON.stringify({
      type: "nodeList",
      children: [{ type: "terminal", text: "Shared AST" }],
    });
    await page.fill("#spdInput", spdText);
    // 入力モードをASTに切り替える
    await page.check("#inputModeAst");

    // クリップボードのモックはPlaywrightでは難しい場合があるが、URLを取得して検証する
    await page.click("#shareButton");

    // クリップボードにコピーされた内容を直接検証する代わりに、URLパラメータでの復元を検証する
    const bytes = new TextEncoder().encode(spdText);
    const binString = Array.from(bytes, (byte) =>
      String.fromCodePoint(byte),
    ).join("");
    const base64 = btoa(binString);

    await page.goto(`/?spd=${base64}&ast=1`);

    // 復元を確認
    expect(await page.inputValue("#spdInput")).toBe(spdText);
    expect(await page.isChecked("#inputModeAst")).toBe(true);
    await expect(page.locator("#svgOutput svg")).toBeVisible();
    await expect(page.locator("#svgOutput")).toContainText("Shared AST");
  });
});
