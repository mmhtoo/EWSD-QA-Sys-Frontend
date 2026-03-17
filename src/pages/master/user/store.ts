import { createCrudStore } from '@/lib/createCrudStore'
import type { User } from '@/types/entity'

export const useUserStore = createCrudStore<User>('/users')
export const useRegisterStore = createCrudStore<User>('/register')
