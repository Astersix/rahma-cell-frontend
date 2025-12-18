import { api } from './api.service'

export type ISODateString = string

export interface NotificationItem {
  id?: string
  user_id?: string
  order_id?: string
  title?: string
  message?: string
  is_read?: boolean
  created_at?: ISODateString
}

export interface CreateNotificationDto {
  user_id: string
  title: string
  message: string
}

export type ApiEnvelope<T> = {
  success?: boolean
  message?: string
  data?: T
  [k: string]: unknown
}

export const notificationService = {
  // GET /notification - Get current user's notifications (uses auth token)
  getMyNotifications: async (): Promise<NotificationItem[]> => {
    const res = await api.get<NotificationItem[]>('/notification')
    return res.data
  },

  // PATCH /notification/:id/read - Mark single notification as read
  markAsRead: async (id: string): Promise<ApiEnvelope<null>> => {
    const res = await api.patch<ApiEnvelope<null>>(`/notification/${encodeURIComponent(id)}/read`)
    return res.data
  },

  // PATCH /notification/read-all - Mark all notifications as read
  markAllAsRead: async (): Promise<ApiEnvelope<null>> => {
    const res = await api.patch<ApiEnvelope<null>>('/notification/read-all')
    return res.data
  },

  // // Legacy endpoints (keep for backward compatibility if needed)
  // // GET /notification/:user_id
  // getByUser: async (userId: string): Promise<ApiEnvelope<NotificationItem[]>> => {
  //   const res = await api.get<ApiEnvelope<NotificationItem[]>>(`/notification/${encodeURIComponent(userId)}`)
  //   return res.data
  // },
}
