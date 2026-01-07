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
		it('should evaluate accuracy based on individual character matches', () => {
			const target = 'hello';
			const typed = 'hellp';
			// 4 correct out of 5
			expect(calculateAccuracy(typed, target)).toBe(80);
		});

		it('should handle the specific case provided by the user (repro 4% bug)', () => {
			const targetText =
				'this as many from will that thing just same want or go take no most at when the with turn good while move but real';

			const replayData = [
				{ key: 't', timestamp: 0 },
				{ key: 'h', timestamp: 60 },
				{ key: 'i', timestamp: 192 },
				{ key: 'o', timestamp: 196 },
				{ key: 's', timestamp: 208 },
				{ key: ' ', timestamp: 284 },
				{ key: 'a', timestamp: 370 },
				{ key: 's', timestamp: 479 },
				{ key: ' ', timestamp: 517 },
				{ key: 'Backspace', ctrlKey: false, timestamp: 689, confirmedIndex: 9 },
				{ key: 'Backspace', ctrlKey: false, timestamp: 785, confirmedIndex: 9 },
				{ key: 'Backspace', ctrlKey: false, timestamp: 891, confirmedIndex: 9 },
				{ key: 'Backspace', ctrlKey: false, timestamp: 997, confirmedIndex: 9 },
				{
					key: 'Backspace',
					ctrlKey: false,
					timestamp: 1132,
					confirmedIndex: 9,
				},
				{ key: 'm', timestamp: 1572 },
				{ key: 'a', timestamp: 1658 },
				{ key: 'n', timestamp: 1740 },
				{ key: 'y', timestamp: 1898 },
				{ key: ' ', timestamp: 1918 },
				{ key: 'f', timestamp: 1990 },
				{ key: 'r', timestamp: 2055 },
				{ key: 'o', timestamp: 2093 },
				{ key: 'm', timestamp: 2205 },
				{ key: ' ', timestamp: 2261 },
				{ key: 'w', timestamp: 2311 },
				{ key: 'i', timestamp: 2357 },
				{ key: 'l', timestamp: 2497 },
				{ key: 'l', timestamp: 2603 },
				{ key: ' ', timestamp: 2615 },
				{ key: 't', timestamp: 2707 },
				{ key: 'h', timestamp: 2767 },
				{ key: 'a', timestamp: 2805 },
				{ key: 't', timestamp: 2893 },
				{ key: ' ', timestamp: 2945 },
				{ key: 't', timestamp: 3032 },
				{ key: 'h', timestamp: 3092 },
				{ key: 'i', timestamp: 3204 },
				{ key: 'n', timestamp: 3318 },
				{ key: 'g', timestamp: 3376 },
				{ key: ' ', timestamp: 3434 },
				{ key: 'j', timestamp: 3502 },
				{ key: 'u', timestamp: 3638 },
				{ key: 's', timestamp: 3664 },
				{ key: 't', timestamp: 3775 },
				{ key: ' ', timestamp: 3849 },
				{ key: 's', timestamp: 3963 },
				{ key: 'a', timestamp: 4101 },
				{ key: 'm', timestamp: 4219 },
				{ key: 'e', timestamp: 4289 },
				{ key: ' ', timestamp: 4365 },
				{ key: 'w', timestamp: 4449 },
				{ key: 'a', timestamp: 4597 },
				{ key: 'n', timestamp: 4707 },
				{ key: 't', timestamp: 4726 },
				{ key: ' ', timestamp: 4870 },
				{ key: 'o', timestamp: 5316 },
				{ key: 'r', timestamp: 5390 },
				{ key: ' ', timestamp: 5471 },
				{ key: 'g', timestamp: 5583 },
				{ key: 'o', timestamp: 5669 },
				{ key: ' ', timestamp: 5753 },
				{ key: 't', timestamp: 5859 },
				{ key: 'a', timestamp: 5947 },
				{ key: 'k', timestamp: 6025 },
				{ key: 'e', timestamp: 6127 },
				{ key: ' ', timestamp: 6215 },
				{ key: 'n', timestamp: 6230 },
				{ key: 'o', timestamp: 6347 },
				{ key: ' ', timestamp: 6419 },
				{ key: 'm', timestamp: 6491 },
				{ key: 'o', timestamp: 6594 },
				{ key: 's', timestamp: 6618 },
				{ key: 't', timestamp: 6730 },
				{ key: ' ', timestamp: 6800 },
				{ key: 'a', timestamp: 6878 },
				{ key: 't', timestamp: 6976 },
				{ key: ' ', timestamp: 7054 },
				{ key: 'w', timestamp: 7295 },
				{ key: 'h', timestamp: 7411 },
				{ key: 'e', timestamp: 7489 },
				{ key: 'n', timestamp: 7555 },
				{ key: ' ', timestamp: 7629 },
				{ key: 't', timestamp: 7713 },
				{ key: 'h', timestamp: 7791 },
				{ key: 'e', timestamp: 7917 },
				{ key: ' ', timestamp: 7987 },
				{ key: 'w', timestamp: 8077 },
				{ key: 'i', timestamp: 8195 },
				{ key: 't', timestamp: 8257 },
				{ key: 'h', timestamp: 8377 },
				{ key: ' ', timestamp: 8418 },
				{ key: 'r', timestamp: 8520 },
				{ key: 't', timestamp: 8534 },
				{ key: 'u', timestamp: 8580 },
				{
					key: 'Backspace',
					ctrlKey: false,
					timestamp: 8842,
					confirmedIndex: 86,
				},
				{
					key: 'Backspace',
					ctrlKey: false,
					timestamp: 8941,
					confirmedIndex: 86,
				},
				{
					key: 'Backspace',
					ctrlKey: false,
					timestamp: 9045,
					confirmedIndex: 86,
				},
				{ key: 't', timestamp: 9231 },
				{ key: 'u', timestamp: 9317 },
				{ key: 'r', timestamp: 9403 },
				{ key: 'n', timestamp: 9433 },
				{ key: ' ', timestamp: 9509 },
				{ key: 't', timestamp: 9603 },
				{
					key: 'Backspace',
					ctrlKey: false,
					timestamp: 9931,
					confirmedIndex: 91,
				},
				{ key: 'g', timestamp: 10087 },
				{ key: 'o', timestamp: 10145 },
				{ key: 'o', timestamp: 10244 },
				{ key: 'd', timestamp: 10286 },
				{ key: ' ', timestamp: 10350 },
				{ key: 'w', timestamp: 10464 },
				{ key: 'h', timestamp: 10498 },
				{ key: 'i', timestamp: 10645 },
				{ key: 'l', timestamp: 10753 },
				{ key: 'e', timestamp: 10813 },
				{ key: ' ', timestamp: 10871 },
				{ key: 'm', timestamp: 10957 },
				{ key: 'o', timestamp: 11103 },
				{ key: 'v', timestamp: 11143 },
				{ key: 'e', timestamp: 11211 },
				{ key: ' ', timestamp: 11271 },
				{ key: 'g', timestamp: 11471 },
				{ key: 'u', timestamp: 11595 },
				{
					key: 'Backspace',
					ctrlKey: false,
					timestamp: 11795,
					confirmedIndex: 107,
				},
				{
					key: 'Backspace',
					ctrlKey: false,
					timestamp: 11897,
					confirmedIndex: 107,
				},
				{ key: 'b', timestamp: 11931 },
				{ key: 'u', timestamp: 12046 },
				{ key: 't', timestamp: 12120 },
				{ key: ' ', timestamp: 12192 },
				{ key: 'r', timestamp: 12296 },
				{ key: 'e', timestamp: 12445 },
				{ key: 'a', timestamp: 12495 },
				{ key: 'l', timestamp: 12513 },
			];
			const typedText = reconstructText(replayData);
			const accuracy = calculateAccuracy(typedText, targetText);

			// Accuracy should be high
			expect(accuracy).toBeGreaterThan(80);
		});
	});
});
