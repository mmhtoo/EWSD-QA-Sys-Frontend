import { useMemo, useState } from 'react'
import { Button, Col, Container, Row } from 'react-bootstrap'

import ComponentCard from '@/components/cards/ComponentCard'
import DetailFieldList from '@/components/common/DetailFieldList'
import DashboardPage from '@/components/common/DashboardPage'
import EntityDetailModal from '@/components/common/EntityDetailModal'

import {
  getIdeaModerationSignalsOptions,
  getIdeasByCategoryOptions,
  getIdeasByDepartmentOptions,
  getReportsByCategoryOptions,
  getUsersByDepartmentOptions,
} from './chartOptions'
import DashboardChartCard from './components/DashboardChartCard'
import DashboardFilters from './components/DashboardFilters'
import {
  getCommentCountsByIdea,
  getFilteredComments,
  getFilteredIdeas,
  getFilteredReactions,
  getFilteredUsers,
  getIdeaModerationSignals,
  getLikeCountsByIdea,
  getUsersByDepartmentsSeries,
} from './helpers'
import {
  toAcademicYearPreviewLabel,
  useDashboardAcademicYearsQuery,
  useIdeasByCategoriesQuery,
  useIdeasByDepartmentsQuery,
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
  const [selectedPopularIdea, setSelectedPopularIdea] = useState<{
    id: number
    title: string
    content: string
    comments: number
    likes: number
    score: number
    isAnonymous: boolean
    createdAt: Date
  } | null>(null)

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

  const filteredIdeas = useMemo(() => getFilteredIdeas(null, null), [])

  const filteredUsers = useMemo(() => getFilteredUsers(null, null), [])

  const filteredComments = useMemo(() => getFilteredComments(null, null), [])

  const filteredReactions = useMemo(() => getFilteredReactions(null, null), [])

  const ideasByDepartment = ideasByDepartmentsQuery.data ?? EMPTY_CHART_DATA
  const ideasByCategories = ideasByCategoriesQuery.data ?? EMPTY_CHART_DATA
  const reportsByCategories = reportsByCategoriesQuery.data ?? EMPTY_CHART_DATA

  const usersByDepartments = useMemo(
    () => getUsersByDepartmentsSeries(filteredUsers),
    [filteredUsers],
  )

  const commentCountsByIdea = useMemo(
    () => getCommentCountsByIdea(filteredComments),
    [filteredComments],
  )

  const likeCountsByIdea = useMemo(
    () => getLikeCountsByIdea(filteredReactions),
    [filteredReactions],
  )

  const mostPopularIdeas = useMemo(
    () =>
      filteredIdeas
        .map((idea) => {
          const ideaId = Number(idea.id)
          const comments = commentCountsByIdea.get(ideaId) ?? 0
          const likes = likeCountsByIdea.get(ideaId) ?? 0

          return {
            id: ideaId,
            title: idea.title,
            content: idea.content,
            comments,
            likes,
            score: comments + likes,
            isAnonymous: idea.is_anonymous,
            createdAt: idea.created_at,
          }
        })
        .sort(
          (left, right) =>
            right.score - left.score ||
            left.content.localeCompare(right.content),
        )
        .slice(0, 6),
    [filteredIdeas, commentCountsByIdea, likeCountsByIdea],
  )

  const ideaModerationSignals = useMemo(
    () =>
      getIdeaModerationSignals(
        filteredIdeas,
        filteredComments,
        commentCountsByIdea,
      ),
    [filteredIdeas, filteredComments, commentCountsByIdea],
  )

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

  const ideaModerationSignalsOptions = useMemo(
    () => getIdeaModerationSignalsOptions(ideaModerationSignals),
    [ideaModerationSignals],
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
              chartKey={`users-department-${usersByDepartments.labels.join('|')}-${usersByDepartments.values.join('|')}`}
              options={usersByDepartmentsOptions}
              series={usersByDepartmentsOptions.series ?? []}
              type="bar"
              hasData={usersByDepartments.values.length > 0}
            />
          </Col>

          <Col xl={4} md={12}>
            <DashboardChartCard
              title="Idea and Comment Signals"
              chartKey={`idea-signals-${ideaModerationSignals.join('|')}`}
              options={ideaModerationSignalsOptions}
              series={ideaModerationSignalsOptions.series ?? []}
              type="bar"
              hasData
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
                      No data available for selected filters.
                    </p>
                  </div>
                )}
              </div>
            </ComponentCard>
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
