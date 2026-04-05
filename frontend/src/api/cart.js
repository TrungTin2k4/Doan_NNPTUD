import { apiClient, unwrapData } from './client'

export async function getMyCartRequest() {
  const response = await apiClient.get('/api/cart')
  return unwrapData(response)
}

export async function addCartItemRequest(courseId) {
  const response = await apiClient.post('/api/cart/items', { courseId })
  return unwrapData(response)
}

export async function removeCartItemRequest(courseId) {
  const response = await apiClient.delete(`/api/cart/items/${courseId}`)
  return unwrapData(response)
}

export async function clearCartRequest() {
  const response = await apiClient.delete('/api/cart')
  return unwrapData(response)
}
