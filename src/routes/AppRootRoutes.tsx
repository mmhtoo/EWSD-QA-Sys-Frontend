import { DashboardLayout } from '@/components/layouts'
import { AppRoutes } from '@/configs/routes'
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
import { type RouteObject } from 'react-router'

export const AppRootRoutes: RouteObject[] = [
  {
    path: AppRoutes.LOGIN.path,
    element: <LoginPage />,
  },
  {
    path: AppRoutes.DASHBOARD_BASE.path,
    element: <DashboardLayout />,
    children: [
      {
        index: true,
        element: <DashboardHomePage />,
      },
      {
        path: AppRoutes.DASHBOARD_HOME.path,
        element: <DashboardHomePage />,
      },
      {
        path: AppRoutes.IDEA_LIST.path,
        element: <IdeaListPage />,
      },
      {
        path: AppRoutes.IDEA_FEEDS.path,
        element: <IdeaFeedsPage />,
      },
      {
        path: AppRoutes.REPORTS_LIST.path,
        element: <ContentReportListPage />,
      },
      {
        path: AppRoutes.DASHBOARD_MASTER_BASE.path,
        children: [
          {
            path: AppRoutes.ROLE_LIST.path,
            element: <RoleListPage />,
          },
          {
            path: AppRoutes.PERMISSION_LIST.path,
            element: <PermissionListPage />,
          },
          {
            path: AppRoutes.DEPARTMENT_LIST.path,
            element: <DepartmentListPage />,
          },
          {
            path: AppRoutes.IDEA_CATEGORY_LIST.path,
            element: <IdeaCategoryListPage />,
          },
          {
            path: AppRoutes.REPORT_CATEGORY_LIST.path,
            element: <ReportCategoryListPage />,
          },
          {
            path: AppRoutes.ACADEMIC_YEAR_LIST.path,
            element: <AcademicYearListPage />,
          },
          {
            path: AppRoutes.USER_LIST.path,
            element: <UserListPage />,
          },
        ],
      },
    ],
  },
]
