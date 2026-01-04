/**
 * Value object representing race statistics.
 */
export class RaceStats {
	constructor(
		public readonly wpm: number = 0,
		public readonly accuracy: number = 100,
		public readonly progress: number = 0,
	) {}

	/**
	 * Creates a new RaceStats instance with updated values.
	 * @param wpm - The new WPM.
	 * @param accuracy - The new accuracy.
	 * @param progress - The new progress.
	 * @returns A new RaceStats object.
	 */
	update(wpm: number, accuracy: number, progress: number): RaceStats {
		return new RaceStats(wpm, accuracy, progress);
	}
}
