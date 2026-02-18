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
    label: 'Log Out',
    icon: TbLogout2,
    url: AppRoutes.LOGIN.fullPath,
    class: 'text-danger fw-semibold',
  },
]

export const menuItems: MenuItemType[] = [
  { key: 'qa', label: 'QA System', isTitle: true },
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: LuHousePlug,
    url: AppRoutes.DASHBOARD_HOME.fullPath,
  },
  { key: 'ideas-section', label: 'Ideas', isTitle: true },
  {
    key: 'idea-list',
    label: 'Ideas',
    icon: LuSparkles,
    url: AppRoutes.IDEA_LIST.fullPath,
  },
  {
    key: 'idea-feeds',
    label: 'Feeds',
    icon: LuSparkles,
    url: AppRoutes.IDEA_FEEDS.fullPath,
  },
  { key: 'users-section', label: 'Users', isTitle: true },
  {
    key: 'users',
    label: 'Users',
    icon: TbUserCircle,
    url: AppRoutes.USER_LIST.fullPath,
  },
  { key: 'reports-section', label: 'Reports', isTitle: true },
  {
    key: 'reports',
    label: 'Content Reports',
    icon: LuShieldAlert,
    url: AppRoutes.REPORTS_LIST.fullPath,
  },
  { key: 'master-section', label: 'Master Data', isTitle: true },
  {
    key: 'departments',
    label: 'Departments',
    icon: TbBuilding,
    url: AppRoutes.DEPARTMENT_LIST.fullPath,
  },
  {
    key: 'academic-years',
    label: 'Academic Years',
    icon: TbCalendarEvent,
    url: AppRoutes.ACADEMIC_YEAR_LIST.fullPath,
  },
  {
    key: 'idea-categories',
    label: 'Idea Categories',
    icon: TbCategory,
    url: AppRoutes.IDEA_CATEGORY_LIST.fullPath,
  },
  {
    key: 'report-categories',
    label: 'Report Categories',
    icon: TbShieldCheck,
    url: AppRoutes.REPORT_CATEGORY_LIST.fullPath,
  },
  {
    key: 'roles',
    label: 'Roles',
    icon: TbUsersGroup,
    url: AppRoutes.ROLE_LIST.fullPath,
  },
  {
    key: 'permissions',
    label: 'Permissions',
    icon: TbKey,
    url: AppRoutes.PERMISSION_LIST.fullPath,
  },
]

export const horizontalMenuItems = menuItems
