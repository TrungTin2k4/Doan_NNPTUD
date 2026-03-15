import { apiClient, unwrapData } from './client'

export async function getFeaturedCoursesRequest() {
  const response = await apiClient.get('/api/courses/featured')
  return unwrapData(response)
}

export async function getCourseCategoriesRequest() {
  const response = await apiClient.get('/api/courses/categories')
  return unwrapData(response)
}

export async function getCoursesRequest(params) {
  const response = await apiClient.get('/api/courses', { params })
  return unwrapData(response)
}

export async function getCourseDetailRequest(slug) {
  const response = await apiClient.get(`/api/courses/${slug}`)
  return unwrapData(response)
}
