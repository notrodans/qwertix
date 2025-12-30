import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { type Preset, presetApi } from '../model/api';

interface PresetSelectorProps {
	onSelect: (preset: Preset) => void;
	selectedPresetId?: number;
}

export function PresetSelector({
	onSelect,
	selectedPresetId,
}: PresetSelectorProps) {
	const {
		data: presets,
		isLoading,
		error,
	} = useQuery({
		queryKey: ['presets'],
		queryFn: presetApi.getPresets,
	});

	const [isOpen, setIsOpen] = useState(false);

	if (isLoading) return <div className="text-zinc-500">Loading presets...</div>;
	if (error) return <div className="text-red-500">Failed to load presets</div>;

	const selected = presets?.find((p) => p.id === selectedPresetId);

	return (
		<div className="relative">
			<button
				onClick={() => setIsOpen(!isOpen)}
				className="px-4 py-2 bg-zinc-800 rounded-md border border-zinc-700 hover:border-emerald-500 transition-colors flex items-center gap-2 min-w-50 justify-between"
			>
				<span>{selected ? selected.name : 'Select Mode'}</span>
				<span className="text-xs text-zinc-500">▼</span>
			</button>

			{isOpen && (
				<div className="absolute top-full left-0 mt-2 w-full bg-zinc-900 border border-zinc-700 rounded-md shadow-xl z-50 max-h-60 overflow-y-auto">
					{presets?.map((preset) => (
						<button
							key={preset.id}
							onClick={() => {
								onSelect(preset);
								setIsOpen(false);
							}}
							className={`w-full text-left px-4 py-2 hover:bg-zinc-800 transition-colors ${preset.id === selectedPresetId ? 'text-emerald-400' : 'text-zinc-300'}`}
						>
							<span className="font-bold">{preset.name}</span>
							<span className="ml-2 text-xs text-zinc-500">
								{preset.config.mode}{' '}
								{preset.config.mode === 'TIME'
									? `${preset.config.duration}s`
									: `${preset.config.wordCount}w`}
							</span>
						</button>
					))}
				</div>
			)}
		</div>
	);
}
