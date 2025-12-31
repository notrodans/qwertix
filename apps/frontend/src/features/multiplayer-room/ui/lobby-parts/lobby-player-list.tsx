import type { Participant } from '@/entities/room';

interface LobbyPlayerListProps {
	participants: Participant[];
	isHost: boolean;
	onTransferHost: (targetId: string) => void;
}

export function LobbyPlayerList({
	participants,
	isHost,
	onTransferHost,
}: LobbyPlayerListProps) {
	return (
		<div className="bg-gray-800 p-4 rounded-lg">
			<h2 className="text-xl mb-4 font-bold">
				Players ({participants.length})
			</h2>
			<ul className="space-y-2">
				{participants.map((p) => (
					<li
						key={p.socketId}
						className="bg-gray-700/50 p-3 rounded flex justify-between items-center"
					>
						<div className="flex flex-col">
							<span className="font-bold">
								{p.username} {p.isHost ? '👑' : ''}
							</span>
						</div>
						{isHost && !p.isHost && (
							<button
								onClick={() => onTransferHost(p.socketId)}
								className="text-[10px] bg-gray-600 hover:bg-gray-500 px-2 py-1 rounded uppercase tracking-tighter"
							>
								Make Host
							</button>
						)}
					</li>
				))}
			</ul>
		</div>
	);
}
