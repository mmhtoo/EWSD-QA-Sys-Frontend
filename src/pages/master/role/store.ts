import { createCrudStore } from '@/lib/createCrudStore'
import type { Role } from '@/types/entity'

export const useRoleStore = createCrudStore<Role>('/roles')

export const useRolePermissionAttachStore = createCrudStore<any>(
  '/role-permission/assign',
)

export const useRefreshTokenStore = createCrudStore<any>('/auth/refresh-token')
