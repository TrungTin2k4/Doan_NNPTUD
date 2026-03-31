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
  const response = await apiClient.post('/api/progress/complete', { courseId, lessonId })
  return unwrapData(response)
}

export async function getVideoPositionRequest(lessonId) {
  const response = await apiClient.get(`/api/progress/position/${lessonId}`)
  return unwrapData(response)
}

export async function saveVideoPositionRequest(courseId, lessonId, position) {
  const response = await apiClient.put(`/api/progress/${courseId}/video-position`, undefined, {
    params: {
      lessonId,
      position,
    },
  })
  return unwrapData(response)
}

export async function getProgressCoursesRequest() {
  const response = await apiClient.get('/api/progress/courses')
  return unwrapData(response)
}
