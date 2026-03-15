import { create } from 'zustand'

const CART_KEY = 'edulearn_cart'

function getStoredCart() {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const raw = window.localStorage.getItem(CART_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function persistCart(items) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(CART_KEY, JSON.stringify(items))
}

export const useCartStore = create((set, get) => ({
  items: getStoredCart(),
  addCourse(course) {
    const items = get().items
    const exists = items.some((item) => item.id === course.id)
    if (exists) {
      return false
    }

    const nextItems = [...items, course]
    persistCart(nextItems)
    set({ items: nextItems })
    return true
  },
  removeCourse(courseId) {
    const nextItems = get().items.filter((item) => item.id !== courseId)
    persistCart(nextItems)
    set({ items: nextItems })
  },
  clearCart() {
    persistCart([])
    set({ items: [] })
  },
}))
