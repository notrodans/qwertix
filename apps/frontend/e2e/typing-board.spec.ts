import { expect, test } from '@playwright/test';
import { TypingBoardPage } from './mediators/typing-board.po';

test.describe('Typing Board Feature', () => {
	let board: TypingBoardPage;

	test.beforeEach(async ({ page }) => {
		// Mock the backend API
		await page.route('**/api/words', async (route) => {
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify(['hello', 'world', 'test']),
			});
		});

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
			await expect(targetChars.nth(i)).toHaveAttribute('data-char-value', /./);
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
			await expect(targetChars.nth(i)).toHaveAttribute('data-char-value', /./);
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
			await expect(targetChars.nth(i)).toHaveAttribute('data-char-value', /./);
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

	test('should jump to next word when space is pressed on incomplete word', async () => {
		// Type only the first character of the first word
		const firstChar = await board.getCharText(0, 0);
		await board.type(firstChar + ' ');

		// Verify we are now on the second word
		// The first word should have an error because it's incomplete
		await board.expectWordError(0, true);

		// Type a character for the second word to verify input goes there
		const secondWordFirstChar = await board.getCharText(1, 0);
		await board.type(secondWordFirstChar);

		// Check the status of the first char of the second word
		await board.expectCharStatus(1, 0, 'correct');
	});

	test('should not allow backspace to return to previous word', async () => {
		// Type the first word fully + space
		const wordLocator = board.getWord(0);
		const targetChars = wordLocator.locator(
			'[data-testid="char"]:not([data-type="space"])',
		);
		const count = await targetChars.count();

		let word = '';
		for (let i = 0; i < count; i++) {
			await expect(targetChars.nth(i)).toHaveAttribute('data-char-value', /./);
			word += await targetChars.nth(i).getAttribute('data-char-value');
		}
		await board.type(word + ' ');

		// Now on second word. Type one char.
		const secondWordFirstChar = await board.getCharText(1, 0);
		await board.type(secondWordFirstChar);
		await board.expectCharStatus(1, 0, 'correct');

		// Backspace to remove the char on second word
		await board.press('Backspace');
		await board.expectCharStatus(1, 0, 'untyped');

		// Backspace again - should NOT go back to first word
		await board.press('Backspace');

		// Verify first word is still "past" (should still be fully typed/correct)
		// and we haven't modified it.
		// The last char of first word should be correct and typed.
		await board.expectCharStatus(0, count - 1, 'correct');

		// Verify we are still logically on the start of second word (or at least not modifying first)
		// We can test this by typing again, it should appear in second word
		await board.type(secondWordFirstChar);
		await board.expectCharStatus(1, 0, 'correct');
	});

	test('should allow backspace to return to previous word if it was incomplete', async () => {
		// Read first two chars of first word
		const char0 = await board.getCharText(0, 0);
		const char1 = await board.getCharText(0, 1);
		
		// Type incomplete first word (2 chars) + space
		await board.type(char0 + char1 + ' ');

		// Now on second word. Verify first word has error.
		await board.expectWordError(0, true);

		// Type one char of second word
		const secondChar = await board.getCharText(1, 0);
		await board.type(secondChar);
		await board.expectCharStatus(1, 0, 'correct');

		// Backspace: delete second word char
		await board.press('Backspace');
		await board.expectCharStatus(1, 0, 'untyped');

		// Backspace: delete space
		await board.press('Backspace');

		// Backspace: delete 2nd char of first word
		await board.press('Backspace');

		// Now we should be at index 1 of word 0
		// Let's verify index 1 is now untyped
		await board.expectCharStatus(0, 1, 'untyped');

		// And index 0 is still correct
		await board.expectCharStatus(0, 0, 'correct');
	});
});
