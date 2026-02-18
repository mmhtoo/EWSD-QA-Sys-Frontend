import { zodResolver } from '@hookform/resolvers/zod'
import { createColumnHelper } from '@tanstack/react-table'
import { useEffect, useMemo, useState } from 'react'
import {
  Badge,
  Button,
  Col,
  Container,
  Form,
  FormCheck,
  FormControl,
  FormGroup,
  FormLabel,
  Row,
} from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import { LuTag } from 'react-icons/lu'
import {
  TbEdit,
  TbEye,
  TbPlus,
  TbThumbDown,
  TbThumbUp,
  TbTrash,
  TbDownload,
} from 'react-icons/tb'
import { z } from 'zod'

import FileUploader from '@/components/FileUploader'
import CommonDataTable from '@/components/common/CommonDataTable'
import DashboardPage from '@/components/common/DashboardPage'
import { useIdeaModalContext } from '@/context/useIdeaModalContext'
import DeleteConfirmationModal from '@/components/table/DeleteConfirmationModal'
import DetailFieldList from '@/components/common/DetailFieldList'
import EntityDetailModal from '@/components/common/EntityDetailModal'
import EntityFormModal from '@/components/common/EntityFormModal'
import SearchFilter from '@/components/common/SearchFilter'
import SelectFilter from '@/components/common/SelectFilter'
import type { AcademicYear, Idea, IdeaCategory } from '@/types/entity'

type IdeaRow = {
  idea: Idea
  category: IdeaCategory
  thumbsUp: number
  thumbsDown: number
  comments: number
  views: number
}

const ideaCategories: IdeaCategory[] = [
  {
    id: 1,
    name: 'Teaching & Learning',
    description: 'Classroom experience and learning outcomes',
    created_at: new Date('2025-09-01'),
  },
  {
    id: 2,
    name: 'Campus Services',
    description: 'Facilities, services, and operations',
    created_at: new Date('2025-09-01'),
  },
  {
    id: 3,
    name: 'Student Experience',
    description: 'Clubs, support, and wellbeing',
    created_at: new Date('2025-09-01'),
  },
]

const academicYears: AcademicYear[] = [
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

const initialIdeas: IdeaRow[] = [
  {
    idea: {
      id: 101,
      user_id: 12,
      academic_year_id: 1,
      title: 'Introduce peer-led lab sessions',
      content:
        'Create peer-led lab sessions to improve engagement in first-year modules.',
      is_anonymous: false,
      created_at: new Date('2026-01-10'),
    },
    category: ideaCategories[0],
    thumbsUp: 24,
    thumbsDown: 3,
    comments: 7,
    views: 156,
  },
  {
    idea: {
      id: 102,
      user_id: 18,
      academic_year_id: 1,
      title: 'Improve shuttle bus scheduling',
      content:
        'Extend shuttle bus service during evening hours and publish real-time updates.',
      is_anonymous: true,
      created_at: new Date('2026-01-22'),
    },
    category: ideaCategories[1],
    thumbsUp: 15,
    thumbsDown: 1,
    comments: 4,
    views: 98,
  },
  {
    idea: {
      id: 103,
      user_id: 7,
      academic_year_id: 1,
      title: 'Monthly wellbeing check-ins',
      content:
        'Run monthly wellbeing check-ins with counselors and peer mentors.',
      is_anonymous: false,
      created_at: new Date('2026-02-03'),
    },
    category: ideaCategories[2],
    thumbsUp: 31,
    thumbsDown: 2,
    comments: 11,
    views: 210,
  },
]

const ideaFormSchema = z.object({
  title: z.string().min(5, 'Title is required'),
  content: z.string().min(10, 'Content is required'),
  categoryId: z.string().min(1, 'Category is required'),
  isAnonymous: z.boolean().optional(),
  terms: z.literal(true, {
    errorMap: () => ({ message: 'You must accept the terms.' }),
  }),
})

type IdeaFormValues = z.infer<typeof ideaFormSchema>

const columnHelper = createColumnHelper<IdeaRow>()

export const IdeaListPage = () => {
  const { isNewIdeaModalOpen, closeNewIdeaModal } = useIdeaModalContext()
  const [ideas, setIdeas] = useState<IdeaRow[]>(() => [...initialIdeas])
  const [showFormModal, setShowFormModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [activeIdea, setActiveIdea] = useState<IdeaRow | null>(null)
  const [uploadFiles, setUploadFiles] = useState<File[] | undefined>([])

  const activeYear = academicYears[0]
  const isSubmissionClosed = new Date() > activeYear.submission_deadline
  const isFeedbackClosed = new Date() > activeYear.feedback_cut_off_deadline

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<IdeaFormValues>({
    resolver: zodResolver(ideaFormSchema),
    defaultValues: {
      title: '',
      content: '',
      categoryId: '',
      isAnonymous: false,
      terms: false,
    },
  })

  const categoryOptions = useMemo(
    () =>
      ideaCategories.map((category) => ({
        value: String(category.id),
        label: category.name,
      })),
    [],
  )

  const openNewIdeaForm = () => {
    setActiveIdea(null)
    setUploadFiles([])
    reset({
      title: '',
      content: '',
      categoryId: '',
      isAnonymous: false,
      terms: false,
    })
    setShowFormModal(true)
  }

  useEffect(() => {
    if (isNewIdeaModalOpen) {
      openNewIdeaForm()
      closeNewIdeaModal()
    }
  }, [isNewIdeaModalOpen, closeNewIdeaModal])

  const handleExportCsv = () => {
    const headers = [
      'ID',
      'Title',
      'Category',
      'Author',
      'Thumbs Up',
      'Thumbs Down',
      'Comments',
      'Views',
      'Submitted',
    ]

    const escapeValue = (value: string) => {
      if (value.includes('"') || value.includes(',') || value.includes('\n')) {
        return `"${value.replace(/"/g, '""')}"`
      }
      return value
    }

    const rows = ideas.map((row) => [
      String(row.idea.id),
      row.idea.title,
      row.category.name,
      row.idea.is_anonymous ? 'Anonymous' : `User #${row.idea.user_id}`,
      String(row.thumbsUp),
      String(row.thumbsDown),
      String(row.comments),
      String(row.views),
      row.idea.created_at.toLocaleDateString(),
    ])

    const csv = [headers, ...rows]
      .map((row) => row.map((value) => escapeValue(value)).join(','))
      .join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `ideas-report-${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const columns = useMemo(
    () => [
      columnHelper.accessor((row) => row.idea.title, {
        id: 'title',
        header: 'Idea',
        cell: ({ row }) => (
          <div>
            <div className="fw-semibold">{row.original.idea.title}</div>
            <div className="text-muted fs-xxs">{row.original.idea.content}</div>
          </div>
        ),
      }),
      columnHelper.accessor((row) => row.category.name, {
        id: 'category',
        header: 'Category',
        filterFn: 'equalsString',
        cell: ({ row }) => (
          <Badge bg="info-subtle" className="text-info">
            {row.original.category.name}
          </Badge>
        ),
      }),
      columnHelper.accessor((row) => row.idea.is_anonymous, {
        id: 'author',
        header: 'Author',
        cell: ({ row }) =>
          row.original.idea.is_anonymous ? (
            <Badge bg="secondary">Anonymous</Badge>
          ) : (
            `User #${row.original.idea.user_id}`
          ),
      }),
      columnHelper.accessor((row) => row.thumbsUp, {
        id: 'reactions',
        header: 'Reactions',
        cell: ({ row }) => (
          <div className="d-flex align-items-center gap-2">
            <span className="text-success d-inline-flex align-items-center gap-1">
              <TbThumbUp /> {row.original.thumbsUp}
            </span>
            <span className="text-danger d-inline-flex align-items-center gap-1">
              <TbThumbDown /> {row.original.thumbsDown}
            </span>
          </div>
        ),
      }),
      columnHelper.accessor((row) => row.comments, {
        id: 'comments',
        header: 'Comments',
      }),
      columnHelper.accessor((row) => row.views, {
        id: 'views',
        header: 'Views',
      }),
      columnHelper.accessor((row) => row.idea.created_at, {
        id: 'submitted',
        header: 'Submitted',
        cell: ({ row }) => row.original.idea.created_at.toLocaleDateString(),
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
                setActiveIdea(row.original)
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
                setActiveIdea(row.original)
                reset({
                  title: row.original.idea.title,
                  content: row.original.idea.content,
                  categoryId: String(row.original.category.id),
                  isAnonymous: row.original.idea.is_anonymous,
                  terms: true,
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
                setActiveIdea(row.original)
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
    const selectedCategory =
      ideaCategories.find(
        (category) => String(category.id) === data.categoryId,
      ) ?? ideaCategories[0]
    if (activeIdea) {
      setIdeas((prev) =>
        prev.map((row) =>
          row.idea.id === activeIdea.idea.id
            ? {
                ...row,
                idea: {
                  ...row.idea,
                  title: data.title,
                  content: data.content,
                  is_anonymous: !!data.isAnonymous,
                  updated_at: new Date(),
                },
                category: selectedCategory,
              }
            : row,
        ),
      )
    } else {
      const newIdea: Idea = {
        id: Date.now(),
        user_id: 99,
        academic_year_id: activeYear.id as number,
        title: data.title,
        content: data.content,
        is_anonymous: !!data.isAnonymous,
        created_at: new Date(),
      }
      setIdeas((prev) => [
        {
          idea: newIdea,
          category: selectedCategory,
          thumbsUp: 0,
          thumbsDown: 0,
          comments: 0,
          views: 0,
        },
        ...prev,
      ])
    }

    setUploadFiles([])
    setShowFormModal(false)
    setActiveIdea(null)
    reset({
      title: '',
      content: '',
      categoryId: '',
      isAnonymous: false,
      terms: false,
    })
  })

  const handleDelete = () => {
    if (!activeIdea) return
    setIdeas((prev) => prev.filter((row) => row.idea.id !== activeIdea.idea.id))
    setShowDeleteModal(false)
    setActiveIdea(null)
  }

  return (
    <Container fluid>
      <DashboardPage
        title="Ideas"
        subtitle="QA"
        actions={
          <Button
            variant="primary"
            onClick={openNewIdeaForm}
            disabled={isSubmissionClosed}
          >
            <TbPlus className="me-1" /> New Idea
          </Button>
        }
      >
        <CommonDataTable
          title="Idea Submissions"
          data={ideas}
          columns={columns}
          itemsName="ideas"
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
                placeholder="Search ideas..."
                className="app-search"
              />
              <SelectFilter
                value={
                  (columnFilters.find((filter) => filter.id === 'category')
                    ?.value as string) ?? ''
                }
                onChange={(value) =>
                  setColumnFilters([
                    ...columnFilters.filter(
                      (filter) => filter.id !== 'category',
                    ),
                    { id: 'category', value },
                  ])
                }
                options={categoryOptions}
                placeholder="All categories"
                icon={<LuTag />}
              />
            </>
          )}
          renderHeaderRight={() => (
            <>
              {isSubmissionClosed && (
                <Badge bg="warning-subtle" className="text-warning">
                  Submission closed
                </Badge>
              )}
              {isFeedbackClosed && (
                <Badge bg="secondary-subtle" className="text-secondary">
                  Comments closed
                </Badge>
              )}
              <Button
                variant="outline-primary"
                size="sm"
                className="d-inline-flex align-items-center gap-1"
                onClick={handleExportCsv}
              >
                <TbDownload /> Export CSV
              </Button>
            </>
          )}
        />
      </DashboardPage>

      <EntityFormModal
        show={showFormModal}
        title={activeIdea ? 'Edit Idea' : 'New Idea'}
        onHide={() => {
          setShowFormModal(false)
          setActiveIdea(null)
          setUploadFiles([])
        }}
        onSubmit={submitForm}
        submitLabel={activeIdea ? 'Update' : 'Create'}
      >
        <Form>
          <FormGroup className="mb-3">
            <FormLabel>Title</FormLabel>
            <FormControl
              type="text"
              isInvalid={!!errors.title}
              {...register('title')}
            />
            <div className="invalid-feedback">{errors.title?.message}</div>
          </FormGroup>
          <FormGroup className="mb-3">
            <FormLabel>Category</FormLabel>
            <FormControl
              as="select"
              isInvalid={!!errors.categoryId}
              {...register('categoryId')}
            >
              <option value="">Select category</option>
              {categoryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </FormControl>
            <div className="invalid-feedback">{errors.categoryId?.message}</div>
          </FormGroup>
          <FormGroup className="mb-3">
            <FormLabel>Idea Details</FormLabel>
            <FormControl
              as="textarea"
              rows={4}
              isInvalid={!!errors.content}
              {...register('content')}
            />
            <div className="invalid-feedback">{errors.content?.message}</div>
          </FormGroup>
          <FormGroup className="mb-3">
            <FormLabel>Attachments (optional)</FormLabel>
            <FileUploader
              setFiles={setUploadFiles}
              files={uploadFiles}
              maxFileCount={2}
            />
          </FormGroup>
          <FormGroup className="mb-2">
            <FormCheck
              type="checkbox"
              label="Submit anonymously"
              {...register('isAnonymous')}
            />
          </FormGroup>
          <FormGroup className="mb-2">
            <FormCheck
              type="checkbox"
              label="I agree to the Terms and Conditions"
              isInvalid={!!errors.terms}
              feedbackType="invalid"
              feedback={errors.terms?.message}
              {...register('terms')}
            />
          </FormGroup>
        </Form>
      </EntityFormModal>

      <EntityDetailModal
        show={showDetailModal}
        title="Idea Details"
        onHide={() => {
          setShowDetailModal(false)
          setActiveIdea(null)
        }}
      >
        {activeIdea && (
          <DetailFieldList
            items={[
              { label: 'Title', value: activeIdea.idea.title },
              { label: 'Category', value: activeIdea.category.name },
              { label: 'Content', value: activeIdea.idea.content },
              {
                label: 'Author',
                value: activeIdea.idea.is_anonymous
                  ? 'Anonymous'
                  : `User #${activeIdea.idea.user_id}`,
              },
              {
                label: 'Submitted',
                value: activeIdea.idea.created_at.toLocaleDateString(),
              },
              {
                label: 'Reactions',
                value: `+${activeIdea.thumbsUp} / -${activeIdea.thumbsDown}`,
              },
              { label: 'Comments', value: activeIdea.comments },
              { label: 'Views', value: activeIdea.views },
            ]}
          />
        )}
      </EntityDetailModal>

      <DeleteConfirmationModal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        selectedCount={1}
        itemName="idea"
      />
    </Container>
  )
}
