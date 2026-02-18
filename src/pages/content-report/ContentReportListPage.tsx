import { createColumnHelper } from '@tanstack/react-table'
import { useMemo, useState } from 'react'
import { Badge, Button, Container } from 'react-bootstrap'
import { TbCheck, TbEye, TbTrash, TbX } from 'react-icons/tb'

import CommonDataTable from '@/components/common/CommonDataTable'
import DashboardPage from '@/components/common/DashboardPage'
import DetailFieldList from '@/components/common/DetailFieldList'
import EntityDetailModal from '@/components/common/EntityDetailModal'
import SearchFilter from '@/components/common/SearchFilter'
import SelectFilter from '@/components/common/SelectFilter'
import DeleteConfirmationModal from '@/components/table/DeleteConfirmationModal'
import type { Report, ReportCategory } from '@/types/entity'

type ReportRow = {
  report: Report
  categories: ReportCategory[]
}

const reportCategories: ReportCategory[] = [
  {
    id: 1,
    name: 'Harassment',
    description: 'Harassment or hate speech',
    created_at: new Date('2025-09-01'),
  },
  {
    id: 2,
    name: 'Spam',
    description: 'Irrelevant or repetitive content',
    created_at: new Date('2025-09-01'),
  },
  {
    id: 3,
    name: 'Inappropriate',
    description: 'Inappropriate language or content',
    created_at: new Date('2025-09-01'),
  },
]

const initialReports: ReportRow[] = [
  {
    report: {
      id: 401,
      user_id: 10,
      target_id: 101,
      target_type: 'idea',
      reason_details: 'Contains personal information about a staff member.',
      status: 'pending',
      created_at: new Date('2026-02-05'),
    },
    categories: [reportCategories[2]],
  },
  {
    report: {
      id: 402,
      user_id: 33,
      target_id: 501,
      target_type: 'comment',
      reason_details: 'Repeated advertisement links.',
      status: 'pending',
      created_at: new Date('2026-02-06'),
    },
    categories: [reportCategories[1]],
  },
  {
    report: {
      id: 403,
      user_id: 28,
      target_id: 19,
      target_type: 'user',
      reason_details: 'Unprofessional language in comments.',
      status: 'resolved',
      created_at: new Date('2026-02-07'),
    },
    categories: [reportCategories[0], reportCategories[2]],
  },
]

const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'dismissed', label: 'Dismissed' },
]

const columnHelper = createColumnHelper<ReportRow>()

export const ContentReportListPage = () => {
  const [reports, setReports] = useState<ReportRow[]>(() => [...initialReports])
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [activeReport, setActiveReport] = useState<ReportRow | null>(null)

  const columns = useMemo(
    () => [
      columnHelper.accessor((row) => row.report.target_type, {
        id: 'target',
        header: 'Target',
        cell: ({ row }) => (
          <div>
            <div className="fw-semibold">{row.original.report.target_type}</div>
            <div className="text-muted fs-xxs">
              ID: {row.original.report.target_id}
            </div>
          </div>
        ),
      }),
      columnHelper.accessor((row) => row.categories, {
        id: 'categories',
        header: 'Categories',
        cell: ({ row }) => (
          <div className="d-flex flex-wrap gap-1">
            {row.original.categories.map((category) => (
              <Badge
                key={category.id}
                bg="danger-subtle"
                className="text-danger"
              >
                {category.name}
              </Badge>
            ))}
          </div>
        ),
      }),
      columnHelper.accessor((row) => row.report.reason_details, {
        id: 'reason',
        header: 'Reason',
        cell: ({ row }) => (
          <span className="text-muted">
            {row.original.report.reason_details}
          </span>
        ),
      }),
      columnHelper.accessor((row) => row.report.status, {
        id: 'status',
        header: 'Status',
        filterFn: 'equalsString',
        cell: ({ row }) => {
          const status = row.original.report.status
          const variant =
            status === 'resolved'
              ? 'success'
              : status === 'dismissed'
                ? 'secondary'
                : 'warning'
          return (
            <Badge bg={`${variant}-subtle`} className={`text-${variant}`}>
              {status}
            </Badge>
          )
        },
      }),
      columnHelper.accessor((row) => row.report.created_at, {
        id: 'created',
        header: 'Reported On',
        cell: ({ row }) => row.original.report.created_at.toLocaleDateString(),
      }),
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className="d-flex gap-1">
            <Button
              variant="light"
              size="sm"
              className="btn-icon rounded-circle"
              onClick={() => {
                setActiveReport(row.original)
                setShowDetailModal(true)
              }}
            >
              <TbEye className="fs-lg" />
            </Button>
            <Button
              variant="success"
              size="sm"
              className="btn-icon rounded-circle"
              onClick={() => {
                setReports((prev) =>
                  prev.map((item) =>
                    item.report.id === row.original.report.id
                      ? {
                          ...item,
                          report: {
                            ...item.report,
                            status: 'resolved',
                            updated_at: new Date(),
                          },
                        }
                      : item,
                  ),
                )
              }}
            >
              <TbCheck className="fs-lg" />
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="btn-icon rounded-circle"
              onClick={() => {
                setReports((prev) =>
                  prev.map((item) =>
                    item.report.id === row.original.report.id
                      ? {
                          ...item,
                          report: {
                            ...item.report,
                            status: 'dismissed',
                            updated_at: new Date(),
                          },
                        }
                      : item,
                  ),
                )
              }}
            >
              <TbX className="fs-lg" />
            </Button>
            <Button
              variant="danger"
              size="sm"
              className="btn-icon rounded-circle"
              onClick={() => {
                setActiveReport(row.original)
                setShowDeleteModal(true)
              }}
            >
              <TbTrash className="fs-lg" />
            </Button>
          </div>
        ),
      },
    ],
    [],
  )

  const handleDelete = () => {
    if (!activeReport) return
    setReports((prev) =>
      prev.filter((item) => item.report.id !== activeReport.report.id),
    )
    setShowDeleteModal(false)
    setActiveReport(null)
  }

  return (
    <Container fluid>
      <DashboardPage title="Content Reports" subtitle="QA">
        <CommonDataTable
          title="Reported Content"
          data={reports}
          columns={columns}
          itemsName="reports"
          renderHeader={({
            globalFilter,
            setGlobalFilter,
            columnFilters,
            setColumnFilters,
          }) => (
            <>
              <SearchFilter
                value={globalFilter}
                onChange={(value) => setGlobalFilter(value)}
                placeholder="Search reports..."
              />
              <SelectFilter
                value={
                  (columnFilters.find((filter) => filter.id === 'status')
                    ?.value as string) ?? ''
                }
                onChange={(value) =>
                  setColumnFilters([
                    ...columnFilters.filter((filter) => filter.id !== 'status'),
                    { id: 'status', value },
                  ])
                }
                options={statusOptions}
                placeholder="All statuses"
              />
            </>
          )}
        />
      </DashboardPage>

      <EntityDetailModal
        show={showDetailModal}
        title="Report Details"
        onHide={() => {
          setShowDetailModal(false)
          setActiveReport(null)
        }}
      >
        {activeReport && (
          <DetailFieldList
            items={[
              {
                label: 'Target',
                value: `${activeReport.report.target_type} #${activeReport.report.target_id}`,
              },
              {
                label: 'Reporter',
                value: `User #${activeReport.report.user_id}`,
              },
              { label: 'Status', value: activeReport.report.status },
              { label: 'Reason', value: activeReport.report.reason_details },
              {
                label: 'Reported On',
                value: activeReport.report.created_at.toLocaleDateString(),
              },
              {
                label: 'Categories',
                value: activeReport.categories
                  .map((cat) => cat.name)
                  .join(', '),
              },
            ]}
          />
        )}
      </EntityDetailModal>

      <DeleteConfirmationModal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        selectedCount={1}
        itemName="report"
      />
    </Container>
  )
}
