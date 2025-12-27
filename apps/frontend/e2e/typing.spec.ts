import { expect, test } from '@playwright/test';

test.describe('Typing functionality', () => {
	test.beforeEach(async ({ page }) => {
		// Disable MSW in the app
		await page.addInitScript(() => {
			(window as unknown as { __SKIP_MSW__: boolean }).__SKIP_MSW__ = true;
		});

		// Mock the words API to have deterministic text
		await page.route('**/api/words', async (route) => {
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify(['hello', 'world', 'again']),
			});
		});

		await page.goto('/');
	});

	test('should type correct characters', async ({ page }) => {
		const container = page.locator('.text-2xl');
		await expect(container).toBeVisible();
		await expect(container).toContainText('hello');

		// Type "he"
		await page.keyboard.type('he');

		// Check first two characters are correct (color: #d1d0c5)
		const spans = container.locator('span');
		await expect(spans.nth(0)).toHaveClass(/text-\[#d1d0c5\]/); // h
		await expect(spans.nth(1)).toHaveClass(/text-\[#d1d0c5\]/); // e
		await expect(spans.nth(2)).toHaveClass(/text-\[#646669\]/); // l (pending)
	});

	test('should handle incorrect characters', async ({ page }) => {
		const container = page.locator('.text-2xl');
		await expect(container).toBeVisible();
		await expect(container).toContainText('hello');

		// Type "hx" (second char wrong)
		await page.keyboard.type('hx');

		const spans = container.locator('span');
		await expect(spans.nth(0)).toHaveClass(/text-\[#d1d0c5\]/); // h (correct)
		await expect(spans.nth(1)).toHaveClass(/text-\[#ca4754\]/); // e (typed x -> incorrect)
	});

	test('should move to next word on space', async ({ page }) => {
		const container = page.locator('.text-2xl');
		await expect(container).toBeVisible();
		await expect(container).toContainText('hello world');

		// Type "hello "
		await page.keyboard.type('hello ');

		const spans = container.locator('span');

		// Check "hello" characters are all correct
		for (let i = 0; i < 5; i++) {
			await expect(spans.nth(i)).toHaveClass(/text-\[#d1d0c5\]/);
		}

		// Type 'w' of "world"
		await page.keyboard.type('w');

		// Index 5 is space, Index 6 is 'w'
		await expect(spans.nth(6)).toHaveClass(/text-\[#d1d0c5\]/);
	});

	test('cursor should not lag when skipping characters in a word', async ({
		page,
	}) => {
		const container = page.locator('.text-2xl');
		await expect(container).toBeVisible();

		// Type "he " (skipping "llo")
		await page.keyboard.type('he ');
		// Type "w" (start of next word "world")
		await page.keyboard.type('w');

		await page.waitForTimeout(150);

		const cursor = page.getByTestId('cursor');
		const cursorBox = await cursor.boundingBox();

		const wSpan = page.getByTestId('char-span').nth(6); // 'w' of 'world'
		const wBox = await wSpan.boundingBox();

		const oOfHelloSpan = page.getByTestId('char-span').nth(4); // 'o' of 'hello'
		const oOfHelloBox = await oOfHelloSpan.boundingBox();

		// Cursor should be past the first word
		expect(cursorBox?.x).toBeGreaterThan(oOfHelloBox?.x || 0);
		// Cursor should be close to 'w' span
		expect(Math.abs((cursorBox?.x || 0) - (wBox?.x || 0))).toBeLessThan(30);
	});

	test('cursor should animate smoothly across multiple words', async ({
		page,
	}) => {
		const cursor = page.getByTestId('cursor');

		const typeAndCheck = async (word: string) => {
			for (const char of word) {
				const boxBefore = await cursor.boundingBox();
				await page.keyboard.press(char);
				// Small wait to catch it mid-animation
				await page.waitForTimeout(40);
				const boxDuring = await cursor.boundingBox();
				await page.waitForTimeout(100);
				const boxAfter = await cursor.boundingBox();

				if (boxBefore && boxDuring && boxAfter) {
					expect(boxDuring.x).not.toBe(boxBefore.x);
					expect(boxDuring.x).not.toBe(boxAfter.x);
				}
			}
		};

		// First word
		await typeAndCheck('hello');
		// Space
		await page.keyboard.press('Space');
		await page.waitForTimeout(150);
		// Second word
		await typeAndCheck('world');
		// Space
		await page.keyboard.press('Space');
		await page.waitForTimeout(150);
		// Third word
		await typeAndCheck('again');
	});
});
