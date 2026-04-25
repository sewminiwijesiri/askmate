import { test, expect } from '@playwright/test';

test.describe('Voice Interaction Hub', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication login state
    await page.addInitScript(() => {
      window.localStorage.setItem('token', 'fake-token');
      window.localStorage.setItem('user', JSON.stringify({
        id: 'IT12345678',
        userId: 'IT12345678', // Add userId to match expected property
        name: 'Test Student',
        role: 'student',
        year: 1,
        semester: 1
      }));
    });

    // Mock SpeechRecognition API
    await page.addInitScript(() => {
      window.SpeechRecognition = window.webkitSpeechRecognition = function() {
        this.start = () => {
          this.isStarted = true;
          // Simulate a slight delay then return a result
          setTimeout(() => {
            if (this.onresult) {
              const event = {
                results: [
                  [{ transcript: 'How do I solve this integral?' }]
                ],
                resultIndex: 0
              };
              this.onresult(event);
            }
            // After result, stop the recording
            setTimeout(() => {
              if (this.onend) this.onend();
            }, 100);
          }, 500);
        };
        this.stop = () => {
          this.isStarted = false;
          if (this.onend) this.onend();
        };
      };
    });

    // Mock the AI Voice Process API
    await page.route('**/api/ai/voice-process', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          sourceText: 'How do I solve this integral?',
          detectedLang: 'en',
          translatedQuestion: 'How do I solve this integral?',
          targetText: 'To solve an integral, you can use methods like substitution, integration by parts, or partial fractions depending on the function structure.'
        })
      });
    });

    // Mock modules API to ensure the browser page loads correctly
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
  });

  test('should capture voice input and display AI response', async ({ page }) => {
    // 1. Navigate to the dashboard
    await page.goto('/dashboard'); 
    await expect(page).toHaveURL(/.*dashboard/);

    // 2. Click "Ask Question" in the dashboard to go to the Q&A Hub
    await page.getByRole('button', { name: 'Ask Question' }).first().click();

    // 3. Select a module in the Academic Browser
    await page.getByRole('heading', { name: 'Mathematics for Computing' }).click();

    // 4. Click "Ask Question" again in the Q&A Discussion header to open the modal
    await page.getByRole('button', { name: 'Ask Question' }).click();

    // 5. Open the Voice Interaction Hub
    await page.getByRole('button', { name: 'Voice Assistant' }).click();

    // 6. Verify Modal is open
    await expect(page.locator('text=Interaction Hub')).toBeVisible();

    // 5. Start Recording
    // The button icon changes from Mic to MicOff during recording
    const startRecordButton = page.locator('button:has(svg[class*="lucide-mic"])').last();
    await startRecordButton.click();

    // 6. Wait for transcript to appear (our mock sends it after 500ms)
    await expect(page.locator('text=How do I solve this integral?')).toBeVisible();

    // 7. Click the record button again to stop and trigger processing
    await startRecordButton.click();

    // 8. Verify Hub Results
    await expect(page.locator('text=Localized AI Insight')).toBeVisible();
    await expect(page.locator('text=To solve an integral, you can use methods')).toBeVisible();

    // 9. Verify "Send to Submission Form" functionality
    const sendButton = page.locator('text=Send to Submission Form');
    await expect(sendButton).toBeEnabled();
    await sendButton.click();

    // 10. Verify we are now on the submission step (askStep 2)
    // The input doesn't have a name attribute, so we'll use the placeholder or check for value
    const titleInput = page.getByPlaceholder('e.g. What is the difference between TCP and UDP?');
    await expect(titleInput).toHaveValue('How do I solve this integral?');
  });
});
