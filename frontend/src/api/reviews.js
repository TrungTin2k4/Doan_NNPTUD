import { apiClient, unwrapData } from './client'

export async function getCourseReviewsRequest(courseId, params) {
  const response = await apiClient.get(`/api/reviews/course/${courseId}`, { params })
  return unwrapData(response)
}

export async function upsertReviewRequest(payload) {
  const response = await apiClient.post('/api/reviews', payload)
  return unwrapData(response)
}

export async function deleteReviewRequest(id) {
  const response = await apiClient.delete(`/api/reviews/${id}`)
  return unwrapData(response)
}
