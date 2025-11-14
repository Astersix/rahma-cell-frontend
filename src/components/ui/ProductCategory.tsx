import { useState } from 'react'

export interface CategoryItem {
  key: string
  label: string
  icon: string // icon name
}

export interface ProductCategoryProps {
  className?: string
  categories?: CategoryItem[]
  value?: string
  onChange?: (key: string) => void
  variant?: 'light' | 'dark'
}

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ')
}

// Inline icon set to avoid extra deps
function Icon({ name, className = 'h-4 w-4' }: { name: string; className?: string }) {
  switch (name) {
    case 'all':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
      )
    case 'smartphone':
      return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="7" y="2" width="10" height="20" rx="2" ry="2" /><line x1="12" y1="18" x2="12" y2="18" /></svg>
    case 'headphones':
      return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 18v-3a9 9 0 0 1 18 0v3" /><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3" /><path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3" /></svg>
    case 'charger':
      return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22v-7" /><path d="M7 7h10" /><path d="M7 3v4" /><path d="M17 3v4" /><rect x="7" y="7" width="10" height="9" rx="2" /></svg>
    case 'beauty':
      return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3h6l3 7-3 11H6L3 10" /><path d="M13 3h8l-3 7 3 11h-3l-3-11" /></svg>
    case 'stationery':
      return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
    case 'packaging':
      return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /><path d="M3.3 7L12 12l8.7-5" /><path d="M12 22V12" /></svg>
    case 'home-tools':
      return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12 2 5l3-3 7 7" /><path d="M12 9 17 4l3 3-5 5" /><path d="M3 22l10-10" /><path d="M14 12 22 20" /></svg>
    case 'baking':
      return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7h18" /><path d="M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12" /><path d="M8 7V4h8v3" /></svg>
    default:
      return null
  }
}

const defaultCategories: CategoryItem[] = [
  { key: 'all', label: 'Semua Produk', icon: 'all' },
  { key: 'smartphone', label: 'Smartphone', icon: 'smartphone' },
  { key: 'accessories', label: 'Aksesoris', icon: 'headphones' },
  { key: 'charger', label: 'Charger & Kabel', icon: 'charger' },
  { key: 'beauty', label: 'Kecantikan', icon: 'beauty' },
  { key: 'stationery', label: 'Alat Tulis', icon: 'stationery' },
  { key: 'packaging', label: 'Plastik & Packaging', icon: 'packaging' },
  { key: 'home-tools', label: 'Peralatan Rumah Tangga', icon: 'home-tools' },
  { key: 'baking', label: 'Bahan Kue', icon: 'baking' },
]

export const ProductCategory = ({
  className,
  categories = defaultCategories,
  value,
  onChange,
  variant = 'light',
}: ProductCategoryProps) => {
  const [internal, setInternal] = useState<string>(value ?? categories[0]?.key)
  const selected = value ?? internal
  const isDark = variant === 'dark'

  function select(key: string) {
    if (!value) setInternal(key)
    onChange?.(key)
  }

  return (
    <div
      className={cn(
        'w-full rounded-lg border p-4',
        isDark ? 'border-neutral-800 bg-black text-white' : 'border-neutral-200 bg-white text-black',
        className,
      )}
    >
      <h3 className={cn('mb-3 border-b pb-2 text-base font-semibold', isDark ? 'border-neutral-800' : 'border-neutral-200')}>
        Kategori Produk
      </h3>
      <div className="space-y-1">
        {categories.map(cat => {
          const active = cat.key === selected
          return (
            <button
              key={cat.key}
              type="button"
              onClick={() => select(cat.key)}
              className={cn(
                'flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                active
                  ? 'bg-red-600 text-white shadow'
                  : isDark
                    ? 'text-neutral-300 hover:bg-neutral-800'
                    : 'text-neutral-700 hover:bg-neutral-100',
              )}
            >
              <Icon name={cat.icon} className={cn('h-4 w-4', active ? 'text-white' : isDark ? 'text-neutral-300' : 'text-neutral-600')} />
              <span className="truncate">{cat.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default ProductCategory
