interface CountdownOverlayProps {
	status: string;
	countdown: number | null;
}

export function CountdownOverlay({ status, countdown }: CountdownOverlayProps) {
	if (status !== 'COUNTDOWN') return null;

	return (
		<div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
			<div className="text-9xl font-black text-yellow-400 animate-pulse drop-shadow-lg">
				{countdown !== null && countdown > 0 ? countdown : 'GO!'}
			</div>
		</div>
	);
}
