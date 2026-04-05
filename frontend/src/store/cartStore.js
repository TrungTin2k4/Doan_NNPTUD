import { create } from 'zustand'
import { addCartItemRequest, clearCartRequest, getMyCartRequest, removeCartItemRequest } from '../api/cart'

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

function mapCartItems(cart) {
  const items = Array.isArray(cart?.items) ? cart.items : []

  return items.map((item) => ({
    id: item.courseId,
    title: item.title,
    price: Number(item.price ?? 0),
    thumbnail: item.thumbnail || null,
  }))
}

export const useCartStore = create((set, get) => ({
  items: getStoredCart(),
  totalAmount: getStoredCart().reduce((sum, item) => sum + Number(item.price ?? 0), 0),
  loading: false,
  async syncCart(token) {
    if (!token) {
      const localItems = getStoredCart()
      set({ items: localItems, totalAmount: localItems.reduce((sum, item) => sum + Number(item.price ?? 0), 0), loading: false })
      return
    }

    set({ loading: true })
    try {
      const cart = await getMyCartRequest()
      const items = mapCartItems(cart)
      persistCart(items)
      set({
        items,
        totalAmount: Number(cart?.totalAmount ?? 0),
        loading: false,
      })
    } catch (error) {
      set({ loading: false })
      throw error
    }
  },
  async addCourse(course, token) {
    const items = get().items
    const exists = items.some((item) => item.id === course.id)
    if (exists && !token) {
      return false
    }

    if (token) {
      const cart = await addCartItemRequest(course.id)
      const nextItems = mapCartItems(cart)
      persistCart(nextItems)
      set({ items: nextItems, totalAmount: Number(cart?.totalAmount ?? 0) })
      return !exists
    }

    const nextItems = [...items, course]
    persistCart(nextItems)
    set({ items: nextItems, totalAmount: nextItems.reduce((sum, item) => sum + Number(item.price ?? 0), 0) })
    return true
  },
  async removeCourse(courseId, token) {
    if (token) {
      const cart = await removeCartItemRequest(courseId)
      const items = mapCartItems(cart)
      persistCart(items)
      set({ items, totalAmount: Number(cart?.totalAmount ?? 0) })
      return
    }

    const nextItems = get().items.filter((item) => item.id !== courseId)
    persistCart(nextItems)
    set({ items: nextItems, totalAmount: nextItems.reduce((sum, item) => sum + Number(item.price ?? 0), 0) })
  },
  async clearCart(token) {
    if (token) {
      const cart = await clearCartRequest()
      persistCart([])
      set({ items: [], totalAmount: Number(cart?.totalAmount ?? 0) })
      return
    }

    persistCart([])
    set({ items: [], totalAmount: 0 })
  },
}))
