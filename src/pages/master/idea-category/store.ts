import { createCrudStore } from '@/lib/createCrudStore'
import type { IdeaCategory } from '@/types/entity'

export const useIdeaCategoryStore =
  createCrudStore<IdeaCategory>('/idea-categories')
