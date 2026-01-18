import { cn } from '@/shared/lib/utils';
import { Card, CardContent } from '@/shared/ui';
import { formatAccuracy, formatWPM } from '../../domain/format';

interface StatsGridProps {
	stats: {
		wpm: number;
		raw: number;
		accuracy: number;
		afkDuration?: number;
	};
}

export function StatsGrid({ stats }: StatsGridProps) {
	return (
		<div className="grid grid-cols-4 gap-4">
			<StatBox label="WPM" value={formatWPM(stats.wpm)} color="text-primary" />
			<StatBox
				label="ACC"
				value={formatAccuracy(stats.accuracy)}
				color="text-primary"
			/>
			<StatBox
				label="RAW"
				value={formatWPM(stats.raw)}
				color="text-muted-foreground"
			/>
			<StatBox
				label="AFK"
				value={
					stats.afkDuration
						? (stats.afkDuration / 1000).toFixed(1) + 's'
						: '0.0s'
				}
				color="text-destructive"
			/>
		</div>
	);
}

function StatBox({
	label,
	value,
	color,
}: {
	label: string;
	value: string | number;
	color: string;
}) {
	return (
		<Card className="bg-muted/30 border-border">
			<CardContent className="flex flex-col items-center justify-center p-4">
				<div className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
					{label}
				</div>
				<div className={cn('text-4xl font-black', color)}>{value}</div>
			</CardContent>
		</Card>
	);
}
