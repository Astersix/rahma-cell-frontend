import { forwardRef } from 'react'
import type React from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'

// Reuse the same API as Button.tsx and add dynamic icon support

type ButtonVariant = 'light' | 'dark'
type ButtonSize = 'sm' | 'md' | 'lg'

type IconName =
  | 'plus'
  | 'search'
  | 'upload'
  | 'download'
  | 'arrow-left'
  | 'arrow-right'
  | 'edit'
  | 'trash'
  | 'logout'
  | 'filter'
  | 'csv'

export interface ButtonIconProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
  className?: string
  // Either pass your own ReactNode or a supported icon name
  icon: React.ReactNode | IconName
  iconPosition?: 'left' | 'right'
}

const base =
  'inline-flex items-center justify-center whitespace-nowrap select-none rounded-md font-medium transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'

const variants: Record<ButtonVariant, string> = {
  dark: 'bg-black text-white hover:bg-neutral-900 active:bg-neutral-800 focus-visible:ring-black ring-offset-white',
  light:
    'bg-white text-black border border-black hover:bg-neutral-100 active:bg-neutral-200 focus-visible:ring-neutral-300 ring-offset-white',
}

const sizes: Record<ButtonSize, string> = {
  sm: 'text-sm px-3 py-1.5',
  md: 'text-sm px-4 py-2',
  lg: 'text-base px-6 py-3',
}

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ')
}

function IconSvg({ name, size = 'md' }: { name: IconName; size?: ButtonSize }) {
  const dim = size === 'lg' ? 18 : 16
  switch (name) {
    case 'plus':
      return (
        <svg width={dim} height={dim} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5v14" />
          <path d="M5 12h14" />
        </svg>
      )
    case 'search':
      return (
        <svg width={dim} height={dim} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      )
    case 'upload':
      return (
        <svg width={dim} height={dim} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 5 17 10" />
          <line x1="12" y1="5" x2="12" y2="20" />
        </svg>
      )
    case 'download':
      return (
        <svg width={dim} height={dim} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="5" x2="12" y2="15" />
        </svg>
      )
    case 'arrow-left':
      return <ChevronLeftIcon className={`w-${dim === 18 ? '5' : '4'} h-${dim === 18 ? '5' : '4'}`} />
    case 'arrow-right':
      return <ChevronRightIcon className={`w-${dim === 18 ? '5' : '4'} h-${dim === 18 ? '5' : '4'}`} />
    case 'edit':
      return (
        <svg width={dim} height={dim} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
        </svg>
      )
    case 'trash':
      return (
        <svg width={dim} height={dim} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
          <path d="M10 11v6" />
          <path d="M14 11v6" />
        </svg>
      )
    case 'logout':
      return (
        <svg width={dim} height={dim} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
      )
    case 'filter':
      return (
        <svg width={dim} height={dim} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="22 3 2 3 10 12 10 19 14 21 14 12 22 3" />
        </svg>
      )
    case 'csv':
      return (
        <svg width={dim} height={dim} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <path d="M7 9h10" />
          <path d="M7 13h6" />
        </svg>
      )
    default:
      return null
  }
}

export const ButtonIcon = forwardRef<HTMLButtonElement, ButtonIconProps>(
  ({ variant = 'dark', size = 'md', fullWidth, className, icon, iconPosition = 'left', children, ...props }, ref) => {
    const hasText = Boolean(children)
  const iconNode = typeof icon === 'string' ? <IconSvg name={icon as IconName} size={size} /> : icon

    return (
      <button
        ref={ref}
        className={cn(
          base,
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          hasText && 'gap-2',
          className,
        )}
        {...props}
      >
        {iconPosition === 'left' && iconNode}
        {children}
        {iconPosition === 'right' && iconNode}
      </button>
    )
  },
)

ButtonIcon.displayName = 'ButtonIcon'

export default ButtonIcon
