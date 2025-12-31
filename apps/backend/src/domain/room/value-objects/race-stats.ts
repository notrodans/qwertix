export class RaceStats {
	constructor(
		public readonly wpm: number = 0,
		public readonly accuracy: number = 100,
		public readonly progress: number = 0,
	) {}

	update(wpm: number, accuracy: number, progress: number): RaceStats {
		return new RaceStats(wpm, accuracy, progress);
	}
}
