import { api } from './api.service'

export type PaymentStatus =
	| 'pending'
	| 'menunggu_pembayaran'
	| 'settlement'
	| 'capture'
	| 'paid'
	| 'success'
	| 'failed'
	| 'expire'
	| 'cancel'

export interface InitiateQrisResponse {
	success?: boolean
	message?: string
	data?: {
		payment?: any
		qr?: {
			url?: string
			expiry?: string | null
			[k: string]: unknown
		} | null
		midtrans?: any
	}
}

export interface GetPaymentResponse {
	success?: boolean
	message?: string
	payment?: {
		id?: string | number
		order_id?: string | number
		status?: PaymentStatus | string
		amount?: number
		method?: 'qris' | 'cod' | string
		[k: string]: unknown
	} | null
}

export const paymentService = {
	// POST /payment/:orderId/qris -> generate QR and initiate payment
	initiateQris: async (orderId: string): Promise<InitiateQrisResponse> => {
		const res = await api.post<InitiateQrisResponse>(`/payment/${orderId}/qris`)
		return res.data
	},

	// GET /payment/:orderId -> fetch payment info for an order
	getByOrder: async (orderId: string | number): Promise<GetPaymentResponse> => {
		const res = await api.get<GetPaymentResponse>(`/payment/${orderId}`)
		return res.data
	},

	// Utility: poll payment until it reaches a terminal/success state
	waitForSettlement: async (
		orderId: string | number,
		opts?: { intervalMs?: number; timeoutMs?: number },
	): Promise<GetPaymentResponse> => {
		const interval = opts?.intervalMs ?? 2500
		const timeout = opts?.timeoutMs ?? 120_000
		const start = Date.now()
		// eslint-disable-next-line no-constant-condition
		while (true) {
			const current = await paymentService.getByOrder(orderId)
			const status = (current?.payment?.status || '').toString().toLowerCase()
			const done = ['settlement', 'capture', 'paid', 'success'].includes(status)
			const failed = ['failed', 'expire', 'cancel'].includes(status)
			if (done || failed) return current
			if (Date.now() - start > timeout) return current
			await new Promise((r) => setTimeout(r, interval))
		}
	},
}

