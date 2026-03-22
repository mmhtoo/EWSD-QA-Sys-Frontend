import { useMemo, useState } from 'react'
import { Col, Container, Row } from 'react-bootstrap'

import ComponentCard from '@/components/cards/ComponentCard'
import DashboardPage from '@/components/common/DashboardPage'

import {
  getIdeaModerationSignalsOptions,
  getIdeasByCategoryOptions,
  getIdeasByDepartmentOptions,
  getPopularIdeasOptions,
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
  getMostPopularIdeasSeries,
  getReportsByCategoriesSeries,
  getUsersByDepartmentsSeries,
  type DateRange,
} from './helpers'

export const DashboardHomePage = () => {
  const [dateRange, setDateRange] = useState<DateRange>([null, null])
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
      getMostPopularIdeasSeries(
        filteredIdeas,
        commentCountsByIdea,
        likeCountsByIdea,
      ),
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

  const mostPopularIdeasOptions = useMemo(
    () =>
      getPopularIdeasOptions(
        mostPopularIdeas.labels,
        mostPopularIdeas.commentValues,
        mostPopularIdeas.likeValues,
      ),
    [mostPopularIdeas],
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
            onStartDateChange={(startDate) => setDateRange([startDate, rangeEnd])}
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

          <Col xl={4} md={6}>
            <DashboardChartCard
              title="Most Popular Ideas (Comments + Likes)"
              chartKey={`popular-ideas-${mostPopularIdeas.labels.join('|')}-${mostPopularIdeas.commentValues.join('|')}-${mostPopularIdeas.likeValues.join('|')}`}
              options={mostPopularIdeasOptions}
              series={mostPopularIdeasOptions.series ?? []}
              type="bar"
              hasData={mostPopularIdeas.labels.length > 0}
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
        </Row>

        <small className="text-muted mt-3 d-inline-block">{selectedRangeLabel}</small>
      </DashboardPage>
    </Container>
  )
}
