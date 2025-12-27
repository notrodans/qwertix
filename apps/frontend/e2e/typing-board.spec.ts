import { expect, test } from '@playwright/test';
import { TypingBoardPage } from './mediators/typing-board.po';

test.describe('Typing Board Feature', () => {
	let board: TypingBoardPage;

	test.beforeEach(async ({ page }) => {
		board = new TypingBoardPage(page);
		await board.goto();
		await board.waitForLoad();
	});

	test('should render initial state correctly', async () => {
		await expect(board.configSummary).toBeVisible();
		await expect(board.restartButton).toBeVisible();

		// Check first word chars are untyped
		await board.expectCharStatus(0, 0, 'untyped');
	});

	test('should handle correct typing', async () => {
		const firstChar = await board.getCharText(0, 0);
		await board.type(firstChar);
		await board.expectCharStatus(0, 0, 'correct');
	});

	test('should handle incorrect typing', async () => {
		const firstChar = await board.getCharText(0, 0);
		const wrongChar = firstChar === 'z' ? 'x' : 'z';
		await board.type(wrongChar);
		await board.expectCharStatus(0, 0, 'incorrect');

		await board.expectWordError(0, false);
	});

	test('should handle backspace', async () => {
		const char = await board.getCharText(0, 0);
		await board.type(char);
		await board.expectCharStatus(0, 0, 'correct');

		await board.press('Backspace');
		await board.expectCharStatus(0, 0, 'untyped');
	});

	test('should handle extra characters', async () => {
		// Read the full first word
		// We need to iterate chars until we hit space or error?
		// Or simply get all chars of word 0.
		// The DOM renders chars. We can count them.

		const wordLocator = board.getWord(0);
		// Chars excluding space. Space has data-type='space'.
		const targetChars = wordLocator.locator(
			'[data-testid="char"]:not([data-type="space"])',
		);
		const count = await targetChars.count();

		// Construct the word
		let word = '';
		for (let i = 0; i < count; i++) {
			word += await targetChars.nth(i).getAttribute('data-char-value');
		}

		// Type the word + 'x'
		await board.type(word + 'x');

		// The extra char is at index `count`
		await board.expectCharStatus(0, count, 'extra');

		// Word should have error because it has extras
		await board.expectWordError(0, true);

		// Backspace to remove extra
		await board.press('Backspace');

		// Now at index `count`, we might have the space (if next word exists) or nothing.
		// In any case, it should NOT be 'extra'.
		const charAtIndex = board.getChar(0, count);

		// If it exists, check it's not extra.
		if ((await charAtIndex.count()) > 0) {
			await expect(charAtIndex).not.toHaveAttribute('data-type', 'extra');
		}

		await board.expectWordError(0, false);
	});

	test('should handle advanced backspace (Ctrl+Backspace)', async () => {
		// Read first 3 chars (assuming word len >= 3, usually true, but let's check)
		// If word is short ("of"), we type "of ".

		const wordLocator = board.getWord(0);
		const targetChars = wordLocator.locator(
			'[data-testid="char"]:not([data-type="space"])',
		);
		const count = await targetChars.count();

		const typeCount = Math.min(count, 3);
		let textToType = '';
		for (let i = 0; i < typeCount; i++) {
			textToType += await targetChars.nth(i).getAttribute('data-char-value');
		}

		await board.type(textToType);

		// Check last typed is correct
		await board.expectCharStatus(0, typeCount - 1, 'correct');

		await board.press('Control+Backspace');

		// Should delete back to start
		await board.expectCharStatus(0, 0, 'untyped');
	});

	test('should handle word completion and error marking', async () => {
		// We need to type word 0 incorrectly and hit space.
		const wordLocator = board.getWord(0);
		const targetChars = wordLocator.locator(
			'[data-testid="char"]:not([data-type="space"])',
		);
		const count = await targetChars.count();

		// Type word but wrong last char
		let word = '';
		for (let i = 0; i < count - 1; i++) {
			word += await targetChars.nth(i).getAttribute('data-char-value');
		}
		const lastRealChar = await targetChars
			.nth(count - 1)
			.getAttribute('data-char-value');
		const wrongChar = lastRealChar === 'z' ? 'x' : 'z';

		await board.type(word + wrongChar + ' ');

		// Now on word 1. Word 0 is "past".
		// Word 0 should have error because it's incorrect.
		await board.expectWordError(0, true);

		// Last char of word 0 should be incorrect
		await board.expectCharStatus(0, count - 1, 'incorrect');
	});
});
