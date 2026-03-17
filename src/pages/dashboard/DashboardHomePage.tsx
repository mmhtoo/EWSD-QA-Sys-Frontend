import { useMemo, useState } from 'react'
import { Button, Col, Container, FormLabel, Row } from 'react-bootstrap'
import Flatpickr from 'react-flatpickr'
import type { ApexOptions } from 'apexcharts'

import ComponentCard from '@/components/cards/ComponentCard'
import CustomApexChart from '@/components/CustomApexChart.tsx'
import DashboardPage from '@/components/common/DashboardPage'
import { getColor } from '@/helpers/color'
import type {
  Comment,
  Department,
  Idea,
  IdeaCategory,
  IdeaHasCategory,
  Reaction,
  Report,
  ReportCategory,
  ReportHasCategory,
  User,
} from '@/types/entity'

type DateRange = [Date | null, Date | null]

type CountSeries = {
  labels: string[]
  values: number[]
}

type PopularIdeasSeries = {
  labels: string[]
  commentValues: number[]
  likeValues: number[]
}

const MOCK_DEPARTMENTS: Department[] = [
  {
    id: 1,
    name: 'Computer Science',
    description: 'School of Computer Science',
    created_at: new Date('2025-09-01'),
  },
  {
    id: 2,
    name: 'Business School',
    description: 'School of Business',
    created_at: new Date('2025-09-01'),
  },
  {
    id: 3,
    name: 'Engineering',
    description: 'School of Engineering',
    created_at: new Date('2025-09-01'),
  },
  {
    id: 4,
    name: 'Student Affairs',
    description: 'Student support and services',
    created_at: new Date('2025-09-01'),
  },
]

const MOCK_USERS: User[] = [
  {
    id: 11,
    role_id: 1,
    department_id: 1,
    name: 'Aye Chan',
    email: 'aye.chan@example.edu',
    password_hash: 'hashed',
    created_at: new Date('2026-01-02'),
  },
  {
    id: 12,
    role_id: 1,
    department_id: 1,
    name: 'Ko Min',
    email: 'ko.min@example.edu',
    password_hash: 'hashed',
    created_at: new Date('2026-01-04'),
  },
  {
    id: 21,
    role_id: 1,
    department_id: 2,
    name: 'Su Kyi',
    email: 'su.kyi@example.edu',
    password_hash: 'hashed',
    created_at: new Date('2026-01-09'),
  },
  {
    id: 22,
    role_id: 1,
    department_id: 2,
    name: 'Nyi Nyi',
    email: 'nyi.nyi@example.edu',
    password_hash: 'hashed',
    created_at: new Date('2026-01-15'),
  },
  {
    id: 31,
    role_id: 1,
    department_id: 3,
    name: 'Aung Phyo',
    email: 'aung.phyo@example.edu',
    password_hash: 'hashed',
    created_at: new Date('2026-02-01'),
  },
  {
    id: 32,
    role_id: 1,
    department_id: 3,
    name: 'Thiri Win',
    email: 'thiri.win@example.edu',
    password_hash: 'hashed',
    created_at: new Date('2026-02-10'),
  },
  {
    id: 41,
    role_id: 1,
    department_id: 4,
    name: 'May Zin',
    email: 'may.zin@example.edu',
    password_hash: 'hashed',
    created_at: new Date('2026-02-16'),
  },
  {
    id: 42,
    role_id: 1,
    department_id: 4,
    name: 'Kyaw Thu',
    email: 'kyaw.thu@example.edu',
    password_hash: 'hashed',
    created_at: new Date('2026-03-05'),
  },
]

const MOCK_IDEA_CATEGORIES: IdeaCategory[] = [
  {
    id: 1,
    name: 'Teaching & Learning',
    description: 'Lecture and classroom improvements',
    created_at: new Date('2025-09-01'),
  },
  {
    id: 2,
    name: 'Campus Services',
    description: 'Facilities and service quality',
    created_at: new Date('2025-09-01'),
  },
  {
    id: 3,
    name: 'Student Experience',
    description: 'Student life and wellbeing',
    created_at: new Date('2025-09-01'),
  },
  {
    id: 4,
    name: 'Research & Innovation',
    description: 'Research and innovation ideas',
    created_at: new Date('2025-09-01'),
  },
  {
    id: 5,
    name: 'Staff Welfare',
    description: 'Staff support and work culture',
    created_at: new Date('2025-09-01'),
  },
]

const MOCK_IDEAS: Idea[] = [
  {
    id: 501,
    user_id: 11,
    academic_year_id: 1,
    title: 'Peer-led coding lab sessions',
    content: 'Run weekly peer-assisted coding labs for first-year students.',
    is_anonymous: false,
    created_at: new Date('2026-01-05'),
  },
  {
    id: 502,
    user_id: 12,
    academic_year_id: 1,
    title: 'Add lecture recap videos',
    content: 'Provide short recap videos for every major lecture topic.',
    is_anonymous: true,
    created_at: new Date('2026-01-12'),
  },
  {
    id: 503,
    user_id: 21,
    academic_year_id: 1,
    title: 'Queue display for admin office',
    content: 'Install a queue display to reduce waiting confusion.',
    is_anonymous: false,
    created_at: new Date('2026-01-20'),
  },
  {
    id: 504,
    user_id: 22,
    academic_year_id: 1,
    title: 'Mentorship coffee sessions',
    content: 'Set up monthly mentor sessions for new staff and students.',
    is_anonymous: false,
    created_at: new Date('2026-02-02'),
  },
  {
    id: 505,
    user_id: 31,
    academic_year_id: 1,
    title: 'Prototype mini grant program',
    content: 'Offer seed grants for cross-department prototypes.',
    is_anonymous: false,
    created_at: new Date('2026-02-10'),
  },
  {
    id: 506,
    user_id: 32,
    academic_year_id: 1,
    title: 'Smart maintenance ticketing',
    content: 'Prioritize maintenance tickets by urgency and impact.',
    is_anonymous: true,
    created_at: new Date('2026-02-18'),
  },
  {
    id: 507,
    user_id: 41,
    academic_year_id: 1,
    title: 'Monthly wellness circles',
    content: 'Host wellness circles with counselors and peer mentors.',
    is_anonymous: false,
    created_at: new Date('2026-02-25'),
  },
  {
    id: 508,
    user_id: 42,
    academic_year_id: 1,
    title: 'Longer library service hours',
    content: 'Extend library support hours during exam weeks.',
    is_anonymous: false,
    created_at: new Date('2026-03-03'),
  },
  {
    id: 509,
    user_id: 11,
    academic_year_id: 1,
    title: 'Teaching peer review circles',
    content: 'Create peer circles to improve lesson delivery quality.',
    is_anonymous: true,
    created_at: new Date('2026-03-07'),
  },
  {
    id: 510,
    user_id: 21,
    academic_year_id: 1,
    title: 'Student service chatbot',
    content: 'Deploy chatbot for common student service questions.',
    is_anonymous: false,
    created_at: new Date('2026-03-10'),
  },
  {
    id: 511,
    user_id: 31,
    academic_year_id: 1,
    title: 'Industry research showcase',
    content: 'Quarterly showcase for applied industry research projects.',
    is_anonymous: false,
    created_at: new Date('2026-03-12'),
  },
  {
    id: 512,
    user_id: 42,
    academic_year_id: 1,
    title: 'Orientation support volunteers',
    content: 'Recruit volunteers for first-week orientation support desks.',
    is_anonymous: false,
    created_at: new Date('2026-03-15'),
  },
]

const MOCK_COMMENTS: Comment[] = [
  {
    id: 8001,
    user_id: 21,
    idea_id: 501,
    content: 'This would really help first-year onboarding.',
    is_anonymous: false,
    created_at: new Date('2026-01-08'),
  },
  {
    id: 8002,
    user_id: 22,
    idea_id: 501,
    content: 'Please include peer mentor training too.',
    is_anonymous: true,
    created_at: new Date('2026-01-09'),
  },
  {
    id: 8003,
    user_id: 31,
    idea_id: 503,
    content: 'Could we also notify queue status by mobile?',
    is_anonymous: false,
    created_at: new Date('2026-01-24'),
  },
  {
    id: 8004,
    user_id: 41,
    idea_id: 504,
    content: 'Monthly sessions are enough for start.',
    is_anonymous: false,
    created_at: new Date('2026-02-05'),
  },
  {
    id: 8005,
    user_id: 42,
    idea_id: 505,
    content: 'Great chance to support interdisciplinary projects.',
    is_anonymous: false,
    created_at: new Date('2026-02-12'),
  },
  {
    id: 8006,
    user_id: 12,
    idea_id: 506,
    content: 'Urgency tags will make maintenance clearer.',
    is_anonymous: true,
    created_at: new Date('2026-02-20'),
  },
  {
    id: 8007,
    user_id: 32,
    idea_id: 507,
    content: 'Can we provide a hybrid online option?',
    is_anonymous: false,
    created_at: new Date('2026-02-26'),
  },
  {
    id: 8008,
    user_id: 11,
    idea_id: 508,
    content: 'Extended hours are crucial during finals.',
    is_anonymous: false,
    created_at: new Date('2026-03-03'),
  },
  {
    id: 8009,
    user_id: 22,
    idea_id: 509,
    content: 'Peer circles should include observation checklist.',
    is_anonymous: true,
    created_at: new Date('2026-03-08'),
  },
  {
    id: 8010,
    user_id: 31,
    idea_id: 510,
    content: 'Bot can reduce routine office workload.',
    is_anonymous: false,
    created_at: new Date('2026-03-11'),
  },
  {
    id: 8011,
    user_id: 41,
    idea_id: 511,
    content: 'Let students join the showcase as assistants.',
    is_anonymous: false,
    created_at: new Date('2026-03-13'),
  },
  {
    id: 8012,
    user_id: 12,
    idea_id: 511,
    content: 'Could be linked with internship partners.',
    is_anonymous: true,
    created_at: new Date('2026-03-14'),
  },
]

const MOCK_REACTIONS: Reaction[] = [
  {
    id: 9001,
    user_id: 21,
    idea_id: 501,
    reaction_type: 'upvote',
    created_at: new Date('2026-01-06'),
  },
  {
    id: 9002,
    user_id: 22,
    idea_id: 501,
    reaction_type: 'upvote',
    created_at: new Date('2026-01-07'),
  },
  {
    id: 9003,
    user_id: 31,
    idea_id: 501,
    reaction_type: 'upvote',
    created_at: new Date('2026-01-08'),
  },
  {
    id: 9004,
    user_id: 32,
    idea_id: 502,
    reaction_type: 'upvote',
    created_at: new Date('2026-01-13'),
  },
  {
    id: 9005,
    user_id: 41,
    idea_id: 503,
    reaction_type: 'upvote',
    created_at: new Date('2026-01-21'),
  },
  {
    id: 9006,
    user_id: 42,
    idea_id: 503,
    reaction_type: 'downvote',
    created_at: new Date('2026-01-22'),
  },
  {
    id: 9007,
    user_id: 11,
    idea_id: 504,
    reaction_type: 'upvote',
    created_at: new Date('2026-02-03'),
  },
  {
    id: 9008,
    user_id: 12,
    idea_id: 504,
    reaction_type: 'upvote',
    created_at: new Date('2026-02-04'),
  },
  {
    id: 9009,
    user_id: 21,
    idea_id: 505,
    reaction_type: 'upvote',
    created_at: new Date('2026-02-11'),
  },
  {
    id: 9010,
    user_id: 22,
    idea_id: 505,
    reaction_type: 'upvote',
    created_at: new Date('2026-02-12'),
  },
  {
    id: 9011,
    user_id: 31,
    idea_id: 506,
    reaction_type: 'downvote',
    created_at: new Date('2026-02-19'),
  },
  {
    id: 9012,
    user_id: 32,
    idea_id: 507,
    reaction_type: 'upvote',
    created_at: new Date('2026-02-26'),
  },
  {
    id: 9013,
    user_id: 41,
    idea_id: 508,
    reaction_type: 'upvote',
    created_at: new Date('2026-03-04'),
  },
  {
    id: 9014,
    user_id: 42,
    idea_id: 508,
    reaction_type: 'upvote',
    created_at: new Date('2026-03-05'),
  },
  {
    id: 9015,
    user_id: 11,
    idea_id: 509,
    reaction_type: 'upvote',
    created_at: new Date('2026-03-08'),
  },
  {
    id: 9016,
    user_id: 12,
    idea_id: 510,
    reaction_type: 'upvote',
    created_at: new Date('2026-03-11'),
  },
  {
    id: 9017,
    user_id: 21,
    idea_id: 511,
    reaction_type: 'upvote',
    created_at: new Date('2026-03-13'),
  },
  {
    id: 9018,
    user_id: 22,
    idea_id: 511,
    reaction_type: 'upvote',
    created_at: new Date('2026-03-14'),
  },
]

const MOCK_IDEA_HAS_CATEGORIES: IdeaHasCategory[] = [
  {
    id: 1,
    idea_id: 501,
    idea_category_id: 1,
    created_at: new Date('2026-01-05'),
  },
  {
    id: 2,
    idea_id: 501,
    idea_category_id: 4,
    created_at: new Date('2026-01-05'),
  },
  {
    id: 3,
    idea_id: 502,
    idea_category_id: 1,
    created_at: new Date('2026-01-12'),
  },
  {
    id: 4,
    idea_id: 503,
    idea_category_id: 2,
    created_at: new Date('2026-01-20'),
  },
  {
    id: 5,
    idea_id: 504,
    idea_category_id: 3,
    created_at: new Date('2026-02-02'),
  },
  {
    id: 6,
    idea_id: 504,
    idea_category_id: 5,
    created_at: new Date('2026-02-02'),
  },
  {
    id: 7,
    idea_id: 505,
    idea_category_id: 4,
    created_at: new Date('2026-02-10'),
  },
  {
    id: 8,
    idea_id: 506,
    idea_category_id: 2,
    created_at: new Date('2026-02-18'),
  },
  {
    id: 9,
    idea_id: 506,
    idea_category_id: 4,
    created_at: new Date('2026-02-18'),
  },
  {
    id: 10,
    idea_id: 507,
    idea_category_id: 3,
    created_at: new Date('2026-02-25'),
  },
  {
    id: 11,
    idea_id: 508,
    idea_category_id: 2,
    created_at: new Date('2026-03-03'),
  },
  {
    id: 12,
    idea_id: 508,
    idea_category_id: 3,
    created_at: new Date('2026-03-03'),
  },
  {
    id: 13,
    idea_id: 509,
    idea_category_id: 1,
    created_at: new Date('2026-03-07'),
  },
  {
    id: 14,
    idea_id: 509,
    idea_category_id: 5,
    created_at: new Date('2026-03-07'),
  },
  {
    id: 15,
    idea_id: 510,
    idea_category_id: 2,
    created_at: new Date('2026-03-10'),
  },
  {
    id: 16,
    idea_id: 511,
    idea_category_id: 1,
    created_at: new Date('2026-03-12'),
  },
  {
    id: 17,
    idea_id: 511,
    idea_category_id: 4,
    created_at: new Date('2026-03-12'),
  },
  {
    id: 18,
    idea_id: 512,
    idea_category_id: 3,
    created_at: new Date('2026-03-15'),
  },
]

const MOCK_REPORT_CATEGORIES: ReportCategory[] = [
  {
    id: 1,
    name: 'Spam',
    description: 'Repeated irrelevant content',
    created_at: new Date('2025-09-01'),
  },
  {
    id: 2,
    name: 'Harassment',
    description: 'Abusive or harassing behavior',
    created_at: new Date('2025-09-01'),
  },
  {
    id: 3,
    name: 'Inappropriate Language',
    description: 'Offensive or unacceptable wording',
    created_at: new Date('2025-09-01'),
  },
  {
    id: 4,
    name: 'Data Privacy',
    description: 'Potential personal data leakage',
    created_at: new Date('2025-09-01'),
  },
  {
    id: 5,
    name: 'Misinformation',
    description: 'False or misleading information',
    created_at: new Date('2025-09-01'),
  },
]

const MOCK_REPORTS: Report[] = [
  {
    id: 701,
    user_id: 22,
    target_id: 501,
    target_type: 'idea',
    reason_details: 'Contains personal details.',
    status: 'pending',
    created_at: new Date('2026-02-01'),
  },
  {
    id: 702,
    user_id: 31,
    target_id: 9001,
    target_type: 'comment',
    reason_details: 'Looks like repeated ad links.',
    status: 'resolved',
    created_at: new Date('2026-02-06'),
  },
  {
    id: 703,
    user_id: 42,
    target_id: 503,
    target_type: 'idea',
    reason_details: 'Aggressive wording in message.',
    status: 'pending',
    created_at: new Date('2026-02-11'),
  },
  {
    id: 704,
    user_id: 12,
    target_id: 510,
    target_type: 'idea',
    reason_details: 'Unverified information shared as fact.',
    status: 'dismissed',
    created_at: new Date('2026-02-19'),
  },
  {
    id: 705,
    user_id: 21,
    target_id: 9010,
    target_type: 'comment',
    reason_details: 'Repeated promotional content.',
    status: 'resolved',
    created_at: new Date('2026-03-01'),
  },
  {
    id: 706,
    user_id: 32,
    target_id: 42,
    target_type: 'user',
    reason_details: 'Targeted harassing messages.',
    status: 'pending',
    created_at: new Date('2026-03-05'),
  },
  {
    id: 707,
    user_id: 41,
    target_id: 9022,
    target_type: 'comment',
    reason_details: 'Hostile and inappropriate language.',
    status: 'pending',
    created_at: new Date('2026-03-09'),
  },
  {
    id: 708,
    user_id: 11,
    target_id: 507,
    target_type: 'idea',
    reason_details: 'Sensitive personal information disclosed.',
    status: 'resolved',
    created_at: new Date('2026-03-13'),
  },
  {
    id: 709,
    user_id: 22,
    target_id: 9033,
    target_type: 'comment',
    reason_details: 'Misleading statements with offensive tone.',
    status: 'dismissed',
    created_at: new Date('2026-03-16'),
  },
]

const MOCK_REPORT_HAS_CATEGORIES: ReportHasCategory[] = [
  {
    id: 1,
    report_id: 701,
    report_category_id: 4,
    created_at: new Date('2026-02-01'),
  },
  {
    id: 2,
    report_id: 702,
    report_category_id: 1,
    created_at: new Date('2026-02-06'),
  },
  {
    id: 3,
    report_id: 703,
    report_category_id: 2,
    created_at: new Date('2026-02-11'),
  },
  {
    id: 4,
    report_id: 703,
    report_category_id: 3,
    created_at: new Date('2026-02-11'),
  },
  {
    id: 5,
    report_id: 704,
    report_category_id: 5,
    created_at: new Date('2026-02-19'),
  },
  {
    id: 6,
    report_id: 705,
    report_category_id: 1,
    created_at: new Date('2026-03-01'),
  },
  {
    id: 7,
    report_id: 706,
    report_category_id: 2,
    created_at: new Date('2026-03-05'),
  },
  {
    id: 8,
    report_id: 707,
    report_category_id: 3,
    created_at: new Date('2026-03-09'),
  },
  {
    id: 9,
    report_id: 708,
    report_category_id: 4,
    created_at: new Date('2026-03-13'),
  },
  {
    id: 10,
    report_id: 708,
    report_category_id: 5,
    created_at: new Date('2026-03-13'),
  },
  {
    id: 11,
    report_id: 709,
    report_category_id: 1,
    created_at: new Date('2026-03-16'),
  },
  {
    id: 12,
    report_id: 709,
    report_category_id: 3,
    created_at: new Date('2026-03-16'),
  },
]

const userById = new Map<number, User>(
  MOCK_USERS.map((user) => [Number(user.id), user]),
)

const departmentNameById = new Map<number, string>(
  MOCK_DEPARTMENTS.map((department) => [
    Number(department.id),
    department.name,
  ]),
)

const ideaCategoryNameById = new Map<number, string>(
  MOCK_IDEA_CATEGORIES.map((category) => [Number(category.id), category.name]),
)

const reportCategoryNameById = new Map<number, string>(
  MOCK_REPORT_CATEGORIES.map((category) => [
    Number(category.id),
    category.name,
  ]),
)

const ideaCategoryIdsByIdeaId = MOCK_IDEA_HAS_CATEGORIES.reduce((acc, item) => {
  const current = acc.get(item.idea_id) ?? []
  current.push(item.idea_category_id)
  acc.set(item.idea_id, current)
  return acc
}, new Map<number, number[]>())

const reportCategoryIdsByReportId = MOCK_REPORT_HAS_CATEGORIES.reduce(
  (acc, item) => {
    const current = acc.get(item.report_id) ?? []
    current.push(item.report_category_id)
    acc.set(item.report_id, current)
    return acc
  },
  new Map<number, number[]>(),
)

const toIdeaLabel = (title: string): string =>
  title.length > 24 ? `${title.slice(0, 21)}...` : title

const startOfDay = (value: Date): number => {
  const date = new Date(value)
  date.setHours(0, 0, 0, 0)
  return date.getTime()
}

const endOfDay = (value: Date): number => {
  const date = new Date(value)
  date.setHours(23, 59, 59, 999)
  return date.getTime()
}

const toSortedSeries = (counts: Map<string, number>): CountSeries => {
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

const getIdeasByDepartmentOptions = (
  labels: string[],
  values: number[],
): ApexOptions => ({
  chart: {
    type: 'bar',
    height: 320,
    toolbar: { show: false },
  },
  plotOptions: {
    bar: {
      horizontal: true,
      borderRadius: 6,
      borderRadiusApplication: 'end',
    },
  },
  dataLabels: {
    enabled: false,
  },
  colors: [getColor('primary')],
  series: [{ name: 'Ideas', data: values }],
  xaxis: {
    categories: labels,
    axisBorder: { show: false },
  },
  grid: {
    borderColor: getColor('border-color'),
  },
  tooltip: {
    y: {
      formatter: (value) => `${value} ideas`,
    },
  },
})

const getIdeasByCategoryOptions = (
  labels: string[],
  values: number[],
): ApexOptions => ({
  chart: {
    type: 'bar',
    height: 320,
    toolbar: { show: false },
  },
  plotOptions: {
    bar: {
      horizontal: false,
      borderRadius: 6,
      columnWidth: '48%',
    },
  },
  dataLabels: {
    enabled: false,
  },
  colors: [getColor('secondary')],
  series: [{ name: 'Ideas', data: values }],
  xaxis: {
    categories: labels,
    axisBorder: { show: false },
    labels: {
      rotate: -20,
      trim: true,
    },
  },
  grid: {
    borderColor: getColor('border-color'),
  },
  tooltip: {
    y: {
      formatter: (value) => `${value} ideas`,
    },
  },
})

const getReportsByCategoryOptions = (
  labels: string[],
  values: number[],
): ApexOptions => ({
  chart: {
    type: 'donut',
    height: 320,
    toolbar: { show: false },
  },
  labels,
  series: values,
  colors: [
    getColor('danger'),
    getColor('warning'),
    getColor('primary'),
    getColor('info'),
    getColor('success'),
    getColor('secondary'),
  ],
  legend: {
    position: 'bottom',
    offsetY: 4,
  },
  stroke: {
    colors: [getColor('body-bg')],
  },
  tooltip: {
    y: {
      formatter: (value) => `${value} reports`,
    },
  },
})

const getUsersByDepartmentOptions = (
  labels: string[],
  values: number[],
): ApexOptions => ({
  chart: {
    type: 'bar',
    height: 320,
    toolbar: { show: false },
  },
  plotOptions: {
    bar: {
      horizontal: true,
      borderRadius: 6,
      borderRadiusApplication: 'end',
    },
  },
  dataLabels: {
    enabled: false,
  },
  colors: [getColor('info')],
  series: [{ name: 'Users', data: values }],
  xaxis: {
    categories: labels,
    axisBorder: { show: false },
  },
  grid: {
    borderColor: getColor('border-color'),
  },
  tooltip: {
    y: {
      formatter: (value) => `${value} users`,
    },
  },
})

const getPopularIdeasOptions = (
  labels: string[],
  commentValues: number[],
  likeValues: number[],
): ApexOptions => ({
  chart: {
    type: 'bar',
    height: 320,
    toolbar: { show: false },
  },
  plotOptions: {
    bar: {
      horizontal: false,
      borderRadius: 6,
      columnWidth: '50%',
    },
  },
  dataLabels: {
    enabled: false,
  },
  colors: [getColor('warning'), getColor('success')],
  series: [
    { name: 'Comments', data: commentValues },
    { name: 'Likes', data: likeValues },
  ],
  xaxis: {
    categories: labels,
    axisBorder: { show: false },
    labels: {
      rotate: -18,
      trim: true,
    },
  },
  legend: {
    position: 'top',
    offsetY: -5,
  },
  grid: {
    borderColor: getColor('border-color'),
  },
  tooltip: {
    y: {
      formatter: (value) => `${value}`,
    },
  },
})

const getIdeaModerationSignalsOptions = (values: number[]): ApexOptions => ({
  chart: {
    type: 'bar',
    height: 320,
    toolbar: { show: false },
  },
  plotOptions: {
    bar: {
      horizontal: false,
      distributed: true,
      borderRadius: 8,
      columnWidth: '55%',
    },
  },
  dataLabels: {
    enabled: true,
    style: {
      fontSize: '12px',
      colors: [getColor('body-color')],
    },
  },
  colors: [getColor('danger'), getColor('secondary'), getColor('primary')],
  series: [{ name: 'Count', data: values }],
  xaxis: {
    categories: [
      'Ideas without comments',
      'Ideas anonymous',
      'Comments anonymous',
    ],
    axisBorder: { show: false },
    labels: {
      rotate: -18,
      trim: true,
    },
  },
  grid: {
    borderColor: getColor('border-color'),
  },
})

const formatDateLabel = (value: Date): string => value.toLocaleDateString()

export const DashboardHomePage = () => {
  const [dateRange, setDateRange] = useState<DateRange>([null, null])

  const [rangeStart, rangeEnd] = dateRange

  const filteredIdeas = useMemo(() => {
    const start = rangeStart ? startOfDay(rangeStart) : null
    const end = rangeEnd ? endOfDay(rangeEnd) : null

    return MOCK_IDEAS.filter((idea) => {
      const createdAt = idea.created_at.getTime()
      if (start !== null && createdAt < start) return false
      if (end !== null && createdAt > end) return false
      return true
    })
  }, [rangeStart, rangeEnd])

  const filteredUsers = useMemo(() => {
    const start = rangeStart ? startOfDay(rangeStart) : null
    const end = rangeEnd ? endOfDay(rangeEnd) : null

    return MOCK_USERS.filter((user) => {
      const createdAt = user.created_at.getTime()
      if (start !== null && createdAt < start) return false
      if (end !== null && createdAt > end) return false
      return true
    })
  }, [rangeStart, rangeEnd])

  const filteredComments = useMemo(() => {
    const start = rangeStart ? startOfDay(rangeStart) : null
    const end = rangeEnd ? endOfDay(rangeEnd) : null

    return MOCK_COMMENTS.filter((comment) => {
      const createdAt = comment.created_at.getTime()
      if (start !== null && createdAt < start) return false
      if (end !== null && createdAt > end) return false
      return true
    })
  }, [rangeStart, rangeEnd])

  const filteredReactions = useMemo(() => {
    const start = rangeStart ? startOfDay(rangeStart) : null
    const end = rangeEnd ? endOfDay(rangeEnd) : null

    return MOCK_REACTIONS.filter((reaction) => {
      const createdAt = reaction.created_at.getTime()
      if (start !== null && createdAt < start) return false
      if (end !== null && createdAt > end) return false
      return true
    })
  }, [rangeStart, rangeEnd])

  const filteredReports = useMemo(() => {
    const start = rangeStart ? startOfDay(rangeStart) : null
    const end = rangeEnd ? endOfDay(rangeEnd) : null

    return MOCK_REPORTS.filter((report) => {
      const createdAt = report.created_at.getTime()
      if (start !== null && createdAt < start) return false
      if (end !== null && createdAt > end) return false
      return true
    })
  }, [rangeStart, rangeEnd])

  const ideasByDepartment = useMemo(() => {
    const counts = new Map<string, number>()

    filteredIdeas.forEach((idea) => {
      const user = userById.get(idea.user_id)
      const departmentName = user
        ? (departmentNameById.get(user.department_id) ?? 'Unknown Department')
        : 'Unknown Department'

      counts.set(departmentName, (counts.get(departmentName) ?? 0) + 1)
    })

    return toSortedSeries(counts)
  }, [filteredIdeas])

  const ideasByCategories = useMemo(() => {
    const counts = new Map<string, number>()

    filteredIdeas.forEach((idea) => {
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
  }, [filteredIdeas])

  const reportsByCategories = useMemo(() => {
    const counts = new Map<string, number>()

    filteredReports.forEach((report) => {
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
  }, [filteredReports])

  const usersByDepartments = useMemo(() => {
    const counts = new Map<string, number>()

    filteredUsers.forEach((user) => {
      const departmentName =
        departmentNameById.get(Number(user.department_id)) ??
        'Unknown Department'
      counts.set(departmentName, (counts.get(departmentName) ?? 0) + 1)
    })

    return toSortedSeries(counts)
  }, [filteredUsers])

  const commentCountsByIdea = useMemo(() => {
    const counts = new Map<number, number>()
    filteredComments.forEach((comment) => {
      counts.set(comment.idea_id, (counts.get(comment.idea_id) ?? 0) + 1)
    })
    return counts
  }, [filteredComments])

  const likeCountsByIdea = useMemo(() => {
    const counts = new Map<number, number>()
    filteredReactions.forEach((reaction) => {
      if (reaction.reaction_type !== 'upvote') return
      counts.set(reaction.idea_id, (counts.get(reaction.idea_id) ?? 0) + 1)
    })
    return counts
  }, [filteredReactions])

  const mostPopularIdeas = useMemo<PopularIdeasSeries>(() => {
    const topIdeas = filteredIdeas
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
  }, [filteredIdeas, commentCountsByIdea, likeCountsByIdea])

  const ideaModerationSignals = useMemo(() => {
    const ideasWithoutComments = filteredIdeas.filter(
      (idea) => (commentCountsByIdea.get(Number(idea.id)) ?? 0) === 0,
    ).length

    const ideasAnonymous = filteredIdeas.filter(
      (idea) => idea.is_anonymous,
    ).length

    const commentsAnonymous = filteredComments.filter(
      (comment) => comment.is_anonymous,
    ).length

    return [ideasWithoutComments, ideasAnonymous, commentsAnonymous]
  }, [filteredIdeas, filteredComments, commentCountsByIdea])

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
    if (rangeStart) return formatDateLabel(rangeStart)
    return formatDateLabel(rangeEnd as Date)
  }, [rangeStart, rangeEnd])

  const hasDateFilter = Boolean(rangeStart || rangeEnd)

  const onRangeChange = (selectedDates: Date[]) => {
    if (!selectedDates.length) {
      setDateRange([null, null])
      return
    }

    const start = selectedDates[0]
    const end = selectedDates[1] ?? selectedDates[0]
    setDateRange([start, end])
  }

  return (
    <Container fluid>
      <DashboardPage title="Dashboard" subtitle="QA" showBreadcrumb={false}>
        <ComponentCard title="Reporting Filters" className="mb-3">
          <Row className="g-3 align-items-end">
            <Col lg={4} md={6}>
              <FormLabel className="fw-semibold">Date Range</FormLabel>
              <Flatpickr
                className="form-control"
                value={dateRange.filter((date): date is Date => date !== null)}
                options={{ mode: 'range', dateFormat: 'd M, Y' }}
                onChange={onRangeChange}
                placeholder="Select date range"
              />
            </Col>
            <Col lg="auto" md="auto">
              <Button
                variant="outline-secondary"
                onClick={() => setDateRange([null, null])}
                disabled={!hasDateFilter}
              >
                Reset
              </Button>
            </Col>
            <Col>
              <p className="text-muted mb-0">
                {selectedRangeLabel} | Ideas: {filteredIdeas.length} | Reports:{' '}
                {filteredReports.length} | Users: {filteredUsers.length} |
                Comments: {filteredComments.length}
              </p>
              <p className="text-muted mb-0 fs-xxs">
                All charts are filtered by created_at.
              </p>
            </Col>
          </Row>
        </ComponentCard>

        <Row className="g-3">
          <Col xl={4} md={6}>
            <ComponentCard title="Ideas by Department">
              {ideasByDepartment.values.length ? (
                <CustomApexChart
                  key={`ideas-department-${ideasByDepartment.labels.join('|')}-${ideasByDepartment.values.join('|')}`}
                  getOptions={() => ideasByDepartmentOptions}
                  series={ideasByDepartmentOptions.series}
                  type="bar"
                  height={320}
                />
              ) : (
                <p className="text-muted mb-0">
                  No data available for selected date range.
                </p>
              )}
            </ComponentCard>
          </Col>

          <Col xl={4} md={6}>
            <ComponentCard title="Ideas by Categories">
              {ideasByCategories.values.length ? (
                <CustomApexChart
                  key={`ideas-categories-${ideasByCategories.labels.join('|')}-${ideasByCategories.values.join('|')}`}
                  getOptions={() => ideasByCategoriesOptions}
                  series={ideasByCategoriesOptions.series}
                  type="bar"
                  height={320}
                />
              ) : (
                <p className="text-muted mb-0">
                  No data available for selected date range.
                </p>
              )}
            </ComponentCard>
          </Col>

          <Col xl={4} md={12}>
            <ComponentCard title="Reports by Categories">
              {reportsByCategories.values.length ? (
                <CustomApexChart
                  key={`reports-categories-${reportsByCategories.labels.join('|')}-${reportsByCategories.values.join('|')}`}
                  getOptions={() => reportsByCategoriesOptions}
                  series={reportsByCategoriesOptions.series}
                  type="donut"
                  height={320}
                />
              ) : (
                <p className="text-muted mb-0">
                  No data available for selected date range.
                </p>
              )}
            </ComponentCard>
          </Col>
        </Row>

        <Row className="g-3 mt-0">
          <Col xl={4} md={6}>
            <ComponentCard title="Users by Departments">
              {usersByDepartments.values.length ? (
                <CustomApexChart
                  key={`users-department-${usersByDepartments.labels.join('|')}-${usersByDepartments.values.join('|')}`}
                  getOptions={() => usersByDepartmentsOptions}
                  series={usersByDepartmentsOptions.series}
                  type="bar"
                  height={320}
                />
              ) : (
                <p className="text-muted mb-0">
                  No data available for selected date range.
                </p>
              )}
            </ComponentCard>
          </Col>

          <Col xl={4} md={6}>
            <ComponentCard title="Most Popular Ideas (Comments + Likes)">
              {mostPopularIdeas.labels.length ? (
                <CustomApexChart
                  key={`popular-ideas-${mostPopularIdeas.labels.join('|')}-${mostPopularIdeas.commentValues.join('|')}-${mostPopularIdeas.likeValues.join('|')}`}
                  getOptions={() => mostPopularIdeasOptions}
                  series={mostPopularIdeasOptions.series}
                  type="bar"
                  height={320}
                />
              ) : (
                <p className="text-muted mb-0">
                  No data available for selected date range.
                </p>
              )}
            </ComponentCard>
          </Col>

          <Col xl={4} md={12}>
            <ComponentCard title="Idea and Comment Signals">
              <CustomApexChart
                key={`idea-signals-${ideaModerationSignals.join('|')}`}
                getOptions={() => ideaModerationSignalsOptions}
                series={ideaModerationSignalsOptions.series}
                type="bar"
                height={320}
              />
            </ComponentCard>
          </Col>
        </Row>
      </DashboardPage>
    </Container>
  )
}
