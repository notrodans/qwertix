import type { ButtonHTMLAttributes } from 'react';

export function Button({
	className,
	...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
	return (
		<button
			className={`px-4 py-2 rounded font-medium transition-colors ${className}`}
			{...props}
		/>
	);
}
