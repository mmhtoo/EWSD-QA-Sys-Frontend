'use client'

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
import { LuTag, LuCalendar } from 'react-icons/lu'
import { TbEdit, TbEye, TbPlus, TbTrash } from 'react-icons/tb'
import { z } from 'zod'

import FileUploader from '@/components/FileUploader'
import CommonDataTable from '@/components/common/CommonDataTable'
import DashboardPage from '@/components/common/DashboardPage'
import DeleteConfirmationModal from '@/components/table/DeleteConfirmationModal'
import DetailFieldList from '@/components/common/DetailFieldList'
import EntityDetailModal from '@/components/common/EntityDetailModal'
import EntityFormModal from '@/components/common/EntityFormModal'
import SearchFilter from '@/components/common/SearchFilter'

import { useIdeaSpecificStore, useIdeaStore } from './store'
import { useIdeaCategoryStore } from '../master/idea-category/store'
import { useAcademicYearStore } from '../master/academic-year/store'
import ApiHandlingProvider from '@/utils/ApiHandleProvider'
import TblSkeletonLoading from '@/components/TblSkeletonLoading'
import axios from '@/lib/axios'

// Schema matches your Form requirements
const ideaFormSchema = z.object({
  title: z.string().min(5, 'Title is required'),
  content: z.string().min(10, 'Content is required'),
  categoryId: z.string().min(1, 'Category is required'),
  academicYearId: z.string().min(1, 'Academic Year is required'),
  isAnonymous: z.boolean().optional(),
  terms: z.literal(true, {
    errorMap: () => ({ message: 'You must accept the terms.' }),
  }),
})

type IdeaFormValues = z.infer<typeof ideaFormSchema>

// The column helper now uses the flat Idea type
const columnHelper = createColumnHelper<any>()

export const IdeaListPage = () => {
  const [isSubmitLoading, setIsSubmitLoading] = useState(false)

  const {
    items,
    fetchAll,
    create,
    update,
    remove,
    setPayload,
    fetchById,
    isLoading: isLoadingIdea,
  } = useIdeaStore()
  const {
    items: categories,
    fetchAll: fetchCategories,
    isLoading: isLoadingCategories,
  } = useIdeaCategoryStore()
  const {
    items: academicYears,
    fetchAll: fetchAcademicYears,
    isLoading: isLoadingAcademicYear,
  } = useAcademicYearStore()

  const { showFormModal, setShowFormModal } = useIdeaSpecificStore()

  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [activeIdea, setActiveIdea] = useState<any | null>(null)
  const [uploadFiles, setUploadFiles] = useState<File[] | undefined>([])

  useEffect(() => {
    fetchAll()
    fetchCategories()
    fetchAcademicYears()
  }, [])

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
      academicYearId: '',
      isAnonymous: false,
      terms: true,
    },
  })

  const columns = useMemo(
    () => [
      columnHelper.accessor('title', {
        header: 'Idea',
        cell: ({ row }) => (
          <div>
            <div className="fw-semibold">{row.original.title}</div>
            <div
              className="text-muted fs-xxs text-truncate"
              style={{ maxWidth: '250px' }}
            >
              {row.original.content}
            </div>
          </div>
        ),
      }),
      columnHelper.accessor('idea_category_id', {
        header: 'Category',
        cell: ({ row }) => {
          const cat = categories?.find(
            (c) => c.id === row.original.idea_category_id,
          )
          return (
            <Badge bg="info-subtle" className="text-info">
              {cat?.name || 'N/A'}
            </Badge>
          )
        },
      }),
      columnHelper.accessor('user_info', {
        header: 'Author',
        cell: ({ row }) => (
          <span className="small text-muted">
            {row.original.is_annonymous
              ? 'Anonymous'
              : row.original.user_info?.name}
          </span>
        ),
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
                setActiveIdea(row.original)
                setShowDetailModal(true)
              }}
            >
              <TbEye />
            </Button>
            <Button
              variant="light"
              size="sm"
              className="btn-icon rounded-circle"
              onClick={() => {
                fetchById(row.original.id)
                setActiveIdea(row.original)
                reset({
                  title: row.original.title,
                  content: row.original.content,
                  categoryId: String(row.original.idea_category_id),
                  academicYearId: String(row.original.academic_year_id),
                  isAnonymous: !!row.original.is_annonymous,
                  terms: true,
                })
                setShowFormModal(true)
              }}
            >
              <TbEdit />
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
              <TbTrash />
            </Button>
          </div>
        ),
      },
    ],
    [categories, reset],
  )

  const submitForm = handleSubmit(async (data) => {
    try {
      let fileUrl = activeIdea?.fileUrl || ''

      if (uploadFiles && uploadFiles.length > 0) {
        const formData = new FormData()
        formData.append('file', uploadFiles[0])

        const uploadRes = await axios.post(`/ideas/file-upload`, formData)

        fileUrl = uploadRes.data.file_url
      }

      setPayload({
        ...data,
        academicYearId: undefined,
        categoryId: undefined,
        academic_year_id: Number(data.academicYearId),
        idea_category_id: Number(data.categoryId),
        fileUrl,
      })

      if (activeIdea?.id) {
        await update(activeIdea?.id)
      } else {
        await create()
      }

      setShowFormModal(false)
      setActiveIdea(null)
      setUploadFiles([])
      fetchAll()
    } catch (error) {
      console.error('Update failed:', error)
    } finally {
      setIsSubmitLoading(false)
    }
  })

  return (
    <Container fluid>
      <DashboardPage
        title="Ideas"
        subtitle="Portal"
        actions={
          <Button
            variant="primary"
            onClick={() => {
              setActiveIdea(null)
              setUploadFiles([])
              reset({
                title: '',
                content: '',
                categoryId: '',
                academicYearId: '',
                isAnonymous: false,
                terms: true,
              })
              setShowFormModal(true)
            }}
          >
            <TbPlus className="me-1" /> New Idea
          </Button>
        }
      >
        <ApiHandlingProvider
          apiCalls={[isLoadingIdea, isLoadingCategories]}
          loadingComponent={<TblSkeletonLoading />}
        >
          <CommonDataTable
            title="Submissions"
            data={items || []}
            columns={columns}
            // isLoading={isLoading}
            itemsName="ideas"
            renderHeader={({ globalFilter, setGlobalFilter }) => (
              <SearchFilter
                value={globalFilter}
                onChange={setGlobalFilter}
                placeholder="Search ideas..."
              />
            )}
          />
        </ApiHandlingProvider>
      </DashboardPage>

      {/* Form Modal */}
      <EntityFormModal
        show={showFormModal}
        title={activeIdea ? 'Edit Idea' : 'New Idea'}
        onHide={() => setShowFormModal(false)}
        onSubmit={submitForm}
        submitLabel={activeIdea ? 'Update' : 'Create'}
        isSubmitting={isSubmitLoading}
      >
        <Form>
          <Row>
            <Col md={12}>
              <FormGroup className="mb-3">
                <FormLabel>Title</FormLabel>
                <FormControl
                  type="text"
                  isInvalid={!!errors.title}
                  {...register('title')}
                />
              </FormGroup>
            </Col>
            <Col md={6}>
              <FormGroup className="mb-3">
                <FormLabel>
                  <LuTag /> Category
                </FormLabel>
                <Form.Select
                  isInvalid={!!errors.categoryId}
                  {...register('categoryId')}
                >
                  <option value="">Select Category</option>
                  {categories?.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Form.Select>
              </FormGroup>
            </Col>
            <Col md={6}>
              <FormGroup className="mb-3">
                <FormLabel>
                  <LuCalendar /> Academic Year
                </FormLabel>
                <Form.Select
                  isInvalid={!!errors.academicYearId}
                  {...register('academicYearId')}
                >
                  <option value="">Select Year</option>
                  {academicYears?.map((y) => (
                    <option key={y.id} value={y.id}>
                      {y.name}
                    </option>
                  ))}
                </Form.Select>
              </FormGroup>
            </Col>
            <Col md={12}>
              <FormGroup className="mb-3">
                <FormLabel>Content</FormLabel>
                <FormControl
                  as="textarea"
                  rows={4}
                  isInvalid={!!errors.content}
                  {...register('content')}
                />
              </FormGroup>
            </Col>
            <Col md={12}>
              <FormGroup className="mb-3">
                <FormLabel>Attachments</FormLabel>
                <FileUploader
                  files={uploadFiles}
                  setFiles={setUploadFiles}
                  maxFileCount={2}
                />
              </FormGroup>
            </Col>
          </Row>
          <FormCheck
            type="checkbox"
            label="Anonymous Submission"
            {...register('isAnonymous')}
            className="mb-2"
          />
          <FormCheck
            type="checkbox"
            label="I agree to Terms"
            isInvalid={!!errors.terms}
            {...register('terms')}
          />
        </Form>
      </EntityFormModal>

      {/* Detail Modal */}
      <EntityDetailModal
        show={showDetailModal}
        title="Idea Details"
        onHide={() => setShowDetailModal(false)}
      >
        {activeIdea && (
          <DetailFieldList
            items={[
              { label: 'Title', value: activeIdea.title },
              {
                label: 'Category',
                value:
                  categories?.find((c) => c.id === activeIdea.idea_category_id)
                    ?.name || 'N/A',
              },
              { label: 'Content', value: activeIdea.content },
              {
                label: 'Author',
                value: activeIdea.is_annonymous
                  ? 'Anonymous'
                  : activeIdea.user_info?.name || 'Unknown',
              },
              {
                label: 'Submitted',
                value: activeIdea.created_at
                  ? new Date(activeIdea.created_at).toLocaleDateString()
                  : 'N/A',
              },
              { label: 'Status', value: activeIdea.status },
            ]}
          />
        )}
      </EntityDetailModal>

      <DeleteConfirmationModal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        onConfirm={async () => {
          if (activeIdea?.id) await remove(activeIdea.id)
          setShowDeleteModal(false)
          fetchAll()
        }}
        selectedCount={1}
        itemName="idea"
      />
    </Container>
  )
}
