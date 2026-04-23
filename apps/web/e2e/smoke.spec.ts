import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.describe('smoke', () => {
  test('home page renders with the correct title and primary heading', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Evidence Engine/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('bootstrap successful');
  });

  test('skip-to-content link is present in the accessibility tree', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('link', { name: /skip to main content/i })).toHaveCount(1);
  });

  test('top navigation exposes the four dashboard views', async ({ page }) => {
    await page.goto('/');
    const nav = page.getByRole('navigation', { name: 'Primary' });
    for (const label of ['Horizon', 'Trace', 'Cascade', 'Brief']) {
      await expect(nav.getByRole('link', { name: label })).toBeVisible();
    }
  });

  test('home page has no detectable accessibility violations', async ({ page }) => {
    await page.goto('/');
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    expect(results.violations).toEqual([]);
  });
});
