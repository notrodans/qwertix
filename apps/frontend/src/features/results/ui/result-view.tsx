import { reatomComponent } from '@reatom/react';
import { type ComponentType, useEffect } from 'react';
import { navigate } from '@/shared/model';
import { resultDataAtom, resultIdAtom } from '../model/result-view.model';
import { ResultsScreen } from './results-screen';

interface ResultViewProps {
	resultId: string;
	ReplayComponent: ComponentType<{
		replay: {
			data: { key: string; timestamp: number }[];
			targetText: string;
		};
	}>;
}

export const ResultView = reatomComponent(
	({ resultId, ReplayComponent }: ResultViewProps) => {
		useEffect(() => {
			resultIdAtom.set(resultId);
		}, [resultId]);

		const data = resultDataAtom.data();
		const isLoading = resultDataAtom.pending() > 0 && !data;

		if (isLoading) return <div>Loading...</div>;
		if (!data) return <div>Not found</div>;

		const { result, replay } = data;

		return (
			<ResultsScreen
				stats={{
					...result,
					replayData: replay.data,
					afkDuration: result.afkDuration ?? 0,
				}}
				targetText={replay.targetText}
				participants={[]}
				onClose={() => navigate('/')}
				ReplayComponent={ReplayComponent}
			/>
		);
	},
);
