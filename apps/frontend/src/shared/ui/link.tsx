import type { AnchorHTMLAttributes } from 'react';

interface LinkProps
	extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
	to: string;
}

export function Link({ to, ...props }: LinkProps) {
	return <a href={to} {...props} />;
}
