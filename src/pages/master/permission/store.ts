import { createCrudStore } from '@/lib/createCrudStore'
import type { Permission } from '@/types/entity'

export const usePermissionStore = createCrudStore<Permission>('/permissions')
