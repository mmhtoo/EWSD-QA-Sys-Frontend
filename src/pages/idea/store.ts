import { createCrudStore } from '@/lib/createCrudStore'
import type { Idea } from '@/types/entity'

export const useIdeaStore = createCrudStore<Idea>('/ideas')
