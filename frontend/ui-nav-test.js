const { chromium } = require('playwright');

(async () => {
  const base = 'http://localhost:4200';
  const email = 'uitest57225@mail.com';
  const password = 'Test@123';

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const out = [];

  await page.goto(base + '/login', { waitUntil: 'networkidle' });
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button:has-text("Sign In")');
  await page.waitForURL('**/dashboard', { timeout: 15000 });
  out.push('LOGIN_NAVIGATED=' + page.url());

  const sellerHubLinks = await page.locator('nav a:has-text("Seller Hub")').count();
  out.push('NAVBAR_SELLER_HUB_LINKS=' + sellerHubLinks);

  if (sellerHubLinks > 0) {
    await page.locator('nav a:has-text("Seller Hub")').first().click();
    await page.waitForURL('**/seller-dashboard', { timeout: 15000 });
    out.push('SELLER_HUB_CLICK_URL=' + page.url());
  }

  const tabOverview = await page.locator('button:has-text("Overview")').count();
  const tabProducts = await page.locator('button:has-text("My Products")').count();
  const tabOrders = await page.locator('button:has-text("Orders")').count();
  const tabRevenue = await page.locator('button:has-text("Revenue")').count();
  out.push('TABS=' + [tabOverview, tabProducts, tabOrders, tabRevenue].join(','));

  await page.goto(base + '/become-seller', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  out.push('BECOME_SELLER_FINAL_URL=' + page.url());

  console.log(out.join('\n'));
  await browser.close();
})().catch((err) => {
  console.error('UI_TEST_FAIL');
  console.error(err.message);
  process.exit(1);
});
