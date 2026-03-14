import { createCrudStore } from '@/lib/createCrudStore'
import type { User } from '@/types/entity'

export const useUserStore = createCrudStore<User>('/users?per_page=1000000')
export const useRegisterStore = createCrudStore<User>('/register')
