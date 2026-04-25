import { test, expect } from '@playwright/test';

test.describe('Lecturer Heatmap (Confusion Analytics) Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Mock lecturer authentication state
    await page.addInitScript(() => {
      window.localStorage.setItem('token', 'fake-lecturer-token');
      window.localStorage.setItem('user', JSON.stringify({
        userId: 'LEC001',
        name: 'Dr. Smith',
        role: 'lecturer'
      }));
    });

    // Mock lecturer dashboard API
    await page.route('**/api/lecturer/dashboard', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            stats: { activeModules: 2, totalStudents: 150, pendingQueries: 5, engagement: '85%' },
            activeModules: [
              { code: 'IT1010', name: 'Mathematics for Computing', students: 80, queries: 2, progress: 60 },
              { code: 'IT1020', name: 'Data Structures', students: 70, queries: 3, progress: 45 }
            ],
            topPeers: []
          }
        })
      });
    });

    // Mock confusion analytics API
    await page.route('**/api/analytics/confusion*', async (route) => {
      const url = new URL(route.request().url());
      const year = url.searchParams.get('year');
      const semester = url.searchParams.get('semester');

      let data = [];
      if (year === '1' && semester === '1') {
        data = [
          {
            topic: 'Taylor Series',
            module: 'Mathematics for Computing',
            confusionScore: 45.5,
            unresolvedQuestions: 8,
            totalQuestions: 20,
            difficultyScore: 3
          }
        ];
      } else if (year === '2' && semester === '1') {
        data = [
          {
            topic: 'Linked Lists',
            module: 'Data Structures',
            confusionScore: 25.0,
            unresolvedQuestions: 3,
            totalQuestions: 15,
            difficultyScore: 2
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

  test('should navigate to heatmap and filter by year/semester', async ({ page }) => {
    // 1. Navigate to dashboard
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/.*dashboard/);

    // 2. Click "Confusion Heatmap" in sidebar
    await page.getByRole('button', { name: 'Confusion Heatmap' }).click();

    // 3. Verify Header
    await expect(page.getByRole('heading', { name: 'Confusion Analytics' })).toBeVisible();

    // 4. Verify initial data (Y1S1)
    await expect(page.getByText('Taylor Series')).toBeVisible();
    await expect(page.getByText('High Alert')).toBeVisible();
    await expect(page.getByText('45.5')).toBeVisible();

    // 5. Change filter to Y2S1
    await page.getByRole('button', { name: 'Y2S1' }).click();

    // 6. Verify updated data (Y2S1)
    await expect(page.getByText('Linked Lists')).toBeVisible();
    await expect(page.getByText('Growing')).toBeVisible();
    await expect(page.getByText('25.0')).toBeVisible();

    // 7. Verify Y1S1 data is no longer visible
    await expect(page.getByText('Taylor Series')).not.toBeVisible();

    // 8. Test Empty State (e.g., Y3S1)
    await page.getByRole('button', { name: 'Y3S1' }).click();
    await expect(page.getByText('No significant confusion detected')).toBeVisible();
  });
});
