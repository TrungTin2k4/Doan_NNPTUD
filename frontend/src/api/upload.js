import { apiClient, unwrapData } from './client'

export async function uploadMediaAssetRequest(file, purpose = 'GENERAL') {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('purpose', purpose)

  const response = await apiClient.post('/api/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })

  return unwrapData(response)
}
