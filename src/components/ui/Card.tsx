import type { PropsWithChildren } from 'react'

export interface CardProps extends PropsWithChildren {
	className?: string
}

function cn(...parts: Array<string | false | null | undefined>) {
	return parts.filter(Boolean).join(' ')
}

const Card = ({ children, className }: CardProps) => {
	return (
		<div className={cn('rounded-xl border border-neutral-200 bg-white p-6 shadow-sm', className)}>
			{children}
		</div>
	)
}

export default Card

