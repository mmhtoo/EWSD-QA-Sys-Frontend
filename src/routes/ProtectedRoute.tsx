import { Navigate, Outlet } from 'react-router'
import { AppRoutes } from '@/configs/routes'
import { isAuthenticated } from '@/utils/auth'

export function ProtectedRoute() {
  if (!isAuthenticated()) {
    return <Navigate to={AppRoutes.LOGIN.path} replace />
  }

  return <Outlet />
}
