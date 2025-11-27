import type { ReactNode } from 'react'
import CustomerHeader from '../components/ui/CustomerHeader'
import Footer from '../components/ui/Footer'
import { useCartStore } from '../store/cart.store'

export interface CustomerLayoutProps {
  children: ReactNode
  className?: string
  headerVariant?: 'light' | 'dark'
  headerExtraRight?: ReactNode
  headerFixed?: boolean
}

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ')
}

const CustomerLayout = ({
  children,
  className,
  headerVariant = 'light',
  headerExtraRight,
  headerFixed = true,
}: CustomerLayoutProps) => {
  const items = useCartStore(s => s.items)
  const cartCount = items.length // distinct product+variant entries; change to sum quantities if desired

  return (
    <div className={cn('min-h-screen w-full', className)}>
      <CustomerHeader
        variant={headerVariant}
        rightExtra={headerExtraRight}
        cartCount={cartCount}
      />
      <main className={cn('mx-auto w-full px-4 md:px-6', headerFixed && 'pt-20')}>
        {children}
      </main>
      <div className="mt-12" />
      <Footer />
    </div>
  )
}

export default CustomerLayout
