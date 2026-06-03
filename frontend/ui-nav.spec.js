const { test, expect } = require('@playwright/test');

test('approved seller navbar and become-seller routing', async ({ page }) => {
  const base = process.env.UI_BASE || 'http://localhost:4200';
  const email = process.env.UI_EMAIL;
  const password = process.env.UI_PASSWORD || 'Test@123';

  if (!email) {
    throw new Error('UI_EMAIL env variable is required');
  }

  await page.goto(base + '/login');
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button:has-text("Sign In")');

  await expect(page).toHaveURL(/\/dashboard$/, { timeout: 15000 });

  const sellerHub = page.locator('nav a:has-text("Seller Hub")').first();
  await expect(sellerHub).toBeVisible();

  await sellerHub.click();
  await expect(page).toHaveURL(/\/seller-dashboard$/, { timeout: 15000 });

  await expect(page.locator('button:has-text("Overview")')).toBeVisible();
  await expect(page.locator('button:has-text("My Products")')).toBeVisible();
  await expect(page.locator('button:has-text("Orders")')).toBeVisible();
  await expect(page.locator('button:has-text("Revenue")')).toBeVisible();

  await page.goto(base + '/become-seller');
  await expect(page).toHaveURL(/\/seller-dashboard$/, { timeout: 15000 });
});
