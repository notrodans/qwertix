import { reatomComponent } from '@reatom/react';
import { ExternalLink } from 'lucide-react';
import { fetchUserResults } from '@/entities/result';
import { cn } from '@/shared/lib/utils';
import {
	buttonVariants,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/shared/ui';
import { Link } from '@/shared/ui/link';
import '../model/history-model';

export const HistoryTable = reatomComponent(() => {
	const data = fetchUserResults.data();
	const isLoading = fetchUserResults.pending() > 0 && data.length === 0;

	if (isLoading) {
		return (
			<div className="text-muted-foreground py-8 text-center italic">
				Loading history...
			</div>
		);
	}

	if (!data || data.length === 0) {
		return (
			<div className="text-muted-foreground py-8 text-center">
				No races recorded yet.
			</div>
		);
	}

	const results = [...data].sort(
		(a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
	);

	return (
		<div className="rounded-lg border border-border overflow-hidden">
			<Table>
				<TableHeader className="bg-muted/50">
					<TableRow>
						<TableHead className="w-[200px]">Date</TableHead>
						<TableHead className="text-right">WPM</TableHead>
						<TableHead className="text-right">Raw</TableHead>
						<TableHead className="text-right">Accuracy</TableHead>
						<TableHead className="text-right w-[80px]" />
					</TableRow>
				</TableHeader>
				<TableBody>
					{results.map((result) => (
						<TableRow key={result.id} className="hover:bg-muted/30">
							<TableCell className="font-medium text-muted-foreground text-xs sm:text-sm">
								{new Date(result.createdAt).toLocaleString(undefined, {
									dateStyle: 'medium',
									timeStyle: 'short',
								})}
							</TableCell>
							<TableCell className="text-right font-mono text-lg font-bold text-primary">
								{result.wpm}
							</TableCell>
							<TableCell className="text-right font-mono text-muted-foreground">
								{result.raw}
							</TableCell>
							<TableCell className="text-right font-mono">
								<span
									className={
										result.accuracy === 100 ? 'text-primary font-bold' : ''
									}
								>
									{result.accuracy}%
								</span>
							</TableCell>
							<TableCell className="text-right">
								<Link
									to={`/result/${result.id}`}
									className={cn(
										buttonVariants({ variant: 'ghost', size: 'icon' }),
										'h-8 w-8 text-muted-foreground hover:text-foreground',
									)}
									title="View Details"
								>
									<ExternalLink className="w-4 h-4" />
								</Link>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
});
