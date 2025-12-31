export function formatWPM(wpm: number): string {
	return Math.round(wpm).toString();
}

export function formatAccuracy(accuracy: number): string {
	return `${accuracy}%`;
}

export function formatConsistency(consistency: number): string {
	return `${consistency}%`;
}

export function formatTime(ms: number) {
	const s = Math.floor(ms / 1000);
	const m = Math.floor(s / 60);
	const rs = s % 60;
	return `${m}:${rs.toString().padStart(2, '0')}`;
}
