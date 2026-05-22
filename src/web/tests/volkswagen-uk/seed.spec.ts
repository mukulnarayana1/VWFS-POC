import { test as base, expect } from '@playwright/test';

/**
 * Seed test file for Volkswagen UK website tests
 * Provides common setup and utilities
 */

type CustomFixtures = {
  cookieConsent: void;
};

export const test = base.extend<CustomFixtures>({
  cookieConsent: async ({ page }, use) => {
    // Navigate to home page
    await page.goto('https://www.volkswagen.co.uk/', { waitUntil: 'networkidle' });
    
    // Dismiss cookie banner by clicking "Reject all" if visible
    try {
      const rejectButton = page.locator('button:has-text("Reject all")');
      if (await rejectButton.isVisible({ timeout: 5000 })) {
        await rejectButton.click();
        // Wait for banner to disappear
        await page.waitForTimeout(500);
      }
    } catch (e) {
      // Banner might not be present, continue
    }
    
    await use();
  },
});

export { expect };
