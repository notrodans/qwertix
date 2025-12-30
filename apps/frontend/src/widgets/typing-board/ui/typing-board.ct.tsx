import { expect, test } from '@playwright/experimental-ct-react';
import { TypingBoard } from './typing-board';

test.use({ viewport: { width: 1000, height: 600 } });

test('TypingBoard should render and handle typing', async ({ mount, page }) => {
	// Mock the API
	await page.route('**/api/words', async (route) => {
		await route.fulfill({
			status: 200,
			contentType: 'application/json',
			body: JSON.stringify(['hello', 'world']),
		});
	});

	const component = await mount(<TypingBoard />);

	// Wait for board to appear (it will appear after loading finishes)
	const board = page.getByTestId('typing-board');
	await expect(board).toBeVisible({ timeout: 10000 });

	// Verify first word
	const firstWord = page.getByTestId('word').first();
	await expect(firstWord).toContainText('hello');

	// Simulate typing 'h'
	await page.keyboard.type('h');

	// Verify first char status (using attribute from TextDisplay/Character components)
	const firstChar = firstWord.getByTestId('char').first();
	await expect(firstChar).toHaveAttribute('data-status', 'correct');

	// Simulate incorrect typing 'x'
	await page.keyboard.type('x');
	const secondChar = firstWord.getByTestId('char').nth(1);
	await expect(secondChar).toHaveAttribute('data-status', 'incorrect');

	// Restart
	await component.getByTestId('restart-button').click();

	// Should be empty again (wait for re-render/refetch)
	await expect(firstWord.getByTestId('char').first()).toHaveAttribute(
		'data-status',
		'untyped',
	);
});
