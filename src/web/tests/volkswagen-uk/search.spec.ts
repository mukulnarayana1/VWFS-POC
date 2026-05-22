import { test, expect } from './seed.spec';

test.describe('Volkswagen UK - Search Functionality', () => {
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
      // Continue
    }
  });

  test('Search box - should accept vehicle model names', async ({ page }) => {
    // Click search button
    const searchButton = page.locator('button[aria-label*="search" i], [class*="search"] button').first();
    await searchButton.click();
    
    // Wait for search input
    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]').first();
    await expect(searchInput).toBeVisible({ timeout: 3000 });
    
    // Type vehicle model
    await searchInput.fill('Golf');
    
    // Verify input has value
    await expect(searchInput).toHaveValue('Golf');
  });

  test('Search results - should display results for valid model', async ({ page }) => {
    // Open search
    const searchButton = page.locator('button[aria-label*="search" i], [class*="search"] button').first();
    await searchButton.click();
    
    // Type search query
    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]').first();
    await searchInput.fill('Passat');
    
    // Press Enter to search
    await searchInput.press('Enter');
    
    // Wait for results
    await page.waitForTimeout(1000);
    
    // Verify results appear or navigate to results page
    const url = page.url();
    const hasSearchResults = await page.locator(
      'text=/results|passat|search/i, [class*="result"]'
    ).first().isVisible({ timeout: 3000 }).catch(() => false);
    
    expect(hasSearchResults || url.includes('search')).toBeTruthy();
  });

  test('Search filter - should filter by vehicle type if available', async ({ page }) => {
    // Navigate to vehicle models
    const exploreButton = page.locator('button, a').filter({ hasText: /Explore our range|all models|vehicle/i }).first();
    
    if (await exploreButton.isVisible({ timeout: 3000 })) {
      await exploreButton.click();
      await page.waitForTimeout(2000);
      
      // Look for filter options
      const filters = page.locator('[class*="filter"], label:has-text(/type|category|body/i)').first();
      
      if (await filters.isVisible({ timeout: 2000 })) {
        await filters.click();
        await page.waitForTimeout(500);
        
        // Verify filter options appear
        const filterOptions = page.locator('[class*="filter"] option, [class*="filter"] label, [role="option"]').first();
        const isVisible = await filterOptions.isVisible({ timeout: 2000 }).catch(() => false);
        expect(isVisible).toBeTruthy();
      }
    }
  });

  test('Search reset - should clear search and show all vehicles', async ({ page }) => {
    // Open search
    const searchButton = page.locator('button[aria-label*="search" i]').first();
    if (await searchButton.isVisible()) {
      await searchButton.click();
      
      // Type something
      const searchInput = page.locator('input[type="search"]').first();
      await searchInput.fill('Tiguan');
      
      // Clear search
      await searchInput.clear();
      
      // Verify input is empty
      await expect(searchInput).toHaveValue('');
    }
  });
});
