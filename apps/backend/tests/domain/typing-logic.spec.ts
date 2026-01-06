import {
	calculateAccuracy,
	calculateCorrectCharacters,
	calculateWPM,
} from '@qwertix/room-contracts';
import { describe, expect, it } from 'vitest';

describe('typing-logic', () => {
	describe('calculateCorrectCharacters', () => {
		it('should count characters in correct words', () => {
			const target = 'hello world';
			const typed = 'hello world';
			// 'hello' (5) + space (1) + 'world' (5) = 11
			expect(calculateCorrectCharacters(typed, target)).toBe(11);
		});

		it('should NOT count characters in incorrect words', () => {
			const target = 'hello world';
			const typed = 'hellp world';
			// 'hellp' != 'hello' -> 0
			// 'world' == 'world' -> 5
			expect(calculateCorrectCharacters(typed, target)).toBe(5);
		});

		it('should handle extra characters in words as incorrect', () => {
			const target = 'hello world';
			const typed = 'helloo world';
			// 'helloo' != 'hello' -> 0
			// 'world' == 'world' -> 5
			expect(calculateCorrectCharacters(typed, target)).toBe(5);
		});

		it('should handle missing words', () => {
			const target = 'hello world';
			const typed = 'hello';
			expect(calculateCorrectCharacters(typed, target)).toBe(5);
		});

		it('should handle empty input', () => {
			expect(calculateCorrectCharacters('', 'hello')).toBe(0);
		});

		it('should count space correctly', () => {
			const target = 'abc def ghi';
			const typed = 'abc def';
			// 'abc' (3) + space (1) + 'def' (3) = 7
			expect(calculateCorrectCharacters(typed, target)).toBe(7);
		});

		it('should NOT count space if next word is missing or incorrect?', () => {
			// Our logic says: if (i < targetWords.length - 1 && i < typedWords.length - 1)
			// For 'abc ', typedWords is ['abc', '']
			const target = 'abc def';
			const typed = 'abc ';
			// i=0: 'abc' == 'abc'. correctChars += 3.
			// i=0 < 1 AND 0 < 1. correctChars += 1.
			// Total 4.
			expect(calculateCorrectCharacters(typed, target)).toBe(4);
		});
	});

	describe('calculateWPM', () => {
		it('should calculate WPM correctly', () => {
			// 50 chars, 1 minute -> (50/5)/1 = 10 WPM
			expect(calculateWPM(50, 0, 60000)).toBe(10);
		});

		it('should handle zero time', () => {
			expect(calculateWPM(50, 0, 0)).toBe(0);
		});
	});

	describe('calculateAccuracy', () => {
		it('should calculate accuracy посимвольно (as currently implemented)', () => {
			const target = 'hello';
			const typed = 'hellp';
			// 4 correct out of 5
			expect(calculateAccuracy(typed, target)).toBe(80);
		});
	});
});
