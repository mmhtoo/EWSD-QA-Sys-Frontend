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
  formatDateLabel,
  getCommentCountsByIdea,
  getFilteredComments,
  getFilteredIdeas,
  getFilteredReactions,
  getFilteredReports,
  getFilteredUsers,
  getIdeaModerationSignals,
  getIdeasByCategoriesSeries,
  getIdeasByDepartmentSeries,
  getLikeCountsByIdea,
  getReportsByCategoriesSeries,
  getUsersByDepartmentsSeries,
  type DateRange,
} from './helpers'

export const DashboardHomePage = () => {
  const [dateRange, setDateRange] = useState<DateRange>([null, null])
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
  const [rangeStart, rangeEnd] = dateRange

  const filteredIdeas = useMemo(
    () => getFilteredIdeas(rangeStart, rangeEnd),
    [rangeStart, rangeEnd],
  )

  const filteredUsers = useMemo(
    () => getFilteredUsers(rangeStart, rangeEnd),
    [rangeStart, rangeEnd],
  )

  const filteredComments = useMemo(
    () => getFilteredComments(rangeStart, rangeEnd),
    [rangeStart, rangeEnd],
  )

  const filteredReactions = useMemo(
    () => getFilteredReactions(rangeStart, rangeEnd),
    [rangeStart, rangeEnd],
  )

  const filteredReports = useMemo(
    () => getFilteredReports(rangeStart, rangeEnd),
    [rangeStart, rangeEnd],
  )

  const ideasByDepartment = useMemo(
    () => getIdeasByDepartmentSeries(filteredIdeas),
    [filteredIdeas],
  )

  const ideasByCategories = useMemo(
    () => getIdeasByCategoriesSeries(filteredIdeas),
    [filteredIdeas],
  )

  const reportsByCategories = useMemo(
    () => getReportsByCategoriesSeries(filteredReports),
    [filteredReports],
  )

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

  const selectedRangeLabel = useMemo(() => {
    if (!rangeStart && !rangeEnd) return 'Showing all dates'
    if (rangeStart && rangeEnd) {
      return `${formatDateLabel(rangeStart)} - ${formatDateLabel(rangeEnd)}`
    }
    if (rangeStart) return `From ${formatDateLabel(rangeStart)}`
    return `Until ${formatDateLabel(rangeEnd as Date)}`
  }, [rangeStart, rangeEnd])

  const hasDateFilter = Boolean(rangeStart || rangeEnd)

  return (
    <Container fluid>
      <DashboardPage title="Dashboard" subtitle="QA" showBreadcrumb={false}>
        <ComponentCard title="Reporting Filters" className="mb-3">
          <DashboardFilters
            startDate={rangeStart}
            endDate={rangeEnd}
            hasDateFilter={hasDateFilter}
            onStartDateChange={(startDate) =>
              setDateRange([startDate, rangeEnd])
            }
            onEndDateChange={(endDate) => setDateRange([rangeStart, endDate])}
            onReset={() => setDateRange([null, null])}
          />
        </ComponentCard>

        <Row className="g-3">
          <Col xl={4} md={6}>
            <DashboardChartCard
              title="Ideas by Department"
              chartKey={`ideas-department-${ideasByDepartment.labels.join('|')}-${ideasByDepartment.values.join('|')}`}
              options={ideasByDepartmentOptions}
              series={ideasByDepartmentOptions.series ?? []}
              type="bar"
              hasData={ideasByDepartment.values.length > 0}
            />
          </Col>

          <Col xl={4} md={6}>
            <DashboardChartCard
              title="Ideas by Categories"
              chartKey={`ideas-categories-${ideasByCategories.labels.join('|')}-${ideasByCategories.values.join('|')}`}
              options={ideasByCategoriesOptions}
              series={ideasByCategoriesOptions.series ?? []}
              type="bar"
              hasData={ideasByCategories.values.length > 0}
            />
          </Col>

          <Col xl={4} md={12}>
            <DashboardChartCard
              title="Reports by Categories"
              chartKey={`reports-categories-${reportsByCategories.labels.join('|')}-${reportsByCategories.values.join('|')}`}
              options={reportsByCategoriesOptions}
              series={reportsByCategoriesOptions.series ?? []}
              type="donut"
              hasData={reportsByCategories.values.length > 0}
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
                      No data available for selected date range.
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

        <small className="text-muted mt-3 d-inline-block">
          {selectedRangeLabel}
        </small>
      </DashboardPage>
    </Container>
  )
}
