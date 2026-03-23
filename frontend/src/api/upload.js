import { apiClient, unwrapData } from './client'

export async function getUploadsRequest(params) {
  const response = await apiClient.get('/api/upload', { params })
  return unwrapData(response)
}

export async function uploadMediaRequest({ file, purpose }) {
  const formData = new FormData()
  formData.append('file', file)
  if (purpose) {
    formData.append('purpose', purpose)
  }

  const response = await apiClient.post('/api/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })

  return unwrapData(response)
}

export async function deleteUploadRequest(id) {
  const response = await apiClient.delete(`/api/upload/${id}`)
  return unwrapData(response)
}
