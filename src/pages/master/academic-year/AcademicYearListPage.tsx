'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { createColumnHelper } from '@tanstack/react-table'
import { useMemo, useState, useEffect } from 'react'
import {
  Badge,
  Button,
  Col,
  Container,
  Form,
  FormControl,
  FormGroup,
  FormLabel,
  Row,
} from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import { TbEdit, TbEye, TbPlus, TbTrash } from 'react-icons/tb'
import { z } from 'zod'

import CommonDataTable from '@/components/common/CommonDataTable'
import DashboardPage from '@/components/common/DashboardPage'
import DetailFieldList from '@/components/common/DetailFieldList'
import EntityDetailModal from '@/components/common/EntityDetailModal'
import EntityFormModal from '@/components/common/EntityFormModal'
import SearchFilter from '@/components/common/SearchFilter'
import DeleteConfirmationModal from '@/components/table/DeleteConfirmationModal'
import type { AcademicYear } from '@/types/entity'
import { useAcademicYearStore } from './store'
import ApiHandlingProvider from '@/utils/ApiHandleProvider'
import TblSkeletonLoading from '@/components/TblSkeletonLoading'

const academicYearFormSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  code: z.string().min(2, 'Code is required'),
  fromDate: z.string().min(1, 'Start date is required'),
  toDate: z.string().min(1, 'End date is required'),
  submissionDeadline: z.string().min(1, 'Submission deadline is required'),
  feedbackCutOffDeadline: z
    .string()
    .min(1, 'Feedback cut-off deadline is required'),
})

type AcademicYearFormValues = z.infer<typeof academicYearFormSchema>

const columnHelper = createColumnHelper<AcademicYear>()

export const AcademicYearListPage = () => {
  const { items, fetchAll, create, update, remove, setPayload, isLoading } =
    useAcademicYearStore()

  const [showFormModal, setShowFormModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [activeYear, setActiveYear] = useState<AcademicYear | null>(null)

  useEffect(() => {
    fetchAll()
  }, [])

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AcademicYearFormValues>({
    resolver: zodResolver(academicYearFormSchema),
    defaultValues: {
      name: '',
      code: '',
      fromDate: '',
      toDate: '',
      submissionDeadline: '',
      feedbackCutOffDeadline: '',
    },
  })

  // Helper to safely format dates for display (handles ISO strings from API or Date objects)
  const formatDate = (dateInput: any) => {
    if (!dateInput) return '—'
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput
    return date.toLocaleDateString()
  }

  // Helper to format date for HTML Input (YYYY-MM-DD)
  const formatForInput = (dateInput: any) => {
    if (!dateInput) return ''
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput
    return date.toISOString().split('T')[0]
  }

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', { header: 'Academic Year' }),
      columnHelper.accessor('code', { header: 'Code' }),
      columnHelper.accessor('submission_deadline', {
        header: 'Submission Deadline',
        cell: ({ row }) => formatDate(row.original.submission_deadline),
      }),
      columnHelper.accessor('feedback_cut_off_deadline', {
        header: 'Feedback Cut-Off',
        cell: ({ row }) => formatDate(row.original.feedback_cut_off_deadline),
      }),
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }: any) => {
          return (
            <div className="d-flex gap-1">
              <Button
                variant="light"
                size="sm"
                className="btn-icon rounded-circle"
                onClick={() => {
                  setActiveYear(row.original)
                  setShowDetailModal(true)
                }}
              >
                <TbEye className="fs-lg" />
              </Button>
              <Button
                variant="light"
                size="sm"
                className="btn-icon rounded-circle"
                onClick={() => {
                  setActiveYear(row.original)
                  reset({
                    name: row.original.name,
                    code: row.original.code,
                    fromDate: formatForInput(row.original.from_date),
                    toDate: formatForInput(row.original.to_date),
                    submissionDeadline: formatForInput(
                      row.original.submission_deadline,
                    ),
                    feedbackCutOffDeadline: formatForInput(
                      row.original.feedback_cut_off_deadline,
                    ),
                  })
                  setShowFormModal(true)
                }}
              >
                <TbEdit className="fs-lg" />
              </Button>
              <Button
                variant="danger"
                size="sm"
                className="btn-icon rounded-circle"
                disabled={row.original.is_in_use}
                onClick={() => {
                  setActiveYear(row.original)
                  setShowDeleteModal(true)
                }}
              >
                <TbTrash className="fs-lg" />
              </Button>
              {row.original.is_in_use && (
                <Badge bg="secondary-subtle" className="text-secondary">
                  In use
                </Badge>
              )}
            </div>
          )
        },
      },
    ],
    [reset],
  )

  const submitForm = handleSubmit(async (data) => {
    const payload = {
      name: data.name,
      code: data.code,
      from_date: data.fromDate,
      to_date: data.toDate,
      submission_deadline: data.submissionDeadline,
      feedback_cut_off_deadline: data.feedbackCutOffDeadline,
    }

    setPayload(payload)

    if (activeYear?.id) {
      await update(activeYear.id)
    } else {
      await create()
    }

    setShowFormModal(false)
    setActiveYear(null)
    fetchAll()
  })

  const handleDelete = async () => {
    if (!activeYear?.id) return
    await remove(activeYear.id)
    setShowDeleteModal(false)
    setActiveYear(null)
  }

  return (
    <Container fluid>
      <DashboardPage
        title="Academic Years"
        subtitle="Master"
        actions={
          <Button
            variant="primary"
            onClick={() => {
              setActiveYear(null)
              reset({
                name: '',
                code: '',
                fromDate: '',
                toDate: '',
                submissionDeadline: '',
                feedbackCutOffDeadline: '',
              })
              setShowFormModal(true)
            }}
          >
            <TbPlus className="me-1" /> New Academic Year
          </Button>
        }
      >
        <ApiHandlingProvider
          apiCalls={[isLoading]}
          loadingComponent={<TblSkeletonLoading />}
        >
          <CommonDataTable
            title="Academic Years"
            data={items}
            columns={columns}
            // loading={isLoading}
            itemsName="academic years"
            renderHeader={({ globalFilter, setGlobalFilter }) => (
              <SearchFilter
                value={globalFilter}
                onChange={setGlobalFilter}
                placeholder="Search academic years..."
              />
            )}
          />
        </ApiHandlingProvider>
      </DashboardPage>

      <EntityFormModal
        show={showFormModal}
        title={activeYear ? 'Edit Academic Year' : 'New Academic Year'}
        onHide={() => {
          setShowFormModal(false)
          setActiveYear(null)
        }}
        onSubmit={submitForm}
        submitLabel={activeYear ? 'Update' : 'Create'}
      >
        <Form>
          <Row>
            <Col md={6}>
              <FormGroup className="mb-3">
                <FormLabel>Name</FormLabel>
                <FormControl
                  type="text"
                  isInvalid={!!errors.name}
                  {...register('name')}
                />
                <div className="invalid-feedback">{errors.name?.message}</div>
              </FormGroup>
            </Col>
            <Col md={6}>
              <FormGroup className="mb-3">
                <FormLabel>Code</FormLabel>
                <FormControl
                  type="text"
                  isInvalid={!!errors.code}
                  {...register('code')}
                />
                <div className="invalid-feedback">{errors.code?.message}</div>
              </FormGroup>
            </Col>
            <Col md={6}>
              <FormGroup className="mb-3">
                <FormLabel>Start Date</FormLabel>
                <FormControl
                  type="date"
                  isInvalid={!!errors.fromDate}
                  {...register('fromDate')}
                />
                <div className="invalid-feedback">
                  {errors.fromDate?.message}
                </div>
              </FormGroup>
            </Col>
            <Col md={6}>
              <FormGroup className="mb-3">
                <FormLabel>End Date</FormLabel>
                <FormControl
                  type="date"
                  isInvalid={!!errors.toDate}
                  {...register('toDate')}
                />
                <div className="invalid-feedback">{errors.toDate?.message}</div>
              </FormGroup>
            </Col>
            <Col md={6}>
              <FormGroup className="mb-3">
                <FormLabel>Submission Deadline</FormLabel>
                <FormControl
                  type="date"
                  isInvalid={!!errors.submissionDeadline}
                  {...register('submissionDeadline')}
                />
                <div className="invalid-feedback">
                  {errors.submissionDeadline?.message}
                </div>
              </FormGroup>
            </Col>
            <Col md={6}>
              <FormGroup className="mb-3">
                <FormLabel>Feedback Cut-Off Deadline</FormLabel>
                <FormControl
                  type="date"
                  isInvalid={!!errors.feedbackCutOffDeadline}
                  {...register('feedbackCutOffDeadline')}
                />
                <div className="invalid-feedback">
                  {errors.feedbackCutOffDeadline?.message}
                </div>
              </FormGroup>
            </Col>
          </Row>
        </Form>
      </EntityFormModal>

      <EntityDetailModal
        show={showDetailModal}
        title="Academic Year Details"
        onHide={() => {
          setShowDetailModal(false)
          setActiveYear(null)
        }}
      >
        {activeYear && (
          <DetailFieldList
            items={[
              { label: 'Name', value: activeYear.name },
              { label: 'Code', value: activeYear.code },
              { label: 'Start', value: formatDate(activeYear.from_date) },
              { label: 'End', value: formatDate(activeYear.to_date) },
              {
                label: 'Submission Deadline',
                value: formatDate(activeYear.submission_deadline),
              },
              {
                label: 'Feedback Cut-Off',
                value: formatDate(activeYear.feedback_cut_off_deadline),
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
        itemName="academic year"
      />
    </Container>
  )
}
