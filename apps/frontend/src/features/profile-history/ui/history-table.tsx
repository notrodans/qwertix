import { reatomComponent } from '@reatom/react';
import { useEffect } from 'react';
import { fetchUserResults } from '@/entities/result';
import { Link } from '@/shared/ui/link';
import { historyUserIdAtom } from '../model/history-model';

interface HistoryTableProps {
	userId: string;
}

export const HistoryTable = reatomComponent(({ userId }: HistoryTableProps) => {
	useEffect(() => {
		historyUserIdAtom.set(userId);
	}, [userId]);

	const results = fetchUserResults.data();
	const isLoading = fetchUserResults.pending() > 0 && results.length === 0;

	if (isLoading) {
		return <div className="text-zinc-400">Loading history...</div>;
	}

	if (!results || results.length === 0) {
		return <div className="text-zinc-500">No races yet.</div>;
	}

	return (
		<div className="overflow-x-auto">
			<table className="w-full text-left text-sm text-zinc-400">
				<thead className="text-xs uppercase bg-zinc-800 text-zinc-400">
					<tr>
						<th className="px-6 py-3">Date</th>
						<th className="px-6 py-3">WPM</th>
						<th className="px-6 py-3">Accuracy</th>
						<th className="px-6 py-3">Actions</th>
					</tr>
				</thead>
				<tbody>
					{results.map((result) => (
						<tr
							key={result.id}
							className="bg-zinc-900 border-b border-zinc-800 hover:bg-zinc-800/50 transition-colors"
						>
							<td className="px-6 py-4">
								{new Date(result.createdAt).toLocaleDateString()}
							</td>
							<td className="px-6 py-4 font-bold text-emerald-400">
								{result.wpm}
							</td>
							<td className="px-6 py-4 text-yellow-400">{result.accuracy}%</td>
							<td className="px-6 py-4">
								<Link
									to={`/result/${result.id}`}
									className="text-blue-400 hover:text-blue-300"
								>
									View
								</Link>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
});
