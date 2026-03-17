import { createCrudStore } from '@/lib/createCrudStore'
import type { Idea } from '@/types/entity'
import { create } from 'zustand'

export const useIdeaStore = createCrudStore<Idea>('/ideas')

interface IdeaSpecificState {
  showFormModal: boolean
  setShowFormModal: (val: boolean) => void
}

export const useIdeaSpecificStore = create<IdeaSpecificState>((set) => ({
  showFormModal: false,
  setShowFormModal: (val: boolean) => set({ showFormModal: val }),
}))
