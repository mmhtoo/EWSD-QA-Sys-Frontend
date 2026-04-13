import { Navigate, type RouteObject } from 'react-router'
import { AppRoutes } from '@/configs/routes'
import { DashboardLayout } from '@/components/layouts'
import { hasPermission } from '@/utils/rbac'

import {
  AcademicYearListPage,
  ContentReportListPage,
  DashboardHomePage,
  DepartmentListPage,
  IdeaFeedsPage,
  IdeaCategoryListPage,
  IdeaListPage,
  LoginPage,
  PermissionListPage,
  ReportCategoryListPage,
  RoleListPage,
  UserListPage,
} from '@/pages'

import { PublicRoute } from './PublicRoute'
import { ProtectedRoute } from './ProtectedRoute'
import type { JSX } from 'react'
import Error403 from '@/pages/error/Error403'
import Error404 from '@/pages/error/Error404'
interface PermissionGuardProps {
  children: JSX.Element
  permission: string | string[]
}

export const PermissionGuard = ({
  children,
  permission,
}: PermissionGuardProps) => {
  if (!hasPermission(permission)) {
    return <Navigate to="/403" replace />
  }
  return children
}

export const AppRootRoutes: RouteObject[] = [
  {
    path: '/',
    element: <Navigate to={AppRoutes.LOGIN.path} replace />,
  },

  {
    path: '/403',
    element: <Error403 />,
  },
  {
    path: '/404',
    element: <Error404 />,
  },

  {
    element: <PublicRoute />,
    children: [{ path: AppRoutes.LOGIN.path, element: <LoginPage /> }],
  },

  {
    element: <ProtectedRoute />,
    children: [
      {
        path: AppRoutes.DASHBOARD_BASE.path,
        element: <DashboardLayout />,
        children: [
          // Dashboard Home
          {
            index: true,
            element: (
              <PermissionGuard permission={['dashboard.admin', 'dashboard.qa']}>
                <DashboardHomePage />
              </PermissionGuard>
            ),
          },
          {
            path: AppRoutes.STARTER_HOME.path,
            element: <p>This is Starter Page.</p>,
          },
          {
            path: AppRoutes.DASHBOARD_HOME.path,
            element: (
              <PermissionGuard permission={['dashboard.admin', 'dashboard.qa']}>
                <DashboardHomePage />
              </PermissionGuard>
            ),
          },

          // Ideas Section
          {
            path: AppRoutes.IDEA_LIST.path,
            element: (
              <PermissionGuard permission="idea.view">
                <IdeaListPage />
              </PermissionGuard>
            ),
          },
          {
            path: AppRoutes.IDEA_FEEDS.path,
            element: (
              <PermissionGuard permission="idea.user.view">
                <IdeaFeedsPage />
              </PermissionGuard>
            ),
          },

          // Reports Section
          {
            path: AppRoutes.REPORTS_LIST.path,
            element: (
              <PermissionGuard permission="report.view">
                <ContentReportListPage />
              </PermissionGuard>
            ),
          },

          // Master Data Section
          {
            path: AppRoutes.DASHBOARD_MASTER_BASE.path,
            children: [
              {
                path: AppRoutes.USER_LIST.path,
                element: (
                  <PermissionGuard permission="user.view">
                    <UserListPage />
                  </PermissionGuard>
                ),
              },
              {
                path: AppRoutes.ROLE_LIST.path,
                element: (
                  <PermissionGuard permission="role.view">
                    <RoleListPage />
                  </PermissionGuard>
                ),
              },
              {
                path: AppRoutes.PERMISSION_LIST.path,
                element: (
                  <PermissionGuard permission="permission.view">
                    <PermissionListPage />
                  </PermissionGuard>
                ),
              },
              {
                path: AppRoutes.DEPARTMENT_LIST.path,
                element: (
                  <PermissionGuard permission="department.view">
                    <DepartmentListPage />
                  </PermissionGuard>
                ),
              },
              {
                path: AppRoutes.IDEA_CATEGORY_LIST.path,
                element: (
                  <PermissionGuard permission="idea.categories.view">
                    <IdeaCategoryListPage />
                  </PermissionGuard>
                ),
              },
              {
                path: AppRoutes.REPORT_CATEGORY_LIST.path,
                element: (
                  <PermissionGuard permission="report.categories.view">
                    <ReportCategoryListPage />
                  </PermissionGuard>
                ),
              },
              {
                path: AppRoutes.ACADEMIC_YEAR_LIST.path,
                element: (
                  <PermissionGuard permission="academic.view">
                    <AcademicYearListPage />
                  </PermissionGuard>
                ),
              },
            ],
          },
        ],
      },
    ],
  },

  // Catch-all 404
  {
    path: '*',
    element: <Navigate to={'/404'} replace />,
  },
]
