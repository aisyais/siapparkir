import { create } from 'zustand'

const useAuthStore = create((set) => ({
  user:  JSON.parse(localStorage.getItem('sp_user')) || null,
  token: localStorage.getItem('sp_token') || null,

  setAuth: (user, token) => {
    localStorage.setItem('sp_user', JSON.stringify(user))
    localStorage.setItem('sp_token', token)
    set({ user, token })
  },

  logout: () => {
    localStorage.removeItem('sp_user')
    localStorage.removeItem('sp_token')
    set({ user: null, token: null })
  },
}))

export default useAuthStore