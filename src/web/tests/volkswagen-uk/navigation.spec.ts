import { test, expect } from './seed.spec';

test.describe('Volkswagen UK - Navigation and Header', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to home page and dismiss cookies
    await page.goto('https://www.volkswagen.co.uk/', { waitUntil: 'networkidle' });
    
    // Dismiss cookie banner
    try {
      const rejectButton = page.locator('button:has-text("Reject all")');
      if (await rejectButton.isVisible({ timeout: 3000 })) {
        await rejectButton.click();
        await page.waitForTimeout(300);
      }
    } catch (e) {
      // Banner might not be present
    }
  });

  test('Logo navigation - should navigate to home page', async ({ page }) => {
    // Get current URL
    const initialUrl = page.url();
    
    // Click on VW logo in header
    const logo = page.locator('a[href*="/"] >> nth=0, [aria-label*="Volkswagen"], svg[class*="logo"]').first();
    await logo.click();
    
    // Verify we're on home page (URL should contain volkswagen.co.uk)
    await expect(page).toHaveURL(/volkswagen\.co\.uk/);
  });

  test('Main menu access - should open and display navigation options', async ({ page }) => {
    // Click hamburger menu icon
    const menuButton = page.locator('button[aria-label*="menu" i], button[class*="menu" i], .hamburger, [class*="hamburger"]').first();
    await menuButton.click();
    
    // Wait for menu to appear
    const menu = page.locator('nav, [role="navigation"], [class*="menu" i]').first();
    await expect(menu).toBeVisible();
    
    // Verify menu contains at least one link
    const menuLinks = page.locator('nav a, [role="navigation"] a, [class*="menu"] a');
    const count = await menuLinks.count();
    expect(count).toBeGreaterThan(0);
  });

  test('Search functionality - should open search and accept input', async ({ page }) => {
    // Click search icon
    const searchButton = page.locator('button[aria-label*="search" i], [class*="search"] button, svg[class*="search"]').first();
    await searchButton.click();
    
    // Verify search input appears
    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i], [class*="search"] input').first();
    await expect(searchInput).toBeVisible({ timeout: 2000 });
    
    // Type in search box
    await searchInput.fill('Golf');
    
    // Verify input contains text
    await expect(searchInput).toHaveValue('Golf');
  });

  test('Account icon access - should provide login/account interface', async ({ page }) => {
    // Click account/user icon
    const accountButton = page.locator('button[aria-label*="account" i], button[aria-label*="user" i], [class*="account"] button, svg[class*="user"]').first();
    await accountButton.click();
    
    // Wait for account interface to appear
    await page.waitForTimeout(500);
    
    // Verify some account-related content appears
    const accountContent = page.locator('text=/login|sign in|account|profile/i').first();
    await expect(accountContent).toBeVisible({ timeout: 2000 });
  });
});
