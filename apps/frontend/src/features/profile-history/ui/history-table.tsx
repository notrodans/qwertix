import { useUserResults } from '@/entities/result';
import { Link } from 'react-router-dom';

interface HistoryTableProps {
	userId: number;
}

export function HistoryTable({ userId }: HistoryTableProps) {
	const { data: results, isLoading, error } = useUserResults(userId);

	if (isLoading) return <div>Loading history...</div>;
	if (error) return <div>Error loading history</div>;
	if (!results || results.length === 0) return <div>No games played yet.</div>;

	return (
		<div className="overflow-x-auto w-full">
			<table className="min-w-full bg-zinc-900 border border-zinc-800 rounded-lg text-left">
				<thead className="bg-zinc-800">
					<tr>
						<th className="px-6 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wider">
							Date
						</th>
						<th className="px-6 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wider">
							WPM
						</th>
						<th className="px-6 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wider">
							Accuracy
						</th>
						<th className="px-6 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wider">
							Actions
						</th>
					</tr>
				</thead>
				<tbody className="divide-y divide-zinc-800">
					{results.map((result) => (
						<tr key={result.id}>
							<td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-100">
								{new Date(result.createdAt).toLocaleString()}
							</td>
							<td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-100">
								{result.wpm}
							</td>
							<td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-100">
								{result.accuracy}%
							</td>
							<td className="px-6 py-4 whitespace-nowrap text-sm text-blue-400 hover:text-blue-300">
								<Link to={`/result/${result.id}`}>View Replay</Link>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
