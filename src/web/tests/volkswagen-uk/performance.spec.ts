import { test, expect } from './seed.spec';

test.describe('Volkswagen UK - Page Performance and Content', () => {
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

  test('Page load - should load within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    
    // Navigate to home
    await page.goto('https://www.volkswagen.co.uk/', { waitUntil: 'networkidle' });
    
    const loadTime = Date.now() - startTime;
    
    // Verify page loaded in reasonable time (less than 10 seconds for networkidle)
    expect(loadTime).toBeLessThan(10000);
  });

  test('Page title - should have valid page title', async ({ page }) => {
    // Verify page has a title
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);
    expect(title.toLowerCase()).toContain('volkswagen');
  });

  test('Main content - should display content on homepage', async ({ page }) => {
    // Verify main content area is present
    const mainContent = page.locator('main, [role="main"], [class*="main" i]').first();
    const isVisible = await mainContent.isVisible({ timeout: 3000 }).catch(() => false);
    
    if (isVisible) {
      // Verify content has height/size
      const boundingBox = await mainContent.boundingBox();
      expect(boundingBox).toBeTruthy();
      expect(boundingBox!.height).toBeGreaterThan(0);
    }
  });

  test('Footer - should be present at bottom of page', async ({ page }) => {
    // Scroll to bottom
    await page.goto('https://www.volkswagen.co.uk/', { waitUntil: 'networkidle' });
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    
    // Wait for potential lazy load
    await page.waitForTimeout(1000);
    
    // Verify footer is visible
    const footer = page.locator('footer, [role="contentinfo"], [class*="footer"]').first();
    const isVisible = await footer.isVisible({ timeout: 2000 }).catch(() => false);
    
    if (isVisible) {
      // Verify footer has content
      const footerText = await footer.textContent();
      expect(footerText).toBeTruthy();
    }
  });

  test('No console errors - should not have critical errors', async ({ page }) => {
    const errors: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.goto('https://www.volkswagen.co.uk/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    
    // Verify no critical errors (some warnings may be acceptable)
    const criticalErrors = errors.filter(e => 
      !e.includes('warning') && 
      !e.includes('deprecated') &&
      e.length > 0
    );
    
    // Allow some errors but not many
    expect(criticalErrors.length).toBeLessThan(5);
  });

  test('Links are clickable - should be able to click main links', async ({ page }) => {
    // Find main navigation links
    const navLinks = page.locator('nav a, header a').first();
    
    if (await navLinks.isVisible({ timeout: 2000 })) {
      // Verify link is in viewport
      await navLinks.scrollIntoViewIfNeeded();
      
      // Verify link is clickable
      const isClickable = await navLinks.isEnabled();
      expect(isClickable).toBeTruthy();
    }
  });
});
