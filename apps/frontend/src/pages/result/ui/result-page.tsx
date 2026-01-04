import { useParams } from 'react-router-dom';
import { useReplay, useResult } from '@/entities/result';
import { ReplayViewer } from '@/features/replay-viewer';
import { Header } from '@/widgets/header';
import { MainLayout } from '@/widgets/layout';

export function ResultPage() {
	const { resultId } = useParams<{ resultId: string }>();
	const id = parseInt(resultId || '0');

	const {
		data: result,
		isLoading: isResultLoading,
		error: resultError,
	} = useResult(id);
	const { data: replay, isLoading: isReplayLoading } = useReplay(id);

	if (isResultLoading || isReplayLoading) {
		return (
			<MainLayout header={<Header />}>
				<div>Loading result...</div>
			</MainLayout>
		);
	}

	if (resultError || !result) {
		return (
			<MainLayout header={<Header />}>
				<div>Error loading result.</div>
			</MainLayout>
		);
	}

	return (
		<MainLayout header={<Header />}>
			<div className="w-full space-y-8">
				<div className="text-center space-y-2">
					<h1 className="text-3xl font-bold text-zinc-100">Race Result</h1>
					<p className="text-zinc-500">
						{new Date(result.createdAt).toLocaleString()}
					</p>
				</div>

				<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
					<div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800 text-center">
						<div className="text-sm text-zinc-500 uppercase tracking-wider">
							WPM
						</div>
						<div className="text-4xl font-bold text-yellow-500">
							{result.wpm}
						</div>
					</div>
					<div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800 text-center">
						<div className="text-sm text-zinc-500 uppercase tracking-wider">
							Raw
						</div>
						<div className="text-4xl font-bold text-zinc-300">{result.raw}</div>
					</div>
					<div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800 text-center">
						<div className="text-sm text-zinc-500 uppercase tracking-wider">
							Accuracy
						</div>
						<div className="text-4xl font-bold text-zinc-300">
							{result.accuracy}%
						</div>
					</div>
					<div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800 text-center">
						<div className="text-sm text-zinc-500 uppercase tracking-wider">
							Consistency
						</div>
						<div className="text-4xl font-bold text-zinc-300">
							{result.consistency}%
						</div>
					</div>
				</div>

				{replay ? (
					<div className="space-y-4">
						<h2 className="text-xl font-semibold text-zinc-200">Replay</h2>
						<ReplayViewer replay={replay} />
					</div>
				) : (
					<div className="text-zinc-500">No replay data available.</div>
				)}
			</div>
		</MainLayout>
	);
}
