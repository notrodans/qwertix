import { RotateCcw } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

export function RefreshIcon({ className }: { className?: string }) {
	return <RotateCcw className={cn('w-4 h-4', className)} />;
}
