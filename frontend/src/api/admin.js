import { apiClient, unwrapData } from './client'

export async function getAdminDashboardRequest() {
  const response = await apiClient.get('/api/admin/dashboard')
  return unwrapData(response)
}

export async function getAdminCoursesRequest(params) {
  const response = await apiClient.get('/api/admin/courses', { params })
  return unwrapData(response)
}

export async function createAdminCourseRequest(payload) {
  const response = await apiClient.post('/api/admin/courses', payload)
  return unwrapData(response)
}

export async function updateAdminCourseRequest(id, payload) {
  const response = await apiClient.put(`/api/admin/courses/${id}`, payload)
  return unwrapData(response)
}

export async function deleteAdminCourseRequest(id) {
  const response = await apiClient.delete(`/api/admin/courses/${id}`)
  return unwrapData(response)
}

export async function getAdminOrdersRequest(params) {
  const response = await apiClient.get('/api/admin/orders', { params })
  return unwrapData(response)
}

export async function updateAdminOrderStatusRequest(id, payload) {
  const response = await apiClient.patch(`/api/admin/orders/${id}/status`, payload)
  return unwrapData(response)
}

export async function getAdminUsersRequest(params) {
  const response = await apiClient.get('/api/admin/users', { params })
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
