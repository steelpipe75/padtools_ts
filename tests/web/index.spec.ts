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
    // Check if input has default text
    const inputValue = await page.inputValue('#spdInput');
    expect(inputValue).toContain(':terminal');

    // Check if SVG is rendered
    await expect(page.locator('#svgOutput svg')).toBeVisible();
  });

  test('should convert valid SPD input to SVG', async ({ page }) => {
    // Clear input and type simple SPD
    await page.fill('#spdInput', ':terminal start\n:terminal end');

    // Check if SVG is updated
    await expect(page.locator('#svgOutput svg')).toBeVisible();
    // Verify content text exists in SVG
    await expect(page.locator('#svgOutput')).toContainText('start');
  });

  test('should show error message for invalid SPD input', async ({ page }) => {
    // Input invalid SPD (unknown command)
    await page.fill('#spdInput', ':unknown');

    // Check for error message
    // The app shows error in red paragraph
    await expect(page.locator('#svgOutput p')).toHaveCSS('color', 'rgb(255, 0, 0)');
    await expect(page.locator('#svgOutput')).toContainText('Error:');
  });

  // test('should apply render options', async ({ page }) => {
  //   // Ensure initial SVG is rendered
  //   await expect(page.locator('#svgOutput svg')).toBeVisible();

  //   // Change font size
  //   await page.fill('#fontSizeInput', '24');

  //   // Change input text to GUARANTEE change and verify update
  //   await page.fill('#spdInput', ':terminal changed');

  //   // Wait for potential debounce or event processing
  //   await page.waitForTimeout(1000);

  //   await page.click('#applyOptionsButton', { force: true });

  //   // Check if error occurred (for debugging)
  //   if (await page.locator('#svgOutput p').isVisible()) {
  //     console.log('Error in SVG Output:', await page.textContent('#svgOutput p'));
  //   }

  //   // Verify SVG has changed by checking for new text
  //   await expect(page.locator('#svgOutput')).toContainText('changed');
  // });

  test('should download SPD file', async ({ page }) => {
    // Setup dialog handler for prompt
    page.on('dialog', dialog => dialog.accept('test_download.spd'));

    // Start download
    const downloadPromise = page.waitForEvent('download');
    await page.click('#downloadButton');
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toBe('test_download.spd');
  });

  test('should download SVG file', async ({ page }) => {
    // #spdInput 欄を ':terminal 開始\ntest\n:terminal 終了' に書き換えた後
    await page.fill('#spdInput', ':terminal 開始\ntest\n:terminal 終了');

    // Wait for SVG to be rendered
    await expect(page.locator('#svgOutput svg')).toBeVisible();

    // #downloadButtonでダウンロードできたsvgファイルがGoldenFileと一致するか確かめる
    // 実際にはSVGダウンロードボタンは #downloadSvgButton
    const expectedFileName = 'test_output.svg';
    page.on('dialog', dialog => dialog.accept(expectedFileName));

    // Start download
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
});
