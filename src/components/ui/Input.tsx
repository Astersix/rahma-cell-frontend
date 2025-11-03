import { forwardRef } from 'react'

type InputVariant = 'normal' | 'error'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
	label?: string
	variant?: InputVariant
	helperText?: string
	className?: string
}

function cn(...parts: Array<string | false | null | undefined>) {
	return parts.filter(Boolean).join(' ')
}

const base =
	'block w-full rounded-md bg-white text-black placeholder:text-neutral-400 outline-none transition-shadow'

const normal =
	'border border-neutral-200 focus:shadow-[0_0_0_3px_rgba(0,0,0,0.1)]'

const error =
	'border border-red-500 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.35)]'

export const Input = forwardRef<HTMLInputElement, InputProps>(
	({ label, variant = 'normal', helperText, className, id, ...props }, ref) => {
		const inputId = id || (label ? label.replace(/\s+/g, '-').toLowerCase() : undefined)
		const isError = variant === 'error'
		return (
			<div className="w-full">
				{label && (
					<label htmlFor={inputId} className="mb-1 block text-sm font-medium text-black">
						{label}
					</label>
				)}
				<input
					id={inputId}
					ref={ref}
					className={cn(base, variant === 'normal' ? normal : error, className)}
					{...props}
				/>
				{helperText && (
					<p className={cn('mt-1 text-xs', isError ? 'text-red-600' : 'text-neutral-500')}>{helperText}</p>
				)}
			</div>
		)
	},
)

Input.displayName = 'Input'

export default Input

