import { act, renderHook } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { useTyping } from './use-typing';

// Mock useCursorPositioning to avoid layout effect issues
vi.mock('./use-cursor-positioning', () => ({
	useCursorPositioning: () => vi.fn(),
}));

describe('useTyping', () => {
	it('should ignore double spaces in replayData', () => {
		const targetText = 'hello world';
		const containerRef = createRef<HTMLElement>();

		const { result } = renderHook(() => useTyping(targetText, containerRef));

		// Start typing
		act(() => {
			window.dispatchEvent(new KeyboardEvent('keydown', { key: 'h' }));
		});

		// Type 'hello ' (correct)
		act(() => {
			window.dispatchEvent(new KeyboardEvent('keydown', { key: 'e' }));
			window.dispatchEvent(new KeyboardEvent('keydown', { key: 'l' }));
			window.dispatchEvent(new KeyboardEvent('keydown', { key: 'l' }));
			window.dispatchEvent(new KeyboardEvent('keydown', { key: 'o' }));
			window.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }));
		});

		expect(result.current.userTyped).toBe('hello ');
		expect(result.current.replayData).toHaveLength(6); // h, e, l, l, o, space

		// Type extra space (should be ignored)
		act(() => {
			window.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }));
		});

		expect(result.current.userTyped).toBe('hello '); // Should not change

		// This expectation defines the fix: replayData should NOT increase
		expect(result.current.replayData).toHaveLength(6);
	});

	it('should ignore leading spaces in replayData', () => {
		const targetText = 'hello world';
		const containerRef = createRef<HTMLElement>();

		const { result } = renderHook(() => useTyping(targetText, containerRef));

		// Type leading space (should be ignored)
		act(() => {
			window.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }));
		});

		expect(result.current.userTyped).toBe('');
		expect(result.current.replayData).toHaveLength(0);
	});
});
