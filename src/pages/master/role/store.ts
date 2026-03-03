import { createCrudStore } from '@/lib/createCrudStore'
import type { Role } from '@/types/entity'

export const useRoleStore = createCrudStore<Role>('/roles')
