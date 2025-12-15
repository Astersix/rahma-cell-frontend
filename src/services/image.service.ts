import { api } from './api.service'

export type TempImageResult = {
	tempName: string
	previewUrl: string
}

export type FinalizeResult = {
	urls: string[]
}

// POST /upload-image/temp - Upload single image to temp
export async function uploadTempImage(file: File): Promise<TempImageResult> {
	const form = new FormData()
	form.append('image', file)
	const res = await api.post<TempImageResult>('/upload-image/temp', form, {
		headers: { 'Content-Type': 'multipart/form-data' },
	})
	return res.data
}

// POST /upload-image/temp/multiple - Upload multiple images to temp
export async function uploadTempImages(files: File[]): Promise<TempImageResult[]> {
	const form = new FormData()
	files.forEach(file => form.append('images', file))
	const res = await api.post<TempImageResult[]>('/upload-image/temp/multiple', form, {
		headers: { 'Content-Type': 'multipart/form-data' },
	})
	return res.data
}

// POST /upload-image/finalize - Move temp images to product directory
export async function finalizeImages(tempNames: string[]): Promise<FinalizeResult> {
	const res = await api.post<FinalizeResult>('/upload-image/finalize', { tempNames })
	return res.data
}

// DELETE /upload-image/temp/:tempName - Delete temp image
export async function deleteTempImage(tempName: string): Promise<{ success: boolean }> {
	const res = await api.delete(`/upload-image/temp/${tempName}`)
	return res.data
}

// DELETE /upload-image/final/:imageName - Delete final image
export async function deleteFinalImage(imageName: string): Promise<{ success: boolean }> {
	const res = await api.delete(`/upload-image/final/${imageName}`)
	return res.data
}