import { reatomComponent } from '@reatom/react';
import { type ComponentType } from 'react';
import { isResultLoading, resultResource } from '../model/result-view.model';
import { ResultsContent } from './results-screen';

interface ResultViewProps {
	ReplayComponent: ComponentType<{
		replay: {
			data: { key: string; timestamp: number }[];
			targetText: string;
		};
	}>;
}

export const ResultView = reatomComponent(
	({ ReplayComponent }: ResultViewProps) => {
		resultResource();

		const data = resultResource.data();

		if (isResultLoading()) return <div>Loading...</div>;
		if (!data) return <div>Not found</div>;

		const { result, replay } = data;

		return (
			<div className="w-full max-w-4xl space-y-8">
				<h1 className="text-3xl font-bold text-primary">Race Result</h1>
				<ResultsContent
					stats={{
						...result,
						replayData: replay.data,
						afkDuration: result.afkDuration ?? 0,
					}}
					targetText={replay.targetText}
					participants={[]}
					ReplayComponent={ReplayComponent}
				/>
			</div>
		);
	},
);
