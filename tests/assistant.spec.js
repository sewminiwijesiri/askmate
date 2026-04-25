import { test, expect } from '@playwright/test';

test.describe('AI Assistant', () => {
  const STUDENT_USER = process.env.TEST_STUDENT_USER || 'IT12345678';
  const STUDENT_PASS = process.env.TEST_STUDENT_PASS || 'password123';

  test.beforeEach(async ({ page }) => {
    // Login as Student
    await page.goto('/login');
    await page.selectOption('select', 'student');
    await page.fill('input[name="id"]', STUDENT_USER);
    await page.fill('input[name="password"]', STUDENT_PASS);
    await page.click('button[type="submit"]');
    
    // Wait for dashboard or redirect
    await expect(page).toHaveURL(/\/dashboard/);

    // Navigate to AI Assistant
    await page.goto('/student/assistant');
    
    // Select a module (Required for chat to be enabled)
    // We assume the seeded module IT1010 exists in Y1/S1
    await page.selectOption('select:has(option:text("Year"))', '1');
    await page.selectOption('select:has(option:text("Sem"))', '1');
    await page.selectOption('select:has(option:text("Select Course Module"))', { index: 1 });
  });

  test('should interact with AI Assistant', async ({ page }) => {
    // Type a question
    const question = 'What is this module about?';
    const inputSelector = 'input[placeholder*="Ask anything"]';
    await page.fill(inputSelector, question);
    await page.press(inputSelector, 'Enter');

    // Check for thinking state
    await expect(page.locator('text=Thinking...')).toBeVisible();

    // Check for response (longer timeout as AI can be slow)
    await expect(page.locator('.whitespace-pre-wrap').last()).not.toContainText(question, { timeout: 30000 });
  });

  test('should clear chat session', async ({ page }) => {
    // Type something to have a message
    const inputSelector = 'input[placeholder*="Ask anything"]';
    await page.fill(inputSelector, 'Hello');
    await page.press(inputSelector, 'Enter');
    
    // Set up dialog handler BEFORE clicking
    page.once('dialog', dialog => dialog.accept());
    
    // Click clear button (Trash2 icon)
    await page.click('button[title="Reset Conversation"]');
    
    // Check if welcome screen is back
    await expect(page.locator('text=How can I assist?')).toBeVisible();
  });
});
