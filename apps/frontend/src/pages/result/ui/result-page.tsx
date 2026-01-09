import { reatomComponent } from '@reatom/react';
import { ReplayViewer } from '@/features/replay-viewer';
import { ResultView } from '@/features/results';

const ResultPage = reatomComponent(({ resultId }: { resultId: string }) => {
	return <ResultView resultId={resultId} ReplayComponent={ReplayViewer} />;
});

const Component = ResultPage;
export default Component;
