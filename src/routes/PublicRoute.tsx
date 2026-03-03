import { Navigate, Outlet } from 'react-router'
import { AppRoutes } from '@/configs/routes'
import { isAuthenticated } from '@/utils/auth'

export function PublicRoute() {
  if (isAuthenticated()) {
    return <Navigate to={AppRoutes.DASHBOARD_HOME.fullPath} replace />
  }

  return <Outlet />
}
