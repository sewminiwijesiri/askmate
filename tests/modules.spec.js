import { test, expect } from '@playwright/test';

test.describe('Module Management (Admin)', () => {
  // You should set these in your environment or a .env file for tests
  const ADMIN_USER = process.env.TEST_ADMIN_USER || 'admin';
  const ADMIN_PASS = process.env.TEST_ADMIN_PASS || 'admin123';

  test.beforeEach(async ({ page }) => {
    // Login as Admin
    await page.goto('/');
    
    // Click the lock icon in the footer to open Admin Login
    await page.click('button[title="Admin Access"]');
    
    // Fill in admin credentials
    await page.fill('input[name="id"]', ADMIN_USER);
    await page.fill('input[name="password"]', ADMIN_PASS);
    await page.click('button[type="submit"]');
    
    // Wait for admin dashboard redirect
    await expect(page).toHaveURL(/\/admin\/dashboard/);
  });

  test('should navigate to Academic Hub and add a module', async ({ page }) => {
    // Navigate to Academic Hub
    await page.click('button:has-text("Academic Hub")');
    await expect(page.locator('h3:has-text("Academic Year")')).toBeVisible();

    // Click Add Module
    await page.click('button:has-text("Add Module")');
    
    // Fill module details
    const moduleCode = `IT${Math.floor(1000 + Math.random() * 9000)}`;
    await page.fill('input[placeholder="Enter module name"]', 'Test Module');
    await page.fill('input[placeholder="e.g. IT3050"]', moduleCode);
    await page.fill('textarea[placeholder="Describe the module focus..."]', 'This is a test module created by Playwright');
    
    // Submit and wait for modal to disappear
    await page.click('button:has-text("Create Module")');
    await expect(page.locator('text=New Academic Module')).not.toBeVisible();
    
    // Check if it appears in the list
    await expect(page.locator('text=Test Module').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator(`text=${moduleCode}`)).toBeVisible();
  });
});
