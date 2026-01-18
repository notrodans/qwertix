import { useMemo } from 'react';
import type { Participant } from '@/entities/room';
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/shared/ui';
import { formatWPM } from '../../domain/format';

interface LeaderboardSectionProps {
	participants: Participant[];
}

export function LeaderboardSection({ participants }: LeaderboardSectionProps) {
	const sorted = useMemo(
		() => [...participants].sort((a, b) => (a.rank || 99) - (b.rank || 99)),
		[participants],
	);

	return (
		<Card className="flex-1 bg-card/50 border-border">
			<CardHeader>
				<CardTitle className="text-muted-foreground">Leaderboard</CardTitle>
			</CardHeader>
			<CardContent>
				<Table>
					<TableHeader>
						<TableRow className="hover:bg-transparent">
							<TableHead>Rank</TableHead>
							<TableHead>User</TableHead>
							<TableHead className="text-right">WPM</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{sorted.map((p, index) => (
							<TableRow key={p.socketId} className="hover:bg-muted/50">
								<TableCell data-testid="rank" className="font-medium">
									{p.rank || index + 1}
								</TableCell>
								<TableCell data-testid="username">{p.username}</TableCell>
								<TableCell
									data-testid="wpm"
									className="text-right font-mono text-primary"
								>
									{formatWPM(p.wpm)}
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</CardContent>
		</Card>
	);
}
