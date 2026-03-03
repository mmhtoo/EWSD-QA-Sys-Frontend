import { createCrudStore } from '@/lib/createCrudStore'
import type { AcademicYear } from '@/types/entity'

export const useAcademicYearStore =
  createCrudStore<AcademicYear>('/academic-years')
