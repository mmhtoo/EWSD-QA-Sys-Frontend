import { createCrudStore } from '@/lib/createCrudStore'
import type { Department } from '@/types/entity'

export const useDepartmentStore = createCrudStore<Department>('/departments')
