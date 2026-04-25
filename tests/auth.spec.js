import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should show validation errors on empty login', async ({ page }) => {
    await page.goto('/login');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=ID or Username is required')).toBeVisible();
    await expect(page.locator('text=Password is required')).toBeVisible();
  });

  test('should login successfully as student', async ({ page }) => {
    // Note: Requires valid TEST_STUDENT_USER and TEST_STUDENT_PASS in environment
    const user = process.env.TEST_STUDENT_USER || 'IT12345678';
    const pass = process.env.TEST_STUDENT_PASS || 'password123';

    await page.goto('/login');
    await page.selectOption('select', 'student');
    await page.fill('input[name="id"]', user);
    await page.fill('input[name="password"]', pass);
    await page.click('button[type="submit"]');

    // Should redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('should navigate to register page', async ({ page }) => {
    await page.goto('/login');
    await page.click('text=Register');
    await expect(page).toHaveURL(/\/register/);
  });
});
