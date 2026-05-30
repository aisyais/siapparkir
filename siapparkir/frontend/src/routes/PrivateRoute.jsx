import { Navigate, Outlet } from 'react-router-dom'
import useAuthStore from '../store/authStore'

export default function PrivateRoute({ role }) {
  const { user, token } = useAuthStore()

  if (!token || !user) return <Navigate to="/internal/login" replace />
  if (role && user.role !== role) return <Navigate to="/internal/login" replace />

  return <Outlet />
}