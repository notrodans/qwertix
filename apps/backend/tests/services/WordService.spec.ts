import { describe, expect, it } from 'vitest';
import { WordService } from '../../src/services/WordService';

describe('WordService', () => {
	const wordService = new WordService();

	it('should return default number of words', () => {
		const words = wordService.getWords();
		expect(words).toHaveLength(30);
	});

	it('should return requested number of words', () => {
		const words = wordService.getWords(10);
		expect(words).toHaveLength(10);
	});

	it('should return words from the list', () => {
		const words = wordService.getWords(5);
		expect(words.every((w) => typeof w === 'string')).toBe(true);
	});
});
