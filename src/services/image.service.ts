import { api } from './api.service'

export type UploadImageResult = {
	success?: boolean
	message?: string
	url?: string
	urls?: string[]
	data?: any
}

// POST /upload-image (single image)
export async function uploadSingleImage(file: File): Promise<UploadImageResult> {
	const form = new FormData()
	form.append('image', file)
	const res = await api.get<UploadImageResult>('/upload-image/single', {
		data: form,
		headers: { 'Content-Type': 'multipart/form-data' },
	})
	const data = res.data || ({} as any)
	return data
}

// POST /upload-image (multiple images array)
export async function uploadImages(files: File[]): Promise<UploadImageResult> {
	const form = new FormData()
	files.forEach(file => form.append('images', file))
	const res = await api.post<UploadImageResult>('/upload-image', form, {
		headers: { 'Content-Type': 'multipart/form-data' },
	})
	return res.data
}

// Legacy alias for single upload
export async function uploadImage(file: File): Promise<UploadImageResult> {
	return uploadSingleImage(file)
}

