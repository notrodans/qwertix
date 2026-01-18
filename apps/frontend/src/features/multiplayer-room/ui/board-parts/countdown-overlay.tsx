import { type RoomStatus, RoomStatusEnum } from '@/entities/room';

interface CountdownOverlayProps {
	status: RoomStatus;
	countdown: number | null;
}

export function CountdownOverlay({ status, countdown }: CountdownOverlayProps) {
	if (status !== RoomStatusEnum.COUNTDOWN) return null;

	return (
		<div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
			<div className="text-9xl font-black text-primary animate-pulse drop-shadow-lg">
				{countdown !== null && countdown > 0 ? countdown : 'GO!'}
			</div>
		</div>
	);
}
