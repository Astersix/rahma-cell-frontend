import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CustomerLayout from '../../layouts/CustomerLayout'
import NotificationBar from '../../components/ui/NotificationBar'
import Button from '../../components/ui/Button'
import { notificationService, type NotificationItem } from '../../services/notification.service'
import { useAuthStore } from '../../store/auth.store'
import { CheckIcon, ArrowLongLeftIcon } from '@heroicons/react/24/outline'

function formatTimestamp(isoString?: string): string {
	if (!isoString) return ''
	const date = new Date(isoString)
	const now = new Date()
	const diffMs = now.getTime() - date.getTime()
	const diffMins = Math.floor(diffMs / 60000)
	const diffHours = Math.floor(diffMs / 3600000)
	const diffDays = Math.floor(diffMs / 86400000)

	if (diffMins < 1) return 'Baru saja'
	if (diffMins < 60) return `${diffMins} menit yang lalu`
	if (diffHours < 24) return `${diffHours} jam yang lalu`
	if (diffDays < 7) return `${diffDays} hari yang lalu`

	return date.toLocaleDateString('id-ID', {
		day: '2-digit',
		month: 'short',
		year: 'numeric',
	})
}

function groupNotificationsByDate(notifications: NotificationItem[]) {
	const today = new Date()
	today.setHours(0, 0, 0, 0)

	const yesterday = new Date(today)
	yesterday.setDate(yesterday.getDate() - 1)

	const groups: { label: string; items: NotificationItem[] }[] = []
	const todayItems: NotificationItem[] = []
	const yesterdayItems: NotificationItem[] = []
	const olderItems: NotificationItem[] = []

	notifications.forEach((notif) => {
		const notifDate = new Date(notif.created_at || '')
		notifDate.setHours(0, 0, 0, 0)

		if (notifDate.getTime() === today.getTime()) {
			todayItems.push(notif)
		} else if (notifDate.getTime() === yesterday.getTime()) {
			yesterdayItems.push(notif)
		} else {
			olderItems.push(notif)
		}
	})

	if (todayItems.length > 0) groups.push({ label: 'Hari Ini', items: todayItems })
	if (yesterdayItems.length > 0) groups.push({ label: 'Kemarin', items: yesterdayItems })
	if (olderItems.length > 0) groups.push({ label: 'Kemarin', items: olderItems })

	return groups
}

const NotificationPage = () => {
	const navigate = useNavigate()
	const token = useAuthStore((s) => s.token)

	const [notifications, setNotifications] = useState<NotificationItem[]>([])
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [activeId, setActiveId] = useState<string | null>(null)

	useEffect(() => {
		async function loadNotifications() {
			if (!token) return
			try {
				setLoading(true)
				setError(null)
				// Use new endpoint that automatically gets current user's notifications
				const items = await notificationService.getMyNotifications()
				setNotifications(Array.isArray(items) ? items : [])
			} catch (err: any) {
				setError(err?.message || 'Gagal memuat notifikasi')
			} finally {
				setLoading(false)
			}
		}
		loadNotifications()
	}, [token])

	async function handleNotificationClick(notif: NotificationItem) {
		setActiveId(notif.id || null)
		// Mark as read if not already read
		if (!notif.is_read && notif.id) {
			try {
				await notificationService.markAsRead(notif.id)
				// Update local state
				setNotifications((prev) =>
					prev.map((n) => (n.id === notif.id ? { ...n, is_read: true } : n))
				)
			} catch (err) {
				// Silent error
			}
		}
	}

	async function handleMarkAllRead() {
		try {
			await notificationService.markAllAsRead()
			setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
		} catch (err) {
			// Silent error
		}
	}

	function handleViewOrder(notif: NotificationItem) {
		// Try to get order ID from notif.order_id or extract from message
		const orderId = notif.order_id || notif.message?.match(/#(\w+)/)?.[1]
		if (orderId) {
			navigate(`/orders/${orderId}`)
		}
	}

	const groupedNotifications = groupNotificationsByDate(notifications)

	return (
		<CustomerLayout>
			<div className="mx-auto max-w-5xl min-h-screen">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
            <button className="text-neutral-600 hover:text-neutral-800" onClick={() => navigate('/')} aria-label="Kembali">
              <ArrowLongLeftIcon className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-semibold text-black">Notifikasi</h1>
          </div>
					<Button
						className="border border-red-600 text-red-600"
						onClick={handleMarkAllRead}
						disabled={notifications.every((n) => n.is_read)}
                        variant='light'
					>
					<CheckIcon className="w-4 h-4 inline mr-1" /> Tandai semua dibaca
					</Button>
				</div>
				<p className="pb-6 text-sm text-neutral-600">
					Lihat semua pemberitahuan terbaru dari pesanan Anda.
				</p>

				{loading && <p className="text-sm text-neutral-500">Memuat notifikasi...</p>}
				{error && <p className="text-sm text-red-600">{error}</p>}

				{!loading && notifications.length === 0 && (
					<div className="rounded-lg border border-dashed border-neutral-300 p-12 text-center">
							<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
								<svg
									width="32"
									height="32"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
									className="text-neutral-400"
								>
									<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
									<path d="M10 22h4" />
								</svg>
							</div>
							<h3 className="mb-2 text-base font-semibold text-neutral-900">
								Belum ada notifikasi
							</h3>
							<p className="text-sm text-neutral-600">
								Notifikasi tentang pesanan Anda akan muncul di sini
							</p>
						</div>
				)}

				{!loading && groupedNotifications.length > 0 && (
					<div className="space-y-6">
							{groupedNotifications.map((group) => (
								<div key={group.label}>
									<h2 className="mb-3 text-sm font-semibold text-neutral-900">{group.label}</h2>
									<div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
										{group.items.map((notif, idx) => {
											// Determine icon based on message content
											const icon = notif.message?.toLowerCase().includes('shipped') ? 'truck' : 'check'
											// Determine badge
											const badge = !notif.is_read ? 'Baru' : undefined
											// Check if notification has an order ID (either from field or message)
											const hasOrderId = notif.order_id || notif.message?.match(/#(\w+)/)

											return (
												<div key={notif.id || idx}>
													<NotificationBar
														icon={icon}
														title={notif.title || 'Notifikasi'}
														message={notif.message || ''}
														action={hasOrderId ? 'Lihat Pesanan' : undefined}
														timestamp={formatTimestamp(notif.created_at)}
														badge={badge}
														isActive={activeId === notif.id}
														isRead={notif.is_read}
														onClick={() => handleNotificationClick(notif)}
														onAction={() => handleViewOrder(notif)}
													/>
													{idx < group.items.length - 1 && (
														<div className="border-t border-neutral-100" />
													)}
												</div>
											)
										})}
									</div>
								</div>
							))}
					</div>
				)}
			</div>
		</CustomerLayout>
	)
}

export default NotificationPage
