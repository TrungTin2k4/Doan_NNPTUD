import { apiClient, unwrapData } from './client'

export async function getMyLearningRequest() {
  const response = await apiClient.get('/api/progress/my-learning')
  return unwrapData(response)
}

export async function getCourseProgressRequest(courseId) {
  const response = await apiClient.get(`/api/progress/${courseId}`)
  return unwrapData(response)
}

export async function completeLessonRequest(courseId, lessonId) {
  const response = await apiClient.put(`/api/progress/${courseId}/lesson/${lessonId}`)
  return unwrapData(response)
}

export async function getVideoPositionRequest(lessonId) {
  const response = await apiClient.get(`/api/progress/position/${lessonId}`)
  return unwrapData(response)
}

export async function saveVideoPositionRequest(lessonId, payload) {
  const response = await apiClient.post(`/api/progress/position/${lessonId}`, payload)
  return unwrapData(response)
}
