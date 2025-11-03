import { forwardRef } from 'react'

type ButtonVariant = 'light' | 'dark'
type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: ButtonVariant
	size?: ButtonSize
	fullWidth?: boolean
	className?: string
}

const base =
	'inline-flex items-center justify-center whitespace-nowrap select-none rounded-full font-medium transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'

const variants: Record<ButtonVariant, string> = {
	dark: 'bg-black text-white hover:bg-neutral-900 active:bg-neutral-800 focus-visible:ring-black ring-offset-white',
	light:
		'bg-white text-black border border-neutral-200 hover:bg-neutral-100 active:bg-neutral-200 focus-visible:ring-neutral-300 ring-offset-white',
}

const sizes: Record<ButtonSize, string> = {
	sm: 'text-sm px-3 py-1.5',
	md: 'text-sm px-4 py-2',
	lg: 'text-base px-6 py-3',
}

function cn(...parts: Array<string | false | null | undefined>) {
	return parts.filter(Boolean).join(' ')
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
	({ variant = 'dark', size = 'md', fullWidth, className, children, ...props }, ref) => {
		return (
			<button
				ref={ref}
				className={cn(base, variants[variant], sizes[size], fullWidth && 'w-full', className)}
				{...props}
			>
				{children}
			</button>
		)
	},
)

Button.displayName = 'Button'

export default Button

