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

export type PopularIdea = {
  id: number
  title: string
  content: string
  comments: number
  likes: number
  score: number
  isAnonymous: boolean
  createdAt: Date
}

type RawPopularIdea = {
  id: number | string
  title?: string
  content?: string
  comments_count?: number | string
  thumbs_up?: number | string
  score?: number | string
  is_annonymous?: number | boolean
  is_anonymous?: number | boolean
  created_at?: string
}

type RawPopularIdeasResponse = {
  data?: RawPopularIdea[]
}

type RawExceptionReportsResponse = {
  ideas_without_comments?: number | string
  anonymous_ideas?: number | string
  anonymous_comment?: number | string
  data?: {
    ideas_without_comments?: number | string
    anonymous_ideas?: number | string
    anonymous_comment?: number | string
  }
}

type RawContributorsCountRow = {
  id?: number | string
  name?: string
  total_users?: number | string
  active_users?: number | string
}

type RawContributorsCountsResponse = {
  data?: RawContributorsCountRow[]
}

const DASHBOARD_QUERY_SCOPE = 'dashboard'

export const dashboardQueryKeys = {
  academicYears: [DASHBOARD_QUERY_SCOPE, 'academic-years'] as const,
  ideasByDepartments: (academicYear?: string) =>
    [
      DASHBOARD_QUERY_SCOPE,
      'ideas-by-department',
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
  popularIdeas: (academicYear?: string) =>
    [DASHBOARD_QUERY_SCOPE, 'popular-ideas', academicYear ?? 'all'] as const,
  exceptionReports: (academicYear?: string) =>
    [
      DASHBOARD_QUERY_SCOPE,
      'exception-reports',
      academicYear ?? 'all',
    ] as const,
  contributorsCounts: (academicYear?: string) =>
    [
      DASHBOARD_QUERY_SCOPE,
      'contributors-counts',
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

const toNumber = (value: unknown): number => {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

const parseApiDate = (value: unknown): Date => {
  if (value instanceof Date) return value
  const raw = String(value ?? '')
  const normalized = raw.includes(' ') ? raw.replace(' ', 'T') : raw
  const date = new Date(normalized)
  return Number.isNaN(date.getTime()) ? new Date() : date
}

const normalizePopularIdeas = (
  payload: RawPopularIdeasResponse,
): PopularIdea[] => {
  const rows = Array.isArray(payload?.data) ? payload.data : []

  return rows.map((row) => {
    const comments = toNumber(row.comments_count)
    const likes = toNumber(row.thumbs_up)
    const score = toNumber(row.score) || comments + likes

    return {
      id: toNumber(row.id),
      title: row.title ?? 'Untitled Idea',
      content: row.content ?? '',
      comments,
      likes,
      score,
      isAnonymous: Boolean(row.is_annonymous ?? row.is_anonymous),
      createdAt: parseApiDate(row.created_at),
    }
  })
}

const normalizeExceptionReports = (
  payload: RawExceptionReportsResponse,
): number[] => {
  const source = payload.data ?? payload

  return [
    toNumber(source.ideas_without_comments),
    toNumber(source.anonymous_ideas),
    toNumber(source.anonymous_comment),
  ]
}

const normalizeContributorsCounts = (
  payload: RawContributorsCountsResponse,
): DashboardChartData => {
  const rows = Array.isArray(payload?.data) ? payload.data : []

  const points = rows
    .map((row) => ({
      label: String(row.name ?? 'Unknown Department'),
      value: toNumber(row.total_users ?? row.active_users),
    }))
    .sort(
      (left, right) =>
        right.value - left.value || left.label.localeCompare(right.label),
    )

  return {
    labels: points.map((point) => point.label),
    values: points.map((point) => point.value),
    filterApplied: false,
    academicYearId: 'all',
  }
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
        ['/ideas-by-department'],
        academicYear,
      )

      return normalizeChartResponse(payload, ['ideas_by_department'])
    },
  })
}

export const useIdeasByCategoriesQuery = (academicYear?: string) => {
  return useQuery({
    queryKey: dashboardQueryKeys.ideasByCategories(academicYear),
    queryFn: async () => {
      const payload = await fetchFromFirstAvailableRoute<RawChartApiResponse>(
        ['/ideas-by-categories'],
        academicYear,
      )

      return normalizeChartResponse(payload, ['ideas_by_categories'])
    },
  })
}

export const useReportsByCategoriesQuery = (academicYear?: string) => {
  return useQuery({
    queryKey: dashboardQueryKeys.reportsByCategories(academicYear),
    queryFn: async () => {
      const payload = await fetchFromFirstAvailableRoute<RawChartApiResponse>(
        ['/reports-by-categories'],
        academicYear,
      )

      return normalizeChartResponse(payload, ['reports_by_categories'])
    },
  })
}

export const usePopularIdeasQuery = (academicYear?: string) => {
  return useQuery({
    queryKey: dashboardQueryKeys.popularIdeas(academicYear),
    queryFn: async () => {
      const payload =
        await fetchFromFirstAvailableRoute<RawPopularIdeasResponse>(
          ['/popular-ideas'],
          academicYear,
        )

      return normalizePopularIdeas(payload)
    },
  })
}

export const useExceptionReportsQuery = (academicYear?: string) => {
  return useQuery({
    queryKey: dashboardQueryKeys.exceptionReports(academicYear),
    queryFn: async () => {
      const payload =
        await fetchFromFirstAvailableRoute<RawExceptionReportsResponse>(
          ['/exceptions-reports'],
          academicYear,
        )

      return normalizeExceptionReports(payload)
    },
  })
}

export const useContributorsCountsQuery = (academicYear?: string) => {
  return useQuery({
    queryKey: dashboardQueryKeys.contributorsCounts(academicYear),
    queryFn: async () => {
      const payload =
        await fetchFromFirstAvailableRoute<RawContributorsCountsResponse>(
          ['/contributors-counts'],
          academicYear,
        )

      return normalizeContributorsCounts(payload)
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
