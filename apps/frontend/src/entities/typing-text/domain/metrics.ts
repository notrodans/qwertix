export function calculateWPM(
	typedLength: number,
	startTime: number,
	now: number,
): number {
	const timeMinutes = (now - startTime) / 60000;
	const charactersPerWord = 5;
	const words = typedLength / charactersPerWord;
	return timeMinutes > 0 ? words / timeMinutes : 0;
}

export function calculateAccuracy(
	typedText: string,
	targetText: string,
): number {
	if (typedText.length === 0) return 100;
	let correct = 0;
	const length = Math.min(typedText.length, targetText.length);
	for (let i = 0; i < length; i++) {
		if (typedText[i] === targetText[i]) correct++;
	}
	return Math.round((correct / typedText.length) * 100);
}

export function calculateProgress(
	typedLength: number,
	totalLength: number,
): number {
	if (totalLength === 0) return 0;
	return Math.min((typedLength / totalLength) * 100, 100);
}
