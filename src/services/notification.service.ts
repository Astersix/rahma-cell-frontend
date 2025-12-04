import { api } from './api.service'

export type ISODateString = string

export interface NotificationItem {
  id?: string
  user_id?: string
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
  // POST /notification
  send: async (dto: CreateNotificationDto): Promise<ApiEnvelope<NotificationItem>> => {
    const res = await api.post<ApiEnvelope<NotificationItem>>('/notification', dto)
    return res.data
  },

  // GET /notification/:user_id
  getByUser: async (userId: string): Promise<ApiEnvelope<NotificationItem[]>> => {
    const res = await api.get<ApiEnvelope<NotificationItem[]>>(`/notification/${encodeURIComponent(userId)}`)
    return res.data
  },

  // PATCH /notification/:id/read
  markAsRead: async (id: string): Promise<ApiEnvelope<NotificationItem>> => {
    const res = await api.patch<ApiEnvelope<NotificationItem>>(`/notification/${encodeURIComponent(id)}/read`)
    return res.data
  },

  // DELETE /notification/:id
  delete: async (id: string): Promise<ApiEnvelope<null>> => {
    const res = await api.delete<ApiEnvelope<null>>(`/notification/${encodeURIComponent(id)}`)
    return res.data
  },
}
