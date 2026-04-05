import { apiClient, unwrapData } from './client'

export async function loginRequest(payload) {
  const response = await apiClient.post('/api/auth/login', payload)
  return unwrapData(response)
}

export async function registerRequest(payload) {
  const response = await apiClient.post('/api/auth/register', payload)
  return unwrapData(response)
}

export async function meRequest() {
  const response = await apiClient.get('/api/auth/me')
  return unwrapData(response)
}

export async function updateProfileRequest(payload) {
  const response = await apiClient.put('/api/auth/me', payload)
  return unwrapData(response)
}

export async function logoutRequest() {
  const response = await apiClient.post('/api/auth/logout')
  return unwrapData(response)
}

export async function forgotPasswordRequest(payload) {
  const response = await apiClient.post('/api/auth/forgot-password', payload)
  return unwrapData(response)
}

export async function resetPasswordRequest(payload) {
  const response = await apiClient.post('/api/auth/reset-password', payload)
  return unwrapData(response)
}

export async function changePasswordRequest(payload) {
  const response = await apiClient.put('/api/auth/change-password', payload)
  return unwrapData(response)
}

export async function getMySessionsRequest(params) {
  const response = await apiClient.get('/api/auth/sessions', { params })
  return unwrapData(response)
}

export async function revokeAllSessionsRequest() {
  const response = await apiClient.delete('/api/auth/sessions')
  return unwrapData(response)
}

export async function revokeSessionRequest(id) {
  const response = await apiClient.delete(`/api/auth/sessions/${id}`)
  return unwrapData(response)
}
