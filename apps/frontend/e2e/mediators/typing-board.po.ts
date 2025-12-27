import { expect, type Locator, type Page } from '@playwright/test';

export class TypingBoardPage {
	readonly page: Page;
	readonly loadingState: Locator;
	readonly board: Locator;
	readonly restartButton: Locator;
	readonly configSummary: Locator;

	constructor(page: Page) {
		this.page = page;
		this.loadingState = page.getByTestId('loading-state');
		this.board = page.getByTestId('typing-board');
		this.restartButton = page.getByTestId('restart-button');
		this.configSummary = page.getByTestId('config-summary');
	}

	async goto() {
		await this.page.goto('/');
	}

	async waitForLoad() {
		await expect(this.loadingState).toBeHidden();
		await expect(this.board).toBeVisible();
	}

	getWord(index: number) {
		return this.page.getByTestId('word').nth(index);
	}

	getChar(wordIndex: number, charIndex: number) {
		return this.getWord(wordIndex).getByTestId('char').nth(charIndex);
	}

	async type(text: string) {
		await this.page.click('body');
		await this.page.keyboard.type(text);
	}

	async press(key: string) {
		await this.page.keyboard.press(key);
	}

	async expectCharStatus(
		wordIndex: number,
		charIndex: number,
		status: 'correct' | 'incorrect' | 'untyped' | 'extra',
	) {
		const char = this.getChar(wordIndex, charIndex);
		if (status === 'extra') {
			await expect(char).toHaveAttribute('data-type', 'extra');
		} else {
			await expect(char).toHaveAttribute('data-status', status);
		}
	}

	async expectWordError(wordIndex: number, hasError = true) {
		await expect(this.getWord(wordIndex)).toHaveAttribute(
			'data-has-error',
			String(hasError),
		);
	}

	async getCharText(wordIndex: number, charIndex: number) {
		return (
			(await this.getChar(wordIndex, charIndex).getAttribute(
				'data-char-value',
			)) || ''
		);
	}
}
