import { chromium } from '@playwright/test';

const screenshots = [
  { name: 'dashboard', url: 'http://localhost:1001/dashboard', description: 'Dashboard Overview' },
  { name: 'brands', url: 'http://localhost:1001/brands', description: 'Brand Management' },
  { name: 'search', url: 'http://localhost:1001/search', description: 'Ad Search' },
  { name: 'settings', url: 'http://localhost:1001/settings', description: 'Settings' },
  { name: 'docs-home', url: 'http://localhost:1001/docs', description: 'Guide Home' },
  { name: 'docs-getting-started', url: 'http://localhost:1001/docs/getting-started', description: 'Getting Started' },
  { name: 'docs-dashboard', url: 'http://localhost:1001/docs/users/dashboard', description: 'Dashboard Guide' },
  { name: 'docs-search', url: 'http://localhost:1001/docs/users/search', description: 'Search Guide' },
  { name: 'docs-brands', url: 'http://localhost:1001/docs/admin/brands', description: 'Brand Management Guide' },
  { name: 'docs-settings', url: 'http://localhost:1001/docs/admin/settings', description: 'Settings Guide' },
];

async function takeScreenshots() {
  console.log('🚀 Starting screenshot capture...\n');

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  for (const screenshot of screenshots) {
    try {
      console.log(`📸 Capturing: ${screenshot.description}...`);
      await page.goto(screenshot.url, { waitUntil: 'networkidle' });
      await page.waitForTimeout(1000); // Wait for animations
      await page.screenshot({
        path: `public/screenshots/${screenshot.name}.png`,
        fullPage: true
      });
      console.log(`✅ Saved: public/screenshots/${screenshot.name}.png\n`);
    } catch (error) {
      console.error(`❌ Failed to capture ${screenshot.name}:`, error.message, '\n');
    }
  }

  await browser.close();
  console.log('✨ Screenshot capture complete!');
}

takeScreenshots();
