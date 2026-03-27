import { useQuery } from '@tanstack/react-query'

import axios from '@/lib/axios'
import type { AcademicYear } from '@/types/entity'

type RawChartApiResponse = {
  filter_applied?: boolean
  academic_year_id?: string | number
  [key: string]: unknown
}

export type DashboardChartData = {
  labels: string[]
  values: number[]
  filterApplied: boolean
  academicYearId: string | number | 'all'
}

const DASHBOARD_QUERY_SCOPE = 'dashboard'

export const dashboardQueryKeys = {
  academicYears: [DASHBOARD_QUERY_SCOPE, 'academic-years'] as const,
  ideasByDepartments: (academicYear?: string) =>
    [
      DASHBOARD_QUERY_SCOPE,
      'ideas-by-departments',
      academicYear ?? 'all',
    ] as const,
  ideasByCategories: (academicYear?: string) =>
    [
      DASHBOARD_QUERY_SCOPE,
      'ideas-by-categories',
      academicYear ?? 'all',
    ] as const,
  reportsByCategories: (academicYear?: string) =>
    [
      DASHBOARD_QUERY_SCOPE,
      'reports-by-categories',
      academicYear ?? 'all',
    ] as const,
}

const toValidDate = (value: unknown): Date | null => {
  if (!value) return null
  const date = value instanceof Date ? value : new Date(String(value))
  return Number.isNaN(date.getTime()) ? null : date
}

const formatPreviewDate = (value: unknown): string => {
  const date = toValidDate(value)
  if (!date) return 'N/A'
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  })
}

const normalizeAcademicYears = (payload: unknown): AcademicYear[] => {
  const rows = (payload as { data?: { data?: unknown[] } | unknown[] })?.data

  if (Array.isArray(rows)) return rows as AcademicYear[]

  if (rows && Array.isArray((rows as { data?: unknown[] }).data)) {
    return (rows as { data: unknown[] }).data as AcademicYear[]
  }

  return []
}

const appendAcademicYearQuery = (
  path: string,
  academicYear?: string,
): string => {
  if (!academicYear) return path
  const separator = path.includes('?') ? '&' : '?'
  return `${path}${separator}academic_year=${encodeURIComponent(academicYear)}`
}

const fetchFromFirstAvailableRoute = async <T>(
  routes: string[],
  academicYear?: string,
): Promise<T> => {
  let lastError: unknown

  for (const route of routes) {
    try {
      const { data } = await axios.get<T>(
        appendAcademicYearQuery(route, academicYear),
      )
      return data
    } catch (error) {
      lastError = error
    }
  }

  throw lastError ?? new Error('No dashboard route is available')
}

const mapCountEntries = (counts: Record<string, number>) => {
  return Object.entries(counts)
    .map(([label, value]) => ({ label, value }))
    .sort(
      (left, right) =>
        right.value - left.value || left.label.localeCompare(right.label),
    )
}

const normalizeChartResponse = (
  payload: RawChartApiResponse,
  countKeys: string[],
): DashboardChartData => {
  const counts = countKeys
    .map((key) => payload[key])
    .find(
      (entry): entry is Record<string, number> =>
        Boolean(entry) && typeof entry === 'object' && !Array.isArray(entry),
    )

  const points = mapCountEntries(counts ?? {})

  return {
    labels: points.map((point) => point.label),
    values: points.map((point) => point.value),
    filterApplied: Boolean(payload.filter_applied),
    academicYearId: payload.academic_year_id ?? 'all',
  }
}

export const useDashboardAcademicYearsQuery = () => {
  return useQuery({
    queryKey: dashboardQueryKeys.academicYears,
    queryFn: async () => {
      const { data } = await axios.get('/academic-years')
      return normalizeAcademicYears(data)
    },
  })
}

export const useIdeasByDepartmentsQuery = (academicYear?: string) => {
  return useQuery({
    queryKey: dashboardQueryKeys.ideasByDepartments(academicYear),
    queryFn: async () => {
      const payload = await fetchFromFirstAvailableRoute<RawChartApiResponse>(
        [
          '/reports/ideas-by-departments',
          '/reports/ideas-by-department',
          '/ideas-by-departments',
          '/ideas-by-department',
        ],
        academicYear,
      )

      return normalizeChartResponse(payload, [
        'ideas_by_departments',
        'ideas_by_department',
      ])
    },
  })
}

export const useIdeasByCategoriesQuery = (academicYear?: string) => {
  return useQuery({
    queryKey: dashboardQueryKeys.ideasByCategories(academicYear),
    queryFn: async () => {
      const payload = await fetchFromFirstAvailableRoute<RawChartApiResponse>(
        ['/reports/ideas-by-categories', '/ideas-by-categories'],
        academicYear,
      )

      return normalizeChartResponse(payload, [
        'ideas_by_categories',
        'ideas_by_category',
      ])
    },
  })
}

export const useReportsByCategoriesQuery = (academicYear?: string) => {
  return useQuery({
    queryKey: dashboardQueryKeys.reportsByCategories(academicYear),
    queryFn: async () => {
      const payload = await fetchFromFirstAvailableRoute<RawChartApiResponse>(
        ['/reports/reports-by-categories', '/reports-by-categories'],
        academicYear,
      )

      return normalizeChartResponse(payload, [
        'reports_by_categories',
        'reports_by_category',
      ])
    },
  })
}

export const toAcademicYearPreviewLabel = (
  year: Partial<AcademicYear>,
): string => {
  const fromDate = formatPreviewDate(year.from_date)
  const toDate = formatPreviewDate(year.to_date)
  return `${year.name ?? 'Unnamed'} (${fromDate} - ${toDate})`
}
