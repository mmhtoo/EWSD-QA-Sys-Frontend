import { createCrudStore } from '@/lib/createCrudStore'
import type { Idea } from '@/types/entity'
import { create } from 'zustand'

export const useIdeaStore = (academicYear?: string) => {
  const query = academicYear ? `?academic_year=${academicYear}` : ''
  return createCrudStore<Idea>(`/ideas${query}`)
}

export const useReportStore =
  createCrudStore<Record<string, string | number>>('/reports')

interface IdeaSpecificState {
  formValues: Record<string, any>
  showFormModal: boolean
  commentFiles: File[] | undefined
  replyFiles: File[] | undefined
  setFormValues: (payload: any) => void
  setShowFormModal: (val: boolean) => void
  setCommentFiles: (files: File[] | undefined) => void
  setReplyFiles: (files: File[] | undefined) => void
}

export const useIdeaSpecificStore = create<IdeaSpecificState>((set) => ({
  formValues: {},
  showFormModal: false,
  commentFiles: [],
  replyFiles: [],
  setFormValues: (val: any) => set({ formValues: val }),
  setShowFormModal: (val: boolean) => set({ showFormModal: val }),
  setCommentFiles: (files) => set({ commentFiles: files }),
  setReplyFiles: (files) => set({ replyFiles: files }),
}))
