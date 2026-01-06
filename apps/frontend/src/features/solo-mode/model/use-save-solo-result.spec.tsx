import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useSaveSoloResult } from './use-save-solo-result';

const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
        },
    });
    return ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
};

// Mock env
vi.mock('@env', () => ({
    env: {
        VITE_RESULT_HASH_SALT: 'test_salt',
        VITE_API_URL: 'http://localhost:3000',
    },
}));

// Mock fetch
global.fetch = vi.fn();

describe('useSaveSoloResult', () => {
    it('should calculate stats and hash, then send payload', async () => {
        const { result } = renderHook(() => useSaveSoloResult(), {
            wrapper: createWrapper(),
        });

        const mockResponse = {
            wpm: 60,
            raw: 60,
            accuracy: 100,
            consistency: 100,
        };

        (global.fetch as any).mockResolvedValue({
            ok: true,
            json: async () => mockResponse,
        });

        const startTime = Date.now() - 60000; // 1 min ago
        const endTime = Date.now();
        const targetText = 'word '.repeat(12).trim(); // 60 chars = 12 words? No, 5 chars/word. 60 chars = 12 words. 
        // 12 words in 1 min = 12 WPM. 
        // Let's make it 60 WPM. 60 words * 5 = 300 chars.
        const text60WPM = 'aaaaa '.repeat(60).trim(); 
        
        const replayData = Array.from({ length: 360 }).map((_, i) => {
            // Every 6th char is a space (5 'a' + 1 space)
            const isSpace = (i + 1) % 6 === 0;
            return {
                key: isSpace ? ' ' : 'a',
                timestamp: startTime + (i * 100), 
            };
        });
        // 360 characters total. 60 words * 6 chars/word (5+1) = 360.
        // Time = 360 * 100 = 36000ms = 0.6 min.
        // WPM = (360/5) / 0.6 = 72 / 0.6 = 120 WPM.

        result.current.mutate({
            userId: 'user-1',
            targetText: text60WPM,
            replayData: replayData as any,
            startTime,
            endTime,
            consistency: 100,
        });

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledTimes(1);
        });

        const callArgs = (global.fetch as any).mock.calls[0];
        const url = callArgs[0];
        const options = callArgs[1];
        const body = JSON.parse(options.body);

        expect(url).toBe('/api/results');
        expect(body).toMatchObject({
            userId: 'user-1',
            targetText: text60WPM,
            consistency: 100,
        });
        
        // Verify calculated stats (locally calculated before send)
        // Note: The hook calculates WPM based on replayData and time.
        // My simplistic replay data might result in specific WPM.
        // 300 chars in 60000ms = 60 WPM.
        expect(body.wpm).toBe(72);
        expect(body.accuracy).toBe(100); 
        // Wait, I need to check reconstructText logic.
        // replayData keys are 'a'.
        // So typed text is 'aaaaa...'.
        // targetText is 'aaaaa...'.
        // Accuracy should be 100.
        
        expect(body.hash).toBeDefined();
        expect(typeof body.hash).toBe('string');
        expect(body.hash.length).toBeGreaterThan(0);
    });
});
