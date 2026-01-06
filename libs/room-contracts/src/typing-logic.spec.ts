import { describe, expect, it } from 'vitest';
import {
	calculateAccuracy,
	calculateCorrectCharacters,
	calculateWPM,
	reconstructText,
} from './typing-logic';

describe('typing-logic', () => {
	describe('reconstructText', () => {
		it('should reconstruct simple text', () => {
			const events = [
				{ key: 'h', timestamp: 1 },
				{ key: 'i', timestamp: 2 },
			];
			expect(reconstructText(events)).toBe('hi');
		});

		it('should handle backspace', () => {
			const events = [
				{ key: 'h', timestamp: 1 },
				{ key: 'i', timestamp: 2 },
				{ key: 'Backspace', timestamp: 3 },
			];
			expect(reconstructText(events)).toBe('h');
		});

		it('should handle Ctrl+Backspace (delete word)', () => {
			const events = [
				{ key: 'h', timestamp: 1 },
				{ key: 'i', timestamp: 2 },
				{ key: ' ', timestamp: 3 },
				{ key: 't', timestamp: 4 },
				{ key: 'h', timestamp: 5 },
				{ key: 'e', timestamp: 6 },
				{ key: 'r', timestamp: 7 },
				{ key: 'e', timestamp: 8 },
				{ key: 'Backspace', timestamp: 9, ctrlKey: true },
			];
			// "hi there" -> "hi "
			expect(reconstructText(events)).toBe('hi ');
		});

		it('should handle Ctrl+Backspace with trailing spaces', () => {
			const events = [
				{ key: 'h', timestamp: 1 },
				{ key: 'i', timestamp: 2 },
				{ key: ' ', timestamp: 3 },
				{ key: ' ', timestamp: 4 },
				{ key: 'Backspace', timestamp: 5, ctrlKey: true },
			];
			// "hi  " -> "hi " (removes last word, which is empty? or removes spaces?)
			// Logic: "hi  " -> trimEnd -> "hi". lastSpace index 2 (after i? no, "hi" lastSpace -1)
			// Wait, "hi  " trimmed is "hi". lastSpace of "hi" is -1.
			// if lastSpace -1 -> slice(0, confirmedIndex).
			// So "hi  " -> "".
			// Let's verify this behavior.
			expect(reconstructText(events)).toBe('');
		});

		it('should handle Ctrl+Backspace with trailing spaces and previous word', () => {
			// "hello world  " -> "hello "
			// "hello world  " trimmed -> "hello world". lastSpace is 5.
			// slice(0, 5+1) -> "hello ".
			const events = [
				{ key: 'h', timestamp: 1 },
				{ key: 'e', timestamp: 2 },
				{ key: 'l', timestamp: 3 },
				{ key: 'l', timestamp: 4 },
				{ key: 'o', timestamp: 5 },
				{ key: ' ', timestamp: 6 },
				{ key: 'w', timestamp: 7 },
				{ key: 'o', timestamp: 8 },
				{ key: 'r', timestamp: 9 },
				{ key: 'l', timestamp: 10 },
				{ key: 'd', timestamp: 11 },
				{ key: ' ', timestamp: 12 },
				{ key: ' ', timestamp: 13 },
				{ key: 'Backspace', timestamp: 14, ctrlKey: true },
			];
			expect(reconstructText(events)).toBe('hello ');
		});
	});

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
