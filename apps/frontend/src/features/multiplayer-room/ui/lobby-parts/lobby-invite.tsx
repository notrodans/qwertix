interface LobbyInviteProps {
	shareUrl: string;
}

export function LobbyInvite({ shareUrl }: LobbyInviteProps) {
	return (
		<div className="bg-gray-800 p-4 rounded-lg">
			<p className="text-gray-400 text-sm mb-2">Invite friends:</p>
			<div className="flex gap-2">
				<input
					readOnly
					value={shareUrl}
					className="bg-gray-700 text-white px-3 py-1 rounded flex-1 text-xs"
				/>
				<button
					onClick={() => navigator.clipboard.writeText(shareUrl)}
					className="bg-blue-600 hover:bg-blue-500 px-3 py-1 rounded text-white text-xs"
				>
					Copy
				</button>
			</div>
		</div>
	);
}
