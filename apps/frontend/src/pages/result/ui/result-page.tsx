import { reatomComponent } from '@reatom/react';
import { ReplayViewer } from '@/features/replay-viewer';
import { ResultView } from '@/features/results';

const ResultPage = reatomComponent(() => {
	return <ResultView ReplayComponent={ReplayViewer} />;
});

export default ResultPage;
