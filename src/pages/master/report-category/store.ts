import { createCrudStore } from '@/lib/createCrudStore'
import type { ReportCategory } from '@/types/entity'

export const useReportCategoryStore =
  createCrudStore<ReportCategory>('/report-categories')
