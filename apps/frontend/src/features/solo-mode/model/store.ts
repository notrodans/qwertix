import { RaceModeEnum } from '@qwertix/room-contracts';
import { create } from 'zustand';

export type SoloStatus = 'START' | 'TYPING' | 'RESULT';

interface SoloModeState {
	mode: RaceModeEnum;
	duration: number; // 15, 30, 60, 120
	wordCount: number; // 10, 25, 50, 100
	status: SoloStatus;

	// Actions
	setMode: (mode: RaceModeEnum) => void;
	setDuration: (seconds: number) => void;
	setWordCount: (count: number) => void;
	setStatus: (status: SoloStatus) => void;
	reset: () => void;
}

export const useSoloModeStore = create<SoloModeState>((set) => ({
	mode: RaceModeEnum.WORDS,
	duration: 30,
	wordCount: 25,
	status: 'START',

	setMode: (mode) => set({ mode, status: 'START' }),
	setDuration: (duration) => set({ duration, status: 'START' }),
	setWordCount: (wordCount) => set({ wordCount, status: 'START' }),
	setStatus: (status) => set({ status }),
	reset: () => set({ status: 'START' }),
}));
