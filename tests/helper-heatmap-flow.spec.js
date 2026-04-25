import { test, expect } from '@playwright/test';

test.describe('Helper Heatmap (Confusion Analytics) Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Mock helper authentication state
    await page.addInitScript(() => {
      window.localStorage.setItem('token', 'fake-helper-token');
      window.localStorage.setItem('user', JSON.stringify({
        userId: 'HELP001',
        name: 'Sarah Smith',
        role: 'helper',
        year: '2',
        semester: '1'
      }));
    });

    // Mock modules API
    await page.route('**/api/admin/academic', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { _id: '1', moduleCode: 'IT2010', moduleName: 'Software Engineering', year: '2', semester: '1' },
          { _id: '2', moduleCode: 'IT2020', moduleName: 'Database Systems', year: '2', semester: '1' }
        ])
      });
    });

    // Mock confusion analytics API
    await page.route('**/api/analytics/confusion*', async (route) => {
      const url = new URL(route.request().url());
      const year = url.searchParams.get('year');
      const semester = url.searchParams.get('semester');

      let data = [];
      if (year === '2' && semester === '1') {
        data = [
          {
            topic: 'Relational Algebra',
            module: 'Database Systems',
            confusionScore: 55.0,
            unresolvedQuestions: 12,
            totalQuestions: 25,
            difficultyScore: 3
          }
        ];
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data })
      });
    });
  });

  test('should allow helper to view and filter confusion heatmap', async ({ page }) => {
    // 1. Navigate to dashboard
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/.*dashboard/);

    // 2. Click "Confusion Heatmap" in sidebar
    await page.getByRole('button', { name: 'Confusion Heatmap' }).click();

    // 3. Verify Header and Subtext
    await expect(page.getByRole('heading', { name: 'Module Heatmap' })).toBeVisible();
    await expect(page.getByText('Detecting academic confusion trends')).toBeVisible();

    // 4. Verify initial data (Y2S1 based on user profile)
    await expect(page.getByText('Relational Algebra')).toBeVisible();
    await expect(page.getByText('High Alert')).toBeVisible();
    await expect(page.getByText('55.0')).toBeVisible();

    // 5. Change filter to Y1S1 (should show empty state)
    await page.getByRole('button', { name: 'Y1S1' }).click();
    await expect(page.getByText('No significant confusion detected')).toBeVisible();

    // 6. Change back to Y2S1
    await page.getByRole('button', { name: 'Y2S1' }).click();
    await expect(page.getByText('Relational Algebra')).toBeVisible();
  });
});
