import { createCrudStore } from '@/lib/createCrudStore'
import type { Idea } from '@/types/entity'

export const useReportStore = createCrudStore<Idea>('/reports')

export const useIdeaActivitationStore =
  createCrudStore<Record<string, string>>('/ideas')
export const useUserActivitationStore =
  createCrudStore<Record<string, string>>('/users')
export const useCommentActivitationStore =
  createCrudStore<Record<string, string>>('/comments')
