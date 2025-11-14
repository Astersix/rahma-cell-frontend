import type { PropsWithChildren } from 'react'

type CardVariant = 'light' | 'dark'

export interface CardProps extends PropsWithChildren {
	className?: string
	variant?: CardVariant
}

function cn(...parts: Array<string | false | null | undefined>) {
	return parts.filter(Boolean).join(' ')
}

const base = 'rounded-xl p-6 shadow-sm border'
const variants: Record<CardVariant, string> = {
	light: 'bg-white text-black border-neutral-200',
	dark: 'bg-black text-white border-black',
}

const Card = ({ children, className, variant = 'light' }: CardProps) => {
	return (
		<div className={cn(base, variants[variant], className)}>
			{children}
		</div>
	)
}

export default Card

