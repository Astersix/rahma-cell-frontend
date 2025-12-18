import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import CustomerHeader from '../components/ui/CustomerHeader'
import Footer from '../components/ui/Footer'
import { useAuthStore } from '../store/auth.store'
import { getCartByUserId } from '../services/cart.service'
import { getMyProfile } from '../services/user.service'
import { notificationService } from '../services/notification.service'

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
  const token = useAuthStore(s => s.token || undefined)
  const isAuthenticated = useAuthStore(s => s.isAuthenticated)
  const [cartCount, setCartCount] = useState(0)
  const [notificationCount, setNotificationCount] = useState(0)

  useEffect(() => {
    let cancelled = false
    async function fetchCounts() {
      if (!isAuthenticated || !token) {
        setCartCount(0)
        setNotificationCount(0)
        return
      }
      try {
        const me = await getMyProfile(token)
        if (cancelled) return
        
        // Fetch cart count
        const cart = await getCartByUserId(me.id, token)
        if (!cancelled) {
          const count = cart.cart_product?.length || 0
          setCartCount(count)
        }
        
        // Fetch unread notification count
        const notifications = await notificationService.getByUser(me.id)
        if (!cancelled) {
          const unreadCount = (notifications.data || []).filter(n => !n.is_read).length
          setNotificationCount(unreadCount)
        }
      } catch {
        if (!cancelled) {
          setCartCount(0)
          setNotificationCount(0)
        }
      }
    }
    fetchCounts()
    return () => { cancelled = true }
  }, [isAuthenticated, token])

  return (
    <div className={cn('min-h-screen w-full flex flex-col', className)}>
      <CustomerHeader
        variant={headerVariant}
        rightExtra={headerExtraRight}
        cartCount={cartCount}
        notificationCount={notificationCount}
      />
      <main className={cn('mx-auto w-full flex-1 px-4 md:px-6', headerFixed && 'pt-20')}>
        {children}
      </main>
      <div className="mt-12" />
      <Footer />
    </div>
  )
}

export default CustomerLayout
