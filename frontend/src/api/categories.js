import { apiClient, unwrapData } from './client'

export async function getPublicCategoriesRequest() {
  const response = await apiClient.get('/api/categories')
  return unwrapData(response)
}

export async function getAdminCategoriesRequest(params) {
  const response = await apiClient.get('/api/admin/categories', { params })
  return unwrapData(response)
}

export async function createAdminCategoryRequest(payload) {
  const response = await apiClient.post('/api/admin/categories', payload)
  return unwrapData(response)
}

export async function updateAdminCategoryRequest(id, payload) {
  const response = await apiClient.put(`/api/admin/categories/${id}`, payload)
  return unwrapData(response)
}

export async function deleteAdminCategoryRequest(id) {
  const response = await apiClient.delete(`/api/admin/categories/${id}`)
  return unwrapData(response)
}
