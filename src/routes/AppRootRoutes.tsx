import { AppRoutes } from '@/configs/routes'
import { LoginPage } from '@/pages'
import type { RouteObject } from 'react-router'

export const AppRootRoutes: RouteObject[] = [
  {
    path: AppRoutes.LOGIN.path,
    element: <LoginPage />,
  },
]
