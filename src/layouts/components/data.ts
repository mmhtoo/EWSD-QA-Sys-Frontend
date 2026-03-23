import { AppRoutes } from '@/configs/routes'
import { type MenuItemType } from '@/types/layout'
import { type IconType } from 'react-icons'
import {
  TbBuilding,
  TbCalendarEvent,
  TbCategory,
  TbKey,
  TbLogout2,
  TbShieldCheck,
  TbUserCircle,
  TbUsersGroup,
} from 'react-icons/tb'
import { LuHousePlug, LuShieldAlert, LuSparkles } from 'react-icons/lu'

type UserDropdownItemType = {
  id?: string
  label?: string
  icon?: IconType
  url?: string
  isDivider?: boolean
  isHeader?: boolean
  class?: string
}

export const userDropdownItems: UserDropdownItemType[] = [
  {
    label: 'Welcome back!',
    isHeader: true,
  },
  {
    isDivider: true,
  },
  {
    id: 'logout-btn',
    label: 'Log Out',
    icon: TbLogout2,
    url: AppRoutes.LOGIN.fullPath,
    class: 'text-danger fw-semibold',
  },
]

export const menuItems: MenuItemType[] = [
  {
    key: 'qa',
    label: 'QA System',
    isTitle: true,
    permission: ['dashboard.admin', 'dashboard.qa'],
  },
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: LuHousePlug,
    url: AppRoutes.DASHBOARD_HOME.fullPath,
    permission: ['dashboard.admin', 'dashboard.qa'],
  },
  {
    key: 'ideas-section',
    label: 'Ideas',
    isTitle: true,
    permission: ['idea.user.view', 'idea.view'],
  },
  {
    key: 'idea-feeds',
    label: 'Newsfeeds',
    icon: LuSparkles,
    url: AppRoutes.IDEA_FEEDS.fullPath,
    permission: ['idea.user.view'],
  },
  {
    key: 'idea-list',
    label: 'Ideas',
    icon: LuSparkles,
    url: AppRoutes.IDEA_LIST.fullPath,
    permission: ['idea.view'],
  },
  {
    key: 'users-section',
    label: 'Users',
    isTitle: true,
    permission: ['user.view'],
  },
  {
    key: 'users',
    label: 'Users',
    icon: TbUserCircle,
    url: AppRoutes.USER_LIST.fullPath,
    permission: ['user.view'],
  },
  {
    key: 'reports-section',
    label: 'Reports',
    isTitle: true,
    permission: ['report.view'],
  },
  {
    key: 'reports',
    label: 'Content Reports',
    icon: LuShieldAlert,
    url: AppRoutes.REPORTS_LIST.fullPath,
    permission: ['report.view'],
  },
  {
    key: 'master-section',
    label: 'Master Data',
    isTitle: true,
    permission: [
      'department.view',
      'academic.view',
      'idea.categories.view',
      'report.categories.view',
      'role.view',
      'permission.view',
    ],
  },
  {
    key: 'departments',
    label: 'Departments',
    icon: TbBuilding,
    url: AppRoutes.DEPARTMENT_LIST.fullPath,
    permission: ['department.view'],
  },
  {
    key: 'academic-years',
    label: 'Academic Years',
    icon: TbCalendarEvent,
    url: AppRoutes.ACADEMIC_YEAR_LIST.fullPath,
    permission: ['academic.view'],
  },
  {
    key: 'idea-categories',
    label: 'Idea Categories',
    icon: TbCategory,
    url: AppRoutes.IDEA_CATEGORY_LIST.fullPath,
    permission: ['idea.categories.view'],
  },
  {
    key: 'report-categories',
    label: 'Report Categories',
    icon: TbShieldCheck,
    url: AppRoutes.REPORT_CATEGORY_LIST.fullPath,
    permission: ['report.categories.view'],
  },
  {
    key: 'roles',
    label: 'Roles',
    icon: TbUsersGroup,
    url: AppRoutes.ROLE_LIST.fullPath,
    permission: ['role.view'],
  },
  {
    key: 'permissions',
    label: 'Permissions',
    icon: TbKey,
    url: AppRoutes.PERMISSION_LIST.fullPath,
    permission: ['permission.view'],
  },
]

export const horizontalMenuItems = menuItems
