import * as React from 'react';
import { cn } from '@/shared/lib/utils';
import { urlAtom } from '@/shared/model';

export interface LinkProps
	extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
	to: string;
}

export function Link({ className, to, onClick, ...props }: LinkProps) {
	const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
		e.preventDefault();
		urlAtom.go(to);
		onClick?.(e);
	};

	return (
		<a
			href={to}
			onClick={handleClick}
			className={cn('cursor-pointer', className)}
			{...props}
		/>
	);
}
