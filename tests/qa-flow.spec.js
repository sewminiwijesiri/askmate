import { test, expect } from '@playwright/test';

test.describe('Q&A System Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication login state
    await page.addInitScript(() => {
      window.localStorage.setItem('token', 'fake-token');
      window.localStorage.setItem('user', JSON.stringify({
        id: 'IT12345678',
        userId: 'IT12345678',
        name: 'Test Student',
        role: 'student',
        year: 1,
        semester: 1
      }));
    });

    // Mock modules API
    await page.route('**/api/admin/academic', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { 
            _id: 'mod1', 
            moduleName: 'Mathematics for Computing', 
            moduleCode: 'IT1010',
            year: 1,
            semester: 1
          }
        ])
      });
    });

    // Mock questions API (Listing)
    await page.route('**/api/questions?module=*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            _id: 'q1',
            title: 'How to use Taylor Series?',
            description: 'I need help understanding Taylor Series expansion for sin(x).',
            student: { studentId: 'IT12345678', name: 'Test Student' },
            createdAt: new Date().toISOString(),
            answersCount: 1,
            views: 5,
            isResolved: false,
            urgencyLevel: 'Normal'
          }
        ])
      });
    });

    // Mock answers API
    await page.route('**/api/answers?questionId=*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            _id: 'a1',
            content: 'You can use the formula sum (f^n(a)/n! * (x-a)^n).',
            student: { studentId: 'IT87654321', name: 'Expert Tutor', role: 'lecturer' },
            createdAt: new Date().toISOString()
          }
        ])
      });
    });

    // Mock question creation
    await page.route('**/api/questions', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            message: 'Question posted successfully',
            data: { _id: 'qnew', title: 'What is a Limit?' }
          })
        });
      } else {
        await route.continue();
      }
    });
  });

  test('should view existing questions and post a new one', async ({ page }) => {
    // 1. Navigate to dashboard
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/.*dashboard/);

    // 2. Go to Academic Hub
    await page.getByRole('button', { name: 'Ask Question' }).first().click();

    // 3. Select the Mathematics module
    await page.getByRole('heading', { name: 'Mathematics for Computing' }).click();

    // 4. Verify existing question is visible
    await expect(page.getByText('How to use Taylor Series?')).toBeVisible();

    // 5. Open question detail
    await page.getByRole('heading', { name: 'How to use Taylor Series?' }).click();

    // 6. Verify question title and description in the detail modal
    // In the modal it's an H3, in the list it was an H4
    await expect(page.getByRole('heading', { level: 3, name: 'How to use Taylor Series?' })).toBeVisible();
    await expect(page.getByText('Taylor Series expansion', { exact: false }).last()).toBeVisible();
    await expect(page.getByText('You can use the formula sum', { exact: false }).last()).toBeVisible();

    // 7. Close detail modal
    await page.getByRole('button').filter({ has: page.locator('svg[class*="lucide-x"]') }).last().click();

    // 8. Start posting a new question
    await page.getByRole('button', { name: 'Ask Question' }).click();

    // 9. Step 1: Topic selection
    await page.getByPlaceholder('e.g. Networking Fundamentals').fill('Calculus Limits');
    await page.getByRole('button', { name: 'Next Step' }).click();

    // 10. Step 2: Fill details
    await page.getByPlaceholder('e.g. What is the difference between TCP and UDP?').fill('What is a Limit?');
    await page.getByPlaceholder('Describe your question in detail...').fill('I am confused about the epsilon-delta definition of limits.');
    
    // Select urgency
    await page.getByText('Urgent', { exact: true }).click();

    // 11. Submit
    await page.getByRole('button', { name: 'Submit Question' }).click();

    // 12. Verify success (modal should close and toast might appear, but at minimum modal closes)
    await expect(page.getByText('Enter the Question')).not.toBeVisible();
  });
});
