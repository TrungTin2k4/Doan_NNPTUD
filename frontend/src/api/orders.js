import { apiClient, unwrapData } from './client'

export async function createOrderRequest(payload) {
  const response = await apiClient.post('/api/orders', payload)
  return unwrapData(response)
}

export async function getOrdersRequest() {
  const response = await apiClient.get('/api/orders/me')
  return unwrapData(response)
}

export async function getOrderDetailRequest(orderId) {
  const response = await apiClient.get(`/api/orders/${orderId}`)
  return unwrapData(response)
}
