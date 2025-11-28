import { api } from './api.service'

export type UploadImageResult = {
	success?: boolean
	message?: string
	url: string
}

export async function uploadImage(file: File): Promise<UploadImageResult> {
	const form = new FormData()
	form.append('image', file)
	const res = await api.post<UploadImageResult>('/upload-image/upload', form, {
		headers: { 'Content-Type': 'multipart/form-data' },
	})
	const data = res.data || ({} as any)
	if (!data.url) throw new Error('Upload gagal: URL tidak diterima')
	return data
}

export async function uploadImages(files: File[]): Promise<string[]> {
	const results = await Promise.all(files.map(f => uploadImage(f).then(r => r.url)))
	return results
}

