import { zodResolver } from '@hookform/resolvers/zod'
import { createColumnHelper } from '@tanstack/react-table'
import { useMemo, useState } from 'react'
import {
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

const initialAcademicYears: AcademicYear[] = [
  {
    id: 1,
    name: '2025/2026',
    code: 'AY2526',
    description: 'Academic year 2025/2026',
    from_date: new Date('2025-09-01'),
    to_date: new Date('2026-08-31'),
    submission_deadline: new Date('2026-04-15'),
    feedback_cut_off_deadline: new Date('2026-05-30'),
    created_at: new Date('2025-09-01'),
  },
]

const columnHelper = createColumnHelper<AcademicYear>()

export const AcademicYearListPage = () => {
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>(() => [
    ...initialAcademicYears,
  ])
  const [showFormModal, setShowFormModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [activeYear, setActiveYear] = useState<AcademicYear | null>(null)

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

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', { header: 'Academic Year' }),
      columnHelper.accessor('code', { header: 'Code' }),
      columnHelper.accessor('submission_deadline', {
        header: 'Submission Deadline',
        cell: ({ row }) =>
          row.original.submission_deadline.toLocaleDateString(),
      }),
      columnHelper.accessor('feedback_cut_off_deadline', {
        header: 'Feedback Cut-Off',
        cell: ({ row }) =>
          row.original.feedback_cut_off_deadline.toLocaleDateString(),
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
                  fromDate: row.original.from_date.toISOString().slice(0, 10),
                  toDate: row.original.to_date.toISOString().slice(0, 10),
                  submissionDeadline: row.original.submission_deadline
                    .toISOString()
                    .slice(0, 10),
                  feedbackCutOffDeadline: row.original.feedback_cut_off_deadline
                    .toISOString()
                    .slice(0, 10),
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
              onClick={() => {
                setActiveYear(row.original)
                setShowDeleteModal(true)
              }}
            >
              <TbTrash className="fs-lg" />
            </Button>
          </div>
        ),
      },
    ],
    [reset],
  )

  const submitForm = handleSubmit((data) => {
    const payload: AcademicYear = {
      id: activeYear?.id ?? Date.now(),
      name: data.name,
      code: data.code,
      description: activeYear?.description,
      from_date: new Date(data.fromDate),
      to_date: new Date(data.toDate),
      submission_deadline: new Date(data.submissionDeadline),
      feedback_cut_off_deadline: new Date(data.feedbackCutOffDeadline),
      created_at: activeYear?.created_at ?? new Date(),
      updated_at: activeYear ? new Date() : undefined,
    }

    setAcademicYears((prev) => {
      if (activeYear) {
        return prev.map((item) => (item.id === activeYear.id ? payload : item))
      }
      return [payload, ...prev]
    })

    reset({
      name: '',
      code: '',
      fromDate: '',
      toDate: '',
      submissionDeadline: '',
      feedbackCutOffDeadline: '',
    })
    setShowFormModal(false)
    setActiveYear(null)
  })

  const handleDelete = () => {
    if (!activeYear) return
    setAcademicYears((prev) => prev.filter((item) => item.id !== activeYear.id))
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
        <CommonDataTable
          title="Academic Years"
          data={academicYears}
          columns={columns}
          itemsName="academic years"
          renderHeader={({ globalFilter, setGlobalFilter }) => (
            <SearchFilter
              value={globalFilter}
              onChange={setGlobalFilter}
              placeholder="Search academic years..."
            />
          )}
        />
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
              {
                label: 'Start',
                value: activeYear.from_date.toLocaleDateString(),
              },
              { label: 'End', value: activeYear.to_date.toLocaleDateString() },
              {
                label: 'Submission Deadline',
                value: activeYear.submission_deadline.toLocaleDateString(),
              },
              {
                label: 'Feedback Cut-Off',
                value:
                  activeYear.feedback_cut_off_deadline.toLocaleDateString(),
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
