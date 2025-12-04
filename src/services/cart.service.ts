import axios from 'axios'
import { api } from './api.service'
import type { ProductVariant } from './product.service'

export type ISODateString = string

export interface CartProduct {
	id: string
	cart_id: string
	product_variant_id: string
	quantity: number
	created_at?: ISODateString
	updated_at?: ISODateString
	product_variant?: ProductVariant
}

export interface Cart {
	id: string
	user_id: string
	created_at?: ISODateString
	updated_at?: ISODateString
	cart_product: CartProduct[]
}

export type AddToCartDTO = {
	product_variant_id: string
	quantity: number
}

export type UpdateCartItemDTO = {
	quantity: number
}

export type ApiEnvelope<T> = {
	success?: boolean
	message?: string
	data?: T
	[key: string]: unknown
}

function normalizeAxiosError(err: unknown) {
	if (axios.isAxiosError(err)) {
		const axiosErr = err
		return {
			message: (axiosErr.response?.data as any)?.message || axiosErr.message,
			status: axiosErr.response?.status,
			data: axiosErr.response?.data,
		}
	}
	return { message: String(err) }
}

// GET /cart/:id => returns a Cart (created if absent)
export async function getCartByUserId(userId: string, _token?: string): Promise<Cart> {
	try {
		const res = await api.get(`/cart/${encodeURIComponent(userId)}`)
		return res.data as Cart
	} catch (err) {
		throw normalizeAxiosError(err)
	}
}

// POST /cart/:id => { product_variant_id, quantity } -> returns created/updated cart_product in envelope
export async function addItemToCart(userId: string, dto: AddToCartDTO, _token?: string): Promise<ApiEnvelope<CartProduct>> {
	try {
		const res = await api.post<ApiEnvelope<CartProduct>>(`/cart/${encodeURIComponent(userId)}`, dto)
		return res.data
	} catch (err) {
		throw normalizeAxiosError(err)
	}
}

// PUT /cart/:id/cart_product/:itemId => { quantity } -> returns updated cart_product in envelope
export async function updateCartItemQuantity(userId: string, itemId: string, dto: UpdateCartItemDTO, _token?: string): Promise<ApiEnvelope<CartProduct>> {
	try {
		const res = await api.put<ApiEnvelope<CartProduct>>(`/cart/${encodeURIComponent(userId)}/cart_product/${encodeURIComponent(itemId)}`, dto)
		return res.data
	} catch (err) {
		throw normalizeAxiosError(err)
	}
}

// DELETE /cart/:id/cart_product/:itemId -> returns envelope with success/message
export async function deleteCartItem(userId: string, itemId: string, _token?: string): Promise<ApiEnvelope<null>> {
	try {
		const res = await api.delete<ApiEnvelope<null>>(`/cart/${encodeURIComponent(userId)}/cart_product/${encodeURIComponent(itemId)}`)
		return res.data
	} catch (err) {
		throw normalizeAxiosError(err)
	}
}

