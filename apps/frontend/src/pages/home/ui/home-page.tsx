import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { roomQueries } from '@/entities/room';
import { PresetSelector } from '@/features/preset-selector';
import { Header } from '@/widgets/header';
import { MainLayout } from '@/widgets/layout';
import { TypingBoard } from '@/widgets/typing-board/pub';

export function HomePage() {
	const navigate = useNavigate();
	const [selectedPresetId, setSelectedPresetId] = useState<number>();

	const handleCreateRoom = async () => {
		try {
			const { roomId } = await roomQueries.create(selectedPresetId);
			navigate(`/room/${roomId}`);
		} catch (e) {
			console.error('Failed to create room', e);
			alert('Failed to create room');
		}
	};

	return (
		<MainLayout header={<Header />}>
			<div className="flex flex-col gap-8 w-full">
				<div className="flex justify-between items-center w-full">
					<PresetSelector
						selectedPresetId={selectedPresetId}
						onSelect={(p) => setSelectedPresetId(p.id)}
					/>
					<button
						onClick={handleCreateRoom}
						className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-2 px-4 rounded transition-colors"
					>
						Create Multiplayer Room
					</button>
				</div>
				<TypingBoard />
			</div>
		</MainLayout>
	);
}
