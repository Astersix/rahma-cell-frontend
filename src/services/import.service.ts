import { api } from './api.service'

export type ImportProductsSummary = {
	message?: string
	created_products: number
	created_variants: number
	updated_variants: number
}

// Upload a CSV file to backend import endpoint: POST /product/import
export async function importProductsCsv(file: File): Promise<ImportProductsSummary> {
	const form = new FormData()
	form.append('file', file)
	const res = await api.post<ImportProductsSummary>('/product/import', form, {
		headers: { 'Content-Type': 'multipart/form-data' },
	})
	// Some backends wrap data; normalize common shapes
	const raw: any = res.data
	const data: ImportProductsSummary = (raw?.data ?? raw) as ImportProductsSummary
	return {
		message: data?.message || raw?.message,
		created_products: Number((data as any)?.created_products ?? 0),
		created_variants: Number((data as any)?.created_variants ?? 0),
		updated_variants: Number((data as any)?.updated_variants ?? 0),
	}
}

export const importService = {
	importProductsCsv,
}

