import { formatAccuracy, formatConsistency, formatWPM } from '../../domain/format';

interface StatsGridProps {
	stats: {
		wpm: number;
		raw: number;
		accuracy: number;
		consistency: number;
	};
}

export function StatsGrid({ stats }: StatsGridProps) {
	return (
		<div className="grid grid-cols-4 gap-4">
			<StatBox
				label="WPM"
				value={formatWPM(stats.wpm)}
				color="text-emerald-400"
			/>
			<StatBox
				label="ACC"
				value={formatAccuracy(stats.accuracy)}
				color="text-yellow-400"
			/>
			<StatBox
				label="RAW"
				value={formatWPM(stats.raw)}
				color="text-zinc-400"
			/>
			<StatBox
				label="CONS"
				value={formatConsistency(stats.consistency)}
				color="text-zinc-400"
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
		<div className="bg-zinc-800/30 p-4 rounded-xl border border-zinc-800 text-center">
			<div className="text-sm font-bold text-zinc-500 uppercase tracking-widest">
				{label}
			</div>
			<div className={`text-4xl font-black ${color}`}>{value}</div>
		</div>
	);
}
