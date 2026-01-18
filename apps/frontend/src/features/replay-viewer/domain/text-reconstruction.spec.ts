import { describe, expect, it } from 'vitest';
import { reconstructTextAtTime } from './text-reconstruction';

describe('reconstructTextAtTime', () => {
	const events = [
		{ key: 'h', timestamp: 100 },
		{ key: 'e', timestamp: 200 },
		{ key: 'l', timestamp: 300 },
		{ key: 'l', timestamp: 400 },
		{ key: 'o', timestamp: 500 },
	];

	it('should reconstruct full text if timestamp covers all events', () => {
		expect(reconstructTextAtTime(events, 600)).toBe('hello');
	});

	it('should reconstruct partial text based on timestamp', () => {
		expect(reconstructTextAtTime(events, 250)).toBe('he');
	});

	it('should handle backspace', () => {
		const backspaceEvents = [
			{ key: 'a', timestamp: 100 },
			{ key: 'b', timestamp: 200 },
			{ key: 'Backspace', timestamp: 300, confirmedIndex: 0 },
			{ key: 'c', timestamp: 400 },
		];
		expect(reconstructTextAtTime(backspaceEvents, 250)).toBe('ab');
		expect(reconstructTextAtTime(backspaceEvents, 350)).toBe('a');
		expect(reconstructTextAtTime(backspaceEvents, 450)).toBe('ac');
	});

	it('should handle Ctrl+Backspace', () => {
		const ctrlBackspaceEvents = [
			{ key: 'a', timestamp: 100 },
			{ key: ' ', timestamp: 200 },
			{ key: 'b', timestamp: 300 },
			{ key: 'Backspace', timestamp: 400, ctrlKey: true, confirmedIndex: 0 },
		];
		expect(reconstructTextAtTime(ctrlBackspaceEvents, 350)).toBe('a b');
		expect(reconstructTextAtTime(ctrlBackspaceEvents, 450)).toBe('a ');
	});
});
