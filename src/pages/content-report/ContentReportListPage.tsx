'use client'

import { createColumnHelper } from '@tanstack/react-table'
import { useEffect, useMemo, useState } from 'react'
import { Badge, Button, Container, Row, Col } from 'react-bootstrap'
import { TbCheck, TbEye, TbTrash, TbRotateClockwise2 } from 'react-icons/tb'
import toast from 'react-hot-toast'

import CommonDataTable from '@/components/common/CommonDataTable'
import DashboardPage from '@/components/common/DashboardPage'
import DetailFieldList from '@/components/common/DetailFieldList'
import EntityDetailModal from '@/components/common/EntityDetailModal'
import SearchFilter from '@/components/common/SearchFilter'
import SelectFilter from '@/components/common/SelectFilter'
import DeleteConfirmationModal from '@/components/table/DeleteConfirmationModal'
import TblSkeletonLoading from '@/components/TblSkeletonLoading'
import ApiHandlingProvider from '@/utils/ApiHandleProvider'

import {
  useCommentActivitationStore,
  useIdeaActivitationStore,
  useReportStore,
  useUserActivitationStore,
} from './store'
import { useReportCategoryStore } from '../master/report-category/store'

const columnHelper = createColumnHelper<any>()

export const ContentReportListPage = () => {
  const { items: itemsReportCategories, fetchAll: fetchAllReportCategories } =
    useReportCategoryStore()

  const { setPayload: setPayloadIdea, update: activitationIdea } =
    useIdeaActivitationStore()
  const { setPayload: setPayloadUser, update: activitationUser } =
    useUserActivitationStore()
  const { setPayload: setPayloadComment, update: activitationComment } =
    useCommentActivitationStore()

  const [reportableType, setReportableType] = useState<string>('Idea')
  const [reportCategories, setReportCategories] = useState<string>('')

  const { items, fetchAll, update, remove, setPayload, isLoading } =
    useReportStore()

  const [activeReport, setActiveReport] = useState<any | null>(null)
  console.log('🚀 ~ ContentReportListPage ~ activeReport:', activeReport)

  // Modal Visibility States
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showApproveModal, setShowApproveModal] = useState(false)
  const [showUndoModal, setShowUndoModal] = useState(false)

  useEffect(() => {
    fetchAllReportCategories()
  }, [])

  useEffect(() => {
    if (reportableType) {
      fetchAll(`?reportable_type=${reportableType}`)
    }
  }, [reportableType])

  const columns = useMemo(
    () => [
      columnHelper.accessor('target_type', {
        header: 'Target',
        cell: ({ row }) => (
          <div>
            <div className="fw-semibold text-capitalize">
              {row.original.reported_details?.title || 'No Title'}
            </div>
            <div className="text-muted fs-xxs">
              Name: {row.original.reported_details?.user_info?.name}, Email:{' '}
              {row.original.reported_details?.user_info?.email}
            </div>
          </div>
        ),
      }),
      columnHelper.accessor('category', {
        header: 'Category',
        cell: ({ row }) => (
          <div className="d-flex flex-wrap gap-1">
            {row.original.category && (
              <Badge bg="danger-subtle" className="text-danger">
                {row.original.category.name}
              </Badge>
            )}
          </div>
        ),
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: ({ row }) => {
          const status = row.original.status
          const variant =
            status === 'resolved'
              ? 'success'
              : status === 'dismissed'
                ? 'secondary'
                : 'warning'
          return (
            <Badge
              bg={`${variant}-subtle`}
              className={`text-${variant} text-capitalize`}
            >
              {status}
            </Badge>
          )
        },
      }),
      columnHelper.accessor('created_at', {
        header: 'Reported On',
        cell: ({ row }) =>
          new Date(row.original.created_at).toLocaleDateString(),
      }),
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }: any) => (
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

            {row.original.status === 'pending' ? (
              <Button
                variant="success"
                size="sm"
                className="btn-icon rounded-circle"
                onClick={() => {
                  setActiveReport(row.original)
                  setShowApproveModal(true)
                }}
              >
                <TbCheck className="fs-lg" />
              </Button>
            ) : (
              <Button
                variant="warning"
                size="sm"
                className="btn-icon rounded-circle"
                onClick={() => {
                  setActiveReport(row.original)
                  setShowUndoModal(true)
                }}
              >
                <TbRotateClockwise2 className="fs-lg" />
              </Button>
            )}

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
    [items, reportableType],
  )

  const filterItems = items?.filter((data) =>
    !!reportCategories ? data?.category?.name === reportCategories : data,
  )

  return (
    <Container fluid>
      <DashboardPage title="Content Reports" subtitle="Quality Assurance">
        <ApiHandlingProvider
          apiCalls={[isLoading]}
          loadingComponent={<TblSkeletonLoading />}
        >
          <CommonDataTable
            title="Reported Content"
            data={filterItems || []}
            columns={columns}
            itemsName="reports"
            renderHeader={({ globalFilter, setGlobalFilter }) => (
              <div className="col-mb-12">
                <Row className="g-3 align-items-center mb-12">
                  <Col lg={6}>
                    <SearchFilter
                      value={globalFilter}
                      onChange={setGlobalFilter}
                      placeholder="Search reports..."
                    />
                  </Col>
                  <Col lg={6} className="d-flex justify-content-center">
                    <SelectFilter
                      value={reportCategories}
                      onChange={(val) => setReportCategories(val)}
                      options={
                        itemsReportCategories?.map((data) => ({
                          value: data.name,
                          label: data.name,
                        })) as any
                      }
                      placeholder="Filter by Report Categories"
                    />
                  </Col>
                </Row>
                <Row className="mt-2">
                  <Col lg={12}>
                    <div
                      className="btn-group p-1 bg-light rounded"
                      role="group"
                    >
                      {['Idea', 'User', 'Comment'].map((type) => (
                        <Button
                          key={type}
                          variant={
                            reportableType === type ? 'primary' : 'light'
                          }
                          size="sm"
                          className={`px-3 py-1 border-0 rounded ${reportableType === type ? 'shadow-sm' : ''}`}
                          onClick={() => setReportableType(type)}
                        >
                          {type}
                        </Button>
                      ))}
                    </div>
                  </Col>
                </Row>
              </div>
            )}
          />
        </ApiHandlingProvider>
      </DashboardPage>

      {/* 1. Detail Modal */}
      <EntityDetailModal
        show={showDetailModal}
        title="Report Details"
        onHide={() => setShowDetailModal(false)}
      >
        {activeReport && (
          <DetailFieldList
            items={[
              {
                label: 'Target Type',
                value: activeReport.target_type?.toUpperCase(),
              },
              {
                label: 'Reporter',
                value:
                  activeReport.user_info?.name ||
                  `User #${activeReport.user_id}`,
              },
              { label: 'Status', value: activeReport.status },
              { label: 'Reason', value: activeReport.reason },
              {
                label: 'Reported On',
                value: new Date(activeReport.created_at).toLocaleString(),
              },
            ]}
          />
        )}
      </EntityDetailModal>

      {/* 2. Delete Confirmation Modal */}
      <DeleteConfirmationModal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        onConfirm={async () => {
          if (activeReport?.id) {
            await remove(activeReport.id)
            setShowDeleteModal(false)
            fetchAll(reportableType ? `?reportable_type=${reportableType}` : '')
            toast.success('Report deleted permanently')
          }
        }}
        selectedCount={1}
        itemName="report"
      />

      {/* 3. Approve (Resolve) Modal */}
      <DeleteConfirmationModal
        show={showApproveModal}
        onHide={() => setShowApproveModal(false)}
        onConfirm={async () => {
          if (reportableType === 'Idea') {
            setPayloadIdea({ status: 'suspended' })
            await activitationIdea(activeReport?.idea_id, '/status')
          } else if (reportableType === 'User') {
            setPayloadUser({ status: 'suspended' })
            await activitationUser(activeReport?.user_id, '/status')
          } else if (reportableType === 'Comment') {
            setPayloadComment({ status: 'suspended' })
            await activitationComment(activeReport?.comment_id, '/status')
          } else {
            toast.error('Something wrong.')
          }
          setShowApproveModal(false)
          setShowUndoModal(false)
        }}
        modalTitle="Confirm Supended"
        confirmButtonText="Supended Report"
        confirmButtonVariant="success"
        selectedCount={1}
      >
        Are you sure you want to mark this report as <strong>Supended</strong>?
      </DeleteConfirmationModal>

      {/* 4. Undo (Re-open) Modal */}
      <DeleteConfirmationModal
        show={showUndoModal}
        onHide={() => setShowUndoModal(false)}
        onConfirm={async () => {
          if (reportableType === 'Idea') {
            setPayloadIdea({ status: 'active' })
            await activitationIdea(activeReport?.idea_id, '/status')
          } else if (reportableType === 'User') {
            setPayloadUser({ status: 'active' })
            await activitationUser(activeReport?.user_id, '/status')
          } else if (reportableType === 'Comment') {
            setPayloadComment({ status: 'active' })
            await activitationComment(activeReport?.comment_id, '/status')
          } else {
            toast.error('Something wrong.')
          }
          setShowApproveModal(false)
          setShowUndoModal(false)
        }}
        modalTitle="Re-open Report"
        confirmButtonText="Re-open"
        confirmButtonVariant="warning"
        selectedCount={1}
      >
        Do you want to revert this report back to <strong>Pending</strong>{' '}
        status?
      </DeleteConfirmationModal>
    </Container>
  )
}
