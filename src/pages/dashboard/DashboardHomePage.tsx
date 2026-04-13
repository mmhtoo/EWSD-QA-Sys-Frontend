import { useMemo, useState } from 'react'
import { Button, Col, Container, ProgressBar, Row } from 'react-bootstrap'

import ComponentCard from '@/components/cards/ComponentCard'
import DetailFieldList from '@/components/common/DetailFieldList'
import DashboardPage from '@/components/common/DashboardPage'
import EntityDetailModal from '@/components/common/EntityDetailModal'

import {
  getIdeaModerationSignalsOptions,
  getIdeasByCategoryOptions,
  getIdeasByDepartmentOptions,
  getMostActiveUsersOptions,
  getMostViewedPagesOptions,
  getReportsByCategoryOptions,
  getUsersByDepartmentOptions,
} from './chartOptions'
import DashboardChartCard from './components/DashboardChartCard'
import DashboardFilters from './components/DashboardFilters'
import {
  type PopularIdea,
  useContributorsCountsQuery,
  toAcademicYearPreviewLabel,
  useDashboardAcademicYearsQuery,
  useExceptionReportsQuery,
  useIdeasByCategoriesQuery,
  useIdeasByDepartmentsQuery,
  useMostActiveUsersQuery,
  useMostViewedPagesQuery,
  usePopularIdeasQuery,
  useReportsByCategoriesQuery,
} from './queries'

const getChartEmptyMessage = (
  isLoading: boolean,
  isError: boolean,
  error: unknown,
): string => {
  if (isLoading) return 'Loading chart data...'
  if (isError) {
    return error instanceof Error
      ? `Unable to load chart data: ${error.message}`
      : 'Unable to load chart data.'
  }
  return 'No data available for selected filters.'
}

const EMPTY_CHART_DATA = {
  labels: [],
  values: [],
  filterApplied: false,
  academicYearId: 'all' as const,
}

export const DashboardHomePage = () => {
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('')
  const [showIdeaDetailModal, setShowIdeaDetailModal] = useState(false)
  const [selectedPopularIdea, setSelectedPopularIdea] =
    useState<PopularIdea | null>(null)

  const selectedAcademicYearParam = selectedAcademicYear || undefined

  const { data: academicYears = [] } = useDashboardAcademicYearsQuery()

  const ideasByDepartmentsQuery = useIdeasByDepartmentsQuery(
    selectedAcademicYearParam,
  )

  const ideasByCategoriesQuery = useIdeasByCategoriesQuery(
    selectedAcademicYearParam,
  )

  const reportsByCategoriesQuery = useReportsByCategoriesQuery(
    selectedAcademicYearParam,
  )

  const contributorsCountsQuery = useContributorsCountsQuery(
    selectedAcademicYearParam,
  )

  const popularIdeasQuery = usePopularIdeasQuery(selectedAcademicYearParam)
  const mostViewedPagesQuery = useMostViewedPagesQuery()
  const mostActiveUsersQuery = useMostActiveUsersQuery()

  const exceptionReportsQuery = useExceptionReportsQuery(
    selectedAcademicYearParam,
  )

  const selectedAcademicYearEntity = useMemo(
    () =>
      academicYears.find((year) => String(year.id) === selectedAcademicYear) ??
      null,
    [academicYears, selectedAcademicYear],
  )

  const academicYearOptions = useMemo(
    () =>
      academicYears.map((year) => ({
        value: String(year.id),
        label: toAcademicYearPreviewLabel(year),
      })),
    [academicYears],
  )

  const selectedAcademicYearPreview = selectedAcademicYearEntity
    ? `Preview: ${toAcademicYearPreviewLabel(selectedAcademicYearEntity)}`
    : 'Preview: all academic years'

  const ideasByDepartment = ideasByDepartmentsQuery.data ?? EMPTY_CHART_DATA
  const ideasByCategories = ideasByCategoriesQuery.data ?? EMPTY_CHART_DATA
  const reportsByCategories = reportsByCategoriesQuery.data ?? EMPTY_CHART_DATA
  const usersByDepartments = contributorsCountsQuery.data ?? EMPTY_CHART_DATA
  const mostViewedPages = mostViewedPagesQuery.data ?? EMPTY_CHART_DATA
  const mostActiveUsers = mostActiveUsersQuery.data ?? EMPTY_CHART_DATA

  const mostPopularIdeas = popularIdeasQuery.data ?? []

  const ideaModerationSignals = exceptionReportsQuery.data ?? [0, 0, 0]

  const ideasByDepartmentOptions = useMemo(
    () =>
      getIdeasByDepartmentOptions(
        ideasByDepartment.labels,
        ideasByDepartment.values,
      ),
    [ideasByDepartment],
  )

  const ideasByCategoriesOptions = useMemo(
    () =>
      getIdeasByCategoryOptions(
        ideasByCategories.labels,
        ideasByCategories.values,
      ),
    [ideasByCategories],
  )

  const reportsByCategoriesOptions = useMemo(
    () =>
      getReportsByCategoryOptions(
        reportsByCategories.labels,
        reportsByCategories.values,
      ),
    [reportsByCategories],
  )

  const usersByDepartmentsOptions = useMemo(
    () =>
      getUsersByDepartmentOptions(
        usersByDepartments.labels,
        usersByDepartments.values,
      ),
    [usersByDepartments],
  )

  const mostViewedPagesOptions = useMemo(
    () =>
      getMostViewedPagesOptions(mostViewedPages.labels, mostViewedPages.values),
    [mostViewedPages],
  )

  const mostActiveUsersOptions = useMemo(
    () =>
      getMostActiveUsersOptions(mostActiveUsers.labels, mostActiveUsers.values),
    [mostActiveUsers],
  )

  const ideaModerationSignalsOptions = useMemo(
    () => getIdeaModerationSignalsOptions(ideaModerationSignals),
    [ideaModerationSignals],
  )

  const mostViewedPagesRows = useMemo(
    () =>
      mostViewedPages.labels.map((label, index) => ({
        label,
        views: mostViewedPages.values[index] ?? 0,
      })),
    [mostViewedPages],
  )

  const maxMostViewedCount = useMemo(
    () => Math.max(...mostViewedPagesRows.map((row) => row.views), 1),
    [mostViewedPagesRows],
  )

  const hasAcademicYearFilter = Boolean(selectedAcademicYear)

  return (
    <Container fluid>
      <DashboardPage title="Dashboard" subtitle="QA" showBreadcrumb={false}>
        <ComponentCard title="Reporting Filters" className="mb-3">
          <DashboardFilters
            selectedAcademicYear={selectedAcademicYear}
            academicYearOptions={academicYearOptions}
            selectedAcademicYearPreview={selectedAcademicYearPreview}
            hasAcademicYearFilter={hasAcademicYearFilter}
            onAcademicYearChange={setSelectedAcademicYear}
            onReset={() => setSelectedAcademicYear('')}
          />
        </ComponentCard>

        <Row className="g-3">
          <Col xl={4} md={6}>
            <DashboardChartCard
              title="Ideas by Department"
              chartKey={`ideas-department-${selectedAcademicYear || 'all'}-${ideasByDepartment.labels.join('|')}-${ideasByDepartment.values.join('|')}`}
              options={ideasByDepartmentOptions}
              series={ideasByDepartmentOptions.series ?? []}
              type="bar"
              hasData={ideasByDepartment.values.length > 0}
              emptyMessage={getChartEmptyMessage(
                ideasByDepartmentsQuery.isLoading,
                ideasByDepartmentsQuery.isError,
                ideasByDepartmentsQuery.error,
              )}
            />
          </Col>

          <Col xl={4} md={6}>
            <DashboardChartCard
              title="Ideas by Categories"
              chartKey={`ideas-categories-${selectedAcademicYear || 'all'}-${ideasByCategories.labels.join('|')}-${ideasByCategories.values.join('|')}`}
              options={ideasByCategoriesOptions}
              series={ideasByCategoriesOptions.series ?? []}
              type="bar"
              hasData={ideasByCategories.values.length > 0}
              emptyMessage={getChartEmptyMessage(
                ideasByCategoriesQuery.isLoading,
                ideasByCategoriesQuery.isError,
                ideasByCategoriesQuery.error,
              )}
            />
          </Col>

          <Col xl={4} md={12}>
            <DashboardChartCard
              title="Reports by Categories"
              chartKey={`reports-categories-${selectedAcademicYear || 'all'}-${reportsByCategories.labels.join('|')}-${reportsByCategories.values.join('|')}`}
              options={reportsByCategoriesOptions}
              series={reportsByCategoriesOptions.series ?? []}
              type="donut"
              hasData={reportsByCategories.values.length > 0}
              emptyMessage={getChartEmptyMessage(
                reportsByCategoriesQuery.isLoading,
                reportsByCategoriesQuery.isError,
                reportsByCategoriesQuery.error,
              )}
            />
          </Col>
        </Row>

        <Row className="g-3 mt-0">
          <Col xl={4} md={6}>
            <DashboardChartCard
              title="Users by Departments"
              chartKey={`users-department-${selectedAcademicYear || 'all'}-${usersByDepartments.labels.join('|')}-${usersByDepartments.values.join('|')}`}
              options={usersByDepartmentsOptions}
              series={usersByDepartmentsOptions.series ?? []}
              type="bar"
              hasData={usersByDepartments.values.length > 0}
              emptyMessage={getChartEmptyMessage(
                contributorsCountsQuery.isLoading,
                contributorsCountsQuery.isError,
                contributorsCountsQuery.error,
              )}
            />
          </Col>

          <Col xl={4} md={12}>
            <DashboardChartCard
              title="Idea and Comment Signals"
              chartKey={`idea-signals-${selectedAcademicYear || 'all'}-${ideaModerationSignals.join('|')}`}
              options={ideaModerationSignalsOptions}
              series={ideaModerationSignalsOptions.series ?? []}
              type="bar"
              hasData={
                !exceptionReportsQuery.isLoading &&
                !exceptionReportsQuery.isError
              }
              emptyMessage={getChartEmptyMessage(
                exceptionReportsQuery.isLoading,
                exceptionReportsQuery.isError,
                exceptionReportsQuery.error,
              )}
            />
          </Col>

          <Col xl={4} md={6}>
            <ComponentCard title="Most Popular Ideas (Comments + Likes)">
              <div
                style={{ minHeight: 330, maxHeight: 330, overflowY: 'auto' }}
              >
                {mostPopularIdeas.length ? (
                  <ul className="list-group list-group-flush">
                    {mostPopularIdeas.map((idea) => (
                      <li key={idea.id} className="list-group-item px-0">
                        <div className="d-flex justify-content-between align-items-start gap-2">
                          <div>
                            <p className="mb-1 text-body">{idea.content}</p>
                            <small className="text-muted">
                              Comments: {idea.comments} | Likes: {idea.likes}
                            </small>
                          </div>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => {
                              setSelectedPopularIdea(idea)
                              setShowIdeaDetailModal(true)
                            }}
                          >
                            Detail
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="h-100 d-flex align-items-center justify-content-center text-center">
                    <p className="text-muted mb-0">
                      {getChartEmptyMessage(
                        popularIdeasQuery.isLoading,
                        popularIdeasQuery.isError,
                        popularIdeasQuery.error,
                      )}
                    </p>
                  </div>
                )}
              </div>
            </ComponentCard>
          </Col>
        </Row>

        <Row className="g-3 mt-0">
          <Col xl={6} md={12}>
            <ComponentCard title="Most Viewed Pages">
              <div
                style={{ minHeight: 330, maxHeight: 330, overflowY: 'auto' }}
              >
                {mostViewedPagesRows.length ? (
                  <div className="d-flex flex-column gap-3">
                    {mostViewedPagesRows.map((row, index) => {
                      const percent = Math.round(
                        (row.views / maxMostViewedCount) * 100,
                      )
                      return (
                        <div key={`${row.label}-${index}`}>
                          <div className="d-flex justify-content-between align-items-start gap-2 mb-1">
                            <div
                              className="text-body text-break"
                              title={row.label}
                            >
                              <span className="badge bg-light text-dark me-2">
                                #{index + 1}
                              </span>
                              {row.label}
                            </div>
                            <small className="text-muted fw-semibold text-nowrap">
                              {row.views.toLocaleString()} views
                            </small>
                          </div>
                          <ProgressBar
                            now={percent}
                            variant="success"
                            style={{ height: 8 }}
                          />
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="h-100 d-flex align-items-center justify-content-center text-center">
                    <p className="text-muted mb-0">
                      {getChartEmptyMessage(
                        mostViewedPagesQuery.isLoading,
                        mostViewedPagesQuery.isError,
                        mostViewedPagesQuery.error,
                      )}
                    </p>
                  </div>
                )}
              </div>
            </ComponentCard>
          </Col>

          <Col xl={6} md={12}>
            <DashboardChartCard
              title="Most Active Users"
              chartKey={`most-active-users-${mostActiveUsers.labels.join('|')}-${mostActiveUsers.values.join('|')}`}
              options={mostActiveUsersOptions}
              series={mostActiveUsersOptions.series ?? []}
              type="bar"
              hasData={mostActiveUsers.values.length > 0}
              emptyMessage={getChartEmptyMessage(
                mostActiveUsersQuery.isLoading,
                mostActiveUsersQuery.isError,
                mostActiveUsersQuery.error,
              )}
            />
          </Col>
        </Row>

        <EntityDetailModal
          show={showIdeaDetailModal}
          title="Idea Details"
          onHide={() => {
            setShowIdeaDetailModal(false)
          }}
        >
          {selectedPopularIdea && (
            <DetailFieldList
              items={[
                { label: 'Title', value: selectedPopularIdea.title },
                { label: 'Content', value: selectedPopularIdea.content },
                {
                  label: 'Comments',
                  value: selectedPopularIdea.comments,
                },
                {
                  label: 'Likes',
                  value: selectedPopularIdea.likes,
                },
                {
                  label: 'Popularity Score',
                  value: selectedPopularIdea.score,
                },
                {
                  label: 'Anonymous',
                  value: selectedPopularIdea.isAnonymous ? 'Yes' : 'No',
                },
                {
                  label: 'Submitted',
                  value: selectedPopularIdea.createdAt.toLocaleDateString(),
                },
              ]}
            />
          )}
        </EntityDetailModal>
      </DashboardPage>
    </Container>
  )
}
