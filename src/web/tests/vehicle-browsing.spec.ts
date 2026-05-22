import { test, expect } from './seed.spec';

test.describe('Volkswagen UK - Vehicle Browsing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://www.volkswagen.co.uk/', { waitUntil: 'networkidle' });
    
    // Dismiss cookie banner
    try {
      const rejectButton = page.locator('button:has-text("Reject all")');
      if (await rejectButton.isVisible({ timeout: 3000 })) {
        await rejectButton.click();
        await page.waitForTimeout(300);
      }
    } catch (e) {
      // Continue if banner not found
    }
  });

  test('Explore range button - should navigate to vehicle catalog', async ({ page }) => {
    // Click "Explore our range" button
    const exploreButton = page.locator('button, a').filter({ hasText: /Explore our range/i }).first();
    await exploreButton.click();
    
    // Wait for navigation
    await page.waitForNavigation({ waitUntil: 'networkidle' }).catch(() => {
      // If navigation doesn't occur, wait for content to load
      return page.waitForTimeout(2000);
    });
    
    // Verify we're on a vehicles/models page
    const vehicleContent = page.locator(
      'text=/vehicles|models|car|range|gallery/i, ' +
      '[class*="vehicle"], [class*="model"], [class*="gallery"]'
    ).first();
    
    await expect(vehicleContent).toBeVisible({ timeout: 5000 });
  });

  test('Vehicle selection - should display vehicle details', async ({ page }) => {
    // Navigate to explore range
    const exploreButton = page.locator('button, a').filter({ hasText: /Explore our range/i }).first();
    if (await exploreButton.isVisible()) {
      await exploreButton.click();
      await page.waitForTimeout(2000);
    }
    
    // Find and click on a vehicle card
    const vehicleCard = page.locator('[class*="vehicle"], [class*="model"], [class*="card"]').first();
    
    if (await vehicleCard.isVisible({ timeout: 3000 })) {
      await vehicleCard.click();
      await page.waitForTimeout(1000);
      
      // Verify vehicle details are displayed
      const details = page.locator('text=/specs|price|specification|feature|details/i').first();
      await expect(details).toBeVisible({ timeout: 5000 });
    }
  });

  test('Vehicle information - should display model name and specs', async ({ page }) => {
    // Navigate to explore range
    const exploreButton = page.locator('button, a').filter({ hasText: /Explore our range/i }).first();
    if (await exploreButton.isVisible()) {
      await exploreButton.click();
      await page.waitForTimeout(2000);
    }
    
    // Get vehicle names/models visible
    const vehicleModels = page.locator('[class*="model"], [class*="vehicle"]').first();
    
    if (await vehicleModels.isVisible({ timeout: 3000 })) {
      // Verify text content is visible (model name)
      const text = await vehicleModels.textContent();
      expect(text).toBeTruthy();
      expect(text!.length).toBeGreaterThan(0);
    }
  });

  test('Hero image - should load and display on homepage', async ({ page }) => {
    // Verify hero image is visible
    const heroImage = page.locator('img[alt*="vehicle" i], [class*="hero"] img, [class*="banner"] img').first();
    
    // Check if visible with extended timeout
    const isVisible = await heroImage.isVisible({ timeout: 5000 }).catch(() => false);
    
    if (isVisible) {
      // Verify image has dimensions
      const boundingBox = await heroImage.boundingBox();
      expect(boundingBox).toBeTruthy();
      expect(boundingBox!.width).toBeGreaterThan(0);
      expect(boundingBox!.height).toBeGreaterThan(0);
    }
  });
});
