import type { Comment, Idea, Reaction, Report, User } from '@/types/entity'
import {
  ideaCategoryIdsByIdeaId,
  ideaCategoryNameById,
  MOCK_COMMENTS,
  MOCK_IDEAS,
  MOCK_REACTIONS,
  MOCK_REPORTS,
  MOCK_USERS,
  reportCategoryIdsByReportId,
  reportCategoryNameById,
  userById,
  departmentNameById,
} from './data/mockData'

export type DateRange = [Date | null, Date | null]

export type CountSeries = {
  labels: string[]
  values: number[]
}

export type PopularIdeasSeries = {
  labels: string[]
  commentValues: number[]
  likeValues: number[]
}

export const toIdeaLabel = (title: string): string =>
  title.length > 24 ? `${title.slice(0, 21)}...` : title

export const startOfDay = (value: Date): number => {
  const date = new Date(value)
  date.setHours(0, 0, 0, 0)
  return date.getTime()
}

export const endOfDay = (value: Date): number => {
  const date = new Date(value)
  date.setHours(23, 59, 59, 999)
  return date.getTime()
}

export const formatDateLabel = (value: Date): string =>
  value.toLocaleDateString()

export const toSortedSeries = (counts: Map<string, number>): CountSeries => {
  const points = Array.from(counts.entries())
    .map(([label, value]) => ({ label, value }))
    .sort(
      (left, right) =>
        right.value - left.value || left.label.localeCompare(right.label),
    )

  return {
    labels: points.map((point) => point.label),
    values: points.map((point) => point.value),
  }
}

export const filterByDateRange = <T extends { created_at: Date }>(
  rows: T[],
  rangeStart: Date | null,
  rangeEnd: Date | null,
): T[] => {
  const start = rangeStart ? startOfDay(rangeStart) : null
  const end = rangeEnd ? endOfDay(rangeEnd) : null

  return rows.filter((row) => {
    const createdAt = row.created_at.getTime()
    if (start !== null && createdAt < start) return false
    if (end !== null && createdAt > end) return false
    return true
  })
}

export const getFilteredIdeas = (
  rangeStart: Date | null,
  rangeEnd: Date | null,
): Idea[] => filterByDateRange(MOCK_IDEAS, rangeStart, rangeEnd)

export const getFilteredUsers = (
  rangeStart: Date | null,
  rangeEnd: Date | null,
): User[] => filterByDateRange(MOCK_USERS, rangeStart, rangeEnd)

export const getFilteredComments = (
  rangeStart: Date | null,
  rangeEnd: Date | null,
): Comment[] => filterByDateRange(MOCK_COMMENTS, rangeStart, rangeEnd)

export const getFilteredReactions = (
  rangeStart: Date | null,
  rangeEnd: Date | null,
): Reaction[] => filterByDateRange(MOCK_REACTIONS, rangeStart, rangeEnd)

export const getFilteredReports = (
  rangeStart: Date | null,
  rangeEnd: Date | null,
): Report[] => filterByDateRange(MOCK_REPORTS, rangeStart, rangeEnd)

export const getIdeasByDepartmentSeries = (ideas: Idea[]): CountSeries => {
  const counts = new Map<string, number>()

  ideas.forEach((idea) => {
    const user = userById.get(idea.user_id)
    const departmentName = user
      ? (departmentNameById.get(user.department_id) ?? 'Unknown Department')
      : 'Unknown Department'

    counts.set(departmentName, (counts.get(departmentName) ?? 0) + 1)
  })

  return toSortedSeries(counts)
}

export const getIdeasByCategoriesSeries = (ideas: Idea[]): CountSeries => {
  const counts = new Map<string, number>()

  ideas.forEach((idea) => {
    const categoryIds = new Set(
      ideaCategoryIdsByIdeaId.get(Number(idea.id)) ?? [],
    )

    categoryIds.forEach((categoryId) => {
      const categoryName =
        ideaCategoryNameById.get(categoryId) ?? 'Uncategorized'
      counts.set(categoryName, (counts.get(categoryName) ?? 0) + 1)
    })
  })

  return toSortedSeries(counts)
}

export const getReportsByCategoriesSeries = (
  reports: Report[],
): CountSeries => {
  const counts = new Map<string, number>()

  reports.forEach((report) => {
    const categoryIds = new Set(
      reportCategoryIdsByReportId.get(Number(report.id)) ?? [],
    )

    categoryIds.forEach((categoryId) => {
      const categoryName =
        reportCategoryNameById.get(categoryId) ?? 'Uncategorized'
      counts.set(categoryName, (counts.get(categoryName) ?? 0) + 1)
    })
  })

  return toSortedSeries(counts)
}

export const getUsersByDepartmentsSeries = (users: User[]): CountSeries => {
  const counts = new Map<string, number>()

  users.forEach((user) => {
    const departmentName =
      departmentNameById.get(Number(user.department_id)) ?? 'Unknown Department'
    counts.set(departmentName, (counts.get(departmentName) ?? 0) + 1)
  })

  return toSortedSeries(counts)
}

export const getCommentCountsByIdea = (
  comments: Comment[],
): Map<number, number> => {
  const counts = new Map<number, number>()
  comments.forEach((comment) => {
    counts.set(comment.idea_id, (counts.get(comment.idea_id) ?? 0) + 1)
  })
  return counts
}

export const getLikeCountsByIdea = (
  reactions: Reaction[],
): Map<number, number> => {
  const counts = new Map<number, number>()
  reactions.forEach((reaction) => {
    if (reaction.reaction_type !== 'upvote') return
    counts.set(reaction.idea_id, (counts.get(reaction.idea_id) ?? 0) + 1)
  })
  return counts
}

export const getMostPopularIdeasSeries = (
  ideas: Idea[],
  commentCountsByIdea: Map<number, number>,
  likeCountsByIdea: Map<number, number>,
): PopularIdeasSeries => {
  const topIdeas = ideas
    .map((idea) => {
      const ideaId = Number(idea.id)
      const comments = commentCountsByIdea.get(ideaId) ?? 0
      const likes = likeCountsByIdea.get(ideaId) ?? 0
      return {
        label: toIdeaLabel(idea.title),
        comments,
        likes,
        score: comments + likes,
      }
    })
    .sort(
      (left, right) =>
        right.score - left.score || left.label.localeCompare(right.label),
    )
    .slice(0, 6)

  return {
    labels: topIdeas.map((item) => item.label),
    commentValues: topIdeas.map((item) => item.comments),
    likeValues: topIdeas.map((item) => item.likes),
  }
}

export const getIdeaModerationSignals = (
  ideas: Idea[],
  comments: Comment[],
  commentCountsByIdea: Map<number, number>,
): number[] => {
  const ideasWithoutComments = ideas.filter(
    (idea) => (commentCountsByIdea.get(Number(idea.id)) ?? 0) === 0,
  ).length

  const ideasAnonymous = ideas.filter((idea) => idea.is_anonymous).length

  const commentsAnonymous = comments.filter(
    (comment) => comment.is_anonymous,
  ).length

  return [ideasWithoutComments, ideasAnonymous, commentsAnonymous]
}
