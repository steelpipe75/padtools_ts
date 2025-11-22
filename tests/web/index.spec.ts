
import { test, expect } from '@playwright/test';

test.describe('E2E tests for web', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(60000);
    await page.goto('/');
  });

  test('should have the correct title', async ({ page }) => {
    await expect(page).toHaveTitle('SPD to SVG Converter');
  });
});
