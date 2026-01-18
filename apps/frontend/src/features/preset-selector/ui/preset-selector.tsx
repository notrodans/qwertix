import { reatomComponent } from '@reatom/react';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/shared/ui';
import { type Preset } from '../model/api';
import { fetchPresets } from '../model/presets';

interface PresetSelectorProps {
	onSelect: (preset: Preset) => void;
	selectedPresetId?: number;
}

export const PresetSelector = reatomComponent(
	({ onSelect, selectedPresetId }: PresetSelectorProps) => {
		const presets = fetchPresets.data();
		const isLoading = fetchPresets.pending() > 0 && presets.length === 0;
		const error = fetchPresets.error();

		if (isLoading)
			return <div className="text-muted-foreground">Loading presets...</div>;
		if (error)
			return <div className="text-destructive">Failed to load presets</div>;

		return (
			<Select
				value={selectedPresetId?.toString()}
				onValueChange={(val) => {
					const preset = presets.find((p) => p.id.toString() === val);
					if (preset) onSelect(preset);
				}}
			>
				<SelectTrigger className="w-[200px] bg-card border-border">
					<SelectValue placeholder="Select Mode" />
				</SelectTrigger>
				<SelectContent>
					{presets?.map((preset) => (
						<SelectItem key={preset.id} value={preset.id.toString()}>
							<span className="font-bold mr-2">{preset.name}</span>
							<span className="text-xs text-muted-foreground">
								{preset.config.mode}
								{preset.config.mode === 'TIME'
									? ` ${preset.config.duration}s`
									: ` ${preset.config.wordCount}w`}
							</span>
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		);
	},
);
