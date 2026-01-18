import { RaceModeEnum } from '@qwertix/room-contracts';
import type { RoomConfig } from '@/entities/room';
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	Label,
	ToggleGroup,
	ToggleGroupItem,
} from '@/shared/ui';

interface LobbySettingsProps {
	config: RoomConfig;
	isHost: boolean;
	onUpdateSettings: (config: RoomConfig) => void;
}

export function LobbySettings({
	config,
	isHost,
	onUpdateSettings,
}: LobbySettingsProps) {
	return (
		<Card className="bg-card border-border">
			<CardHeader>
				<CardTitle>Room Settings</CardTitle>
			</CardHeader>
			<CardContent className="space-y-6">
				<div className="space-y-3">
					<Label className="text-xs uppercase text-muted-foreground">
						Mode
					</Label>
					<ToggleGroup
						type="single"
						disabled={!isHost}
						value={config.mode === RaceModeEnum.TIME ? 'time' : 'words'}
						onValueChange={(val) => {
							if (!val) return;
							const mode =
								val === 'time' ? RaceModeEnum.TIME : RaceModeEnum.WORDS;
							onUpdateSettings(
								mode === RaceModeEnum.TIME
									? {
											mode: RaceModeEnum.TIME,
											duration: 30,
										}
									: {
											mode: RaceModeEnum.WORDS,
											wordCount: 30,
										},
							);
						}}
						className="justify-start"
					>
						<ToggleGroupItem
							value="words"
							className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
						>
							Words
						</ToggleGroupItem>
						<ToggleGroupItem
							value="time"
							className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
						>
							Time
						</ToggleGroupItem>
					</ToggleGroup>
				</div>

				{config.mode === RaceModeEnum.WORDS && (
					<div className="space-y-3 animate-in fade-in slide-in-from-top-2">
						<Label className="text-xs uppercase text-muted-foreground">
							Word Count
						</Label>
						<ToggleGroup
							type="single"
							disabled={!isHost}
							value={String(config.wordCount)}
							onValueChange={(val) => {
								if (val)
									onUpdateSettings({
										mode: RaceModeEnum.WORDS,
										wordCount: Number(val),
									});
							}}
							className="justify-start"
						>
							{[10, 25, 50, 100].map((count) => (
								<ToggleGroupItem
									key={count}
									value={String(count)}
									className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
								>
									{count}
								</ToggleGroupItem>
							))}
						</ToggleGroup>
					</div>
				)}

				{config.mode === RaceModeEnum.TIME && (
					<div className="space-y-3 animate-in fade-in slide-in-from-top-2">
						<Label className="text-xs uppercase text-muted-foreground">
							Time Limit (seconds)
						</Label>
						<ToggleGroup
							type="single"
							disabled={!isHost}
							value={String(config.duration)}
							onValueChange={(val) => {
								if (val)
									onUpdateSettings({
										mode: RaceModeEnum.TIME,
										duration: Number(val),
									});
							}}
							className="justify-start"
						>
							{[15, 30, 60, 120].map((seconds) => (
								<ToggleGroupItem
									key={seconds}
									value={String(seconds)}
									className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
								>
									{seconds}s
								</ToggleGroupItem>
							))}
						</ToggleGroup>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
