import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

test.describe('E2E tests for web', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(60000);
    await page.goto('/');
  });

  test('should have the correct title', async ({ page }) => {
    await expect(page).toHaveTitle('SPD to SVG Converter');
  });

  test('should load default sample and render SVG', async ({ page }) => {
    // 入力にデフォルトのテキストがあるか確認
    const inputValue = await page.inputValue('#spdInput');
    expect(inputValue).toContain(':terminal');

    // SVGがレンダリングされているか確認
    await expect(page.locator('#svgOutput svg')).toBeVisible();
  });

  test('should convert valid SPD input to SVG', async ({ page }) => {
    // 入力をクリアし、シンプルなSPDを入力
    await page.fill('#spdInput', ':terminal start\n:terminal end');

    // SVGが更新されているか確認
    await expect(page.locator('#svgOutput svg')).toBeVisible();
    // SVGに出力テキストが存在するか検証
    await expect(page.locator('#svgOutput')).toContainText('start');
  });

  test('should show error message for invalid SPD input', async ({ page }) => {
    // 無効なSPDを入力（不明なコマンド）
    await page.fill('#spdInput', ':unknown');

    // エラーメッセージを確認
    // アプリは赤色の段落でエラーを表示する
    await expect(page.locator('#svgOutput p')).toHaveCSS('color', 'rgb(255, 0, 0)');
    await expect(page.locator('#svgOutput')).toContainText('Error:');
  });

  // test('should apply render options', async ({ page }) => {
  //   // 初期SVGがレンダリングされていることを確認
  //   await expect(page.locator('#svgOutput svg')).toBeVisible();

  //   // フォントサイズを変更
  //   await page.fill('#fontSizeInput', '24');

  //   // 変更を保証し、更新を検証するために入力テキストを変更
  //   await page.fill('#spdInput', ':terminal changed');

  //   // デバウンスまたはイベント処理を待機
  //   await page.waitForTimeout(1000);

  //   await page.click('#applyOptionsButton', { force: true });

  //   // エラーが発生したか確認（デバッグ用）
  //   if (await page.locator('#svgOutput p').isVisible()) {
  //     console.log('Error in SVG Output:', await page.textContent('#svgOutput p'));
  //   }

  //   // 新しいテキストをチェックしてSVGが変更されたことを確認
  //   await expect(page.locator('#svgOutput')).toContainText('changed');
  // });

  test('should download SPD file', async ({ page }) => {
    // プロンプトのダイアログハンドラを設定
    page.on('dialog', dialog => dialog.accept('test_download.spd'));

    // ダウンロードを開始
    const downloadPromise = page.waitForEvent('download');
    await page.click('#downloadButton');
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toBe('test_download.spd');
  });

  test('should download SVG file', async ({ page }) => {
    // #spdInput 欄を ':terminal 開始\ntest\n:terminal 終了' に書き換えた後
    await page.fill('#spdInput', ':terminal 開始\ntest\n:terminal 終了');

    // SVGがレンダリングされるのを待つ
    await expect(page.locator('#svgOutput svg')).toBeVisible();

    // #downloadButtonでダウンロードできたsvgファイルがGoldenFileと一致するか確かめる
    // 実際にはSVGダウンロードボタンは #downloadSvgButton
    const expectedFileName = 'test_output.svg';
    page.on('dialog', dialog => dialog.accept(expectedFileName));

    // ダウンロードを開始
    const downloadPromise = page.waitForEvent('download');
    await page.click('#downloadSvgButton');
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toBe(expectedFileName);

    // Read the downloaded file content from the stream
    const stream = await download.createReadStream();
    if (!stream) {
      throw new Error('Could not create read stream for download');
    }
    const chunks = [];
    for await (const chunk of stream) {
        chunks.push(chunk);
    }
    const downloadedSvg = Buffer.concat(chunks).toString('utf-8').replace(/\r\n/g, '\n');

    const goldenFilePath = path.join(process.cwd(), 'tests', 'web', 'output', 'simple_test.svg.txt');

    const goldenSvg = fs.readFileSync(goldenFilePath, 'utf-8').replace(/\r\n/g, '\n');

    expect(downloadedSvg).toBe(goldenSvg);
  });

  test('should apply render options and download correct SVG', async ({ page }) => {
    // Render Optionsを開く
    await page.locator('summary').click();

    // Render Options が表示されるのを待つ
    await expect(page.locator('#fontSizeInput')).toBeVisible();

    // フォントサイズ、背景色、ノード色を変更
    await page.locator('#fontSizeInput').fill('20');
    await page.locator('#baseBackgroundColorInput').fill('#cccccc');
    // checkboxをOFFにしないと色が反映されない
    await page.locator('#transparentBackgroundCheckbox').uncheck();
    await page.locator('#backgroundColorInput').fill('#eeeeee');

    // 変更を適用
    await page.locator('#applyOptionsButton').click();

    // 変更がSVGに反映されるのを待つ
    await page.waitForTimeout(500); // debounce

    // SVGがレンダリングされていることを確認
    await expect(page.locator('#svgOutput svg')).toBeVisible();

    // ダウンロードするSVGがGoldenFileと一致するか確かめる
    const expectedFileName = 'render_options_test.svg';
    page.on('dialog', dialog => dialog.accept(expectedFileName));

    // ダウンロードを開始
    const downloadPromise = page.waitForEvent('download');
    await page.click('#downloadSvgButton');
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toBe(expectedFileName);

    // ダウンロードしたファイルの内容を読み込む
    const stream = await download.createReadStream();
    if (!stream) {
      throw new Error('Could not create read stream for download');
    }
    const chunks = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    const downloadedSvg = Buffer.concat(chunks).toString('utf-8').replace(/\r\n/g, '\n');

    const goldenFilePath = path.join(process.cwd(), 'tests', 'web', 'output', 'render_options_test.svg.txt');

    const goldenSvg = fs.readFileSync(goldenFilePath, 'utf-8').replace(/\r\n/g, '\n');
    expect(downloadedSvg).toBe(goldenSvg);
  });
});
