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
  Spinner,
} from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import { LuTag } from 'react-icons/lu'
import {
  TbEdit,
  TbEye,
  TbPlus,
  TbTrash,
  TbDownload,
  TbArchive,
} from 'react-icons/tb'
import { z } from 'zod'
import * as XLSX from 'xlsx'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'

import FileUploader from '@/components/FileUploader'
import CommonDataTableComponent from '@/components/common/CommonDataTable'
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
import { getMimeType } from '@/utils'
import Can from '@/components/Can'
import { useIdeaModalContext } from '@/context/useIdeaModalContext'

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
const columnHelper = createColumnHelper<any>()
const CommonDataTable = CommonDataTableComponent as any

export const IdeaListPage = () => {
  const [isSubmitLoading, setIsSubmitLoading] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [zipProcessingId, setZipProcessingId] = useState<number | null>(null)

  const ideaStore = useMemo(() => useIdeaStore(), [])

  const {
    items,
    fetchAll,
    create,
    update,
    remove,
    setPayload,
    fetchById,
    isLoading: isLoadingIdea,
  } = ideaStore()

  const {
    items: categories,
    fetchAll: fetchCategories,
    isLoading: isLoadingCategories,
  } = useIdeaCategoryStore()

  const { fetchAll: fetchAcademicYears } = useAcademicYearStore()
  const { showFormModal, setShowFormModal } = useIdeaSpecificStore()
  const { isNewIdeaModalOpen, closeNewIdeaModal } = useIdeaModalContext()

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
      isAnonymous: false,
      terms: true,
    },
  })

  useEffect(() => {
    if (!isNewIdeaModalOpen) return

    setActiveIdea(null)
    setUploadFiles([])
    reset({
      title: '',
      content: '',
      categoryId: '',
      isAnonymous: false,
      terms: true,
    })
    setShowFormModal(true)
  }, [isNewIdeaModalOpen, reset, setShowFormModal])

  const handleDownloadZip = async (rowItem: any) => {
    setZipProcessingId(rowItem.id)
    const zip = new JSZip()

    try {
      const commentRes = await axios.get(`/ideas/${rowItem.id}/comments`)
      const comments = commentRes.data?.data || []

      const reportRes = await axios.get(`/reports?idea_id=${rowItem.id}`)
      const reports = reportRes.data?.data || []

      const wb = XLSX.utils.book_new()

      const ideaDetail = [
        ['Field', 'Details'],
        ['ID', rowItem.id],
        ['Title', rowItem.title],
        ['Content', rowItem.content],
        ['Category', rowItem.idea_category || 'N/A'],
        [
          'Author',
          rowItem.is_annonymous ? 'Anonymous' : rowItem.user_info?.name,
        ],
        ['Status', rowItem.status || 'Active'],
        ['Main Attachment', rowItem.file_url ? 'Yes' : 'No'],
        ['Date', rowItem.created_at],
      ]
      const ws1 = XLSX.utils.aoa_to_sheet(ideaDetail)
      XLSX.utils.book_append_sheet(wb, ws1, 'Idea Details')

      const commentRows = comments.map((c: any) => ({
        Author:
          c.is_annonymous || c.is_anonymous
            ? 'Anonymous'
            : c.user_info?.name || 'Unknown',
        Comment: c.content,
        Date: c.created_at ? new Date(c.created_at).toLocaleString() : 'N/A',
        Attachment: c.file_url ? 'File included' : 'None',
      }))
      const ws2 = XLSX.utils.json_to_sheet(
        commentRows.length ? commentRows : [{ Message: 'No comments' }],
      )
      XLSX.utils.book_append_sheet(wb, ws2, 'Comments')

      const reportRows = reports.map((r: any) => ({
        Reporter: r.user_info?.name || 'Unknown',
        Reason: r.reason,
        Date: r.created_at ? new Date(r.created_at).toLocaleString() : 'N/A',
      }))
      const ws3 = XLSX.utils.json_to_sheet(
        reportRows.length ? reportRows : [{ Message: 'No reports' }],
      )
      XLSX.utils.book_append_sheet(wb, ws3, 'Reporting')

      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
      zip.file('idea_summary.xlsx', excelBuffer)

      const filesToDownload = []

      if (rowItem.file_url) {
        filesToDownload.push({
          url: rowItem.file_url,
          name: `idea_${rowItem.id}_main_attachment`,
        })
      }

      comments.forEach((c: any, index: number) => {
        if (c.file_url) {
          filesToDownload.push({
            url: c.file_url,
            name: `comment_${index + 1}_attachment`,
          })
        }
      })

      await Promise.all(
        filesToDownload.map(async (fileObj) => {
          try {
            const res = await fetch(fileObj.url)
            if (!res.ok) throw new Error('Network response was not ok')
            const blob = await res.blob()

            const extension =
              fileObj.url.split('.').pop()?.split(/\#|\?/)[0] || 'bin'
            zip.file(`${fileObj.name}.${extension}`, blob)
          } catch (e) {
            console.error('File download failed:', fileObj.url, e)
          }
        }),
      )

      const content = await zip.generateAsync({ type: 'blob' })
      saveAs(content, `Idea_${rowItem.id}_Package.zip`)
    } catch (error) {
      console.error('ZIP Generation Error:', error)
    } finally {
      setZipProcessingId(null)
    }
  }

  const handleExportExcel = () => {
    setIsExporting(true)
    try {
      const sortedItems = [...items].sort((a, b) => Number(a.id) - Number(b.id))

      const dataToExport = sortedItems.map((item) => ({
        ID: item.id,
        Title: item.title,
        Content: item.content,
        Category: item.idea_category || 'N/A',
        Author: item.is_anonymous
          ? 'Anonymous'
          : item.user_info?.name || 'Unknown',
        Status: item.status || 'Active',
        'Created At': item.created_at
          ? new Date(item.created_at).toLocaleDateString()
          : 'N/A',
      }))
      const worksheet = XLSX.utils.json_to_sheet(dataToExport)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Ideas')
      XLSX.writeFile(
        workbook,
        `Ideas_Export_${new Date().toISOString().split('T')[0]}.xlsx`,
      )
    } finally {
      setIsExporting(false)
    }
  }

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
        cell: ({ row }) => (
          <Badge bg="info-subtle" className="text-info">
            {row.original.idea_category || 'N/A'}
          </Badge>
        ),
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
        cell: ({ row }: any) => {
          return (
            <div className="d-flex gap-1">
              <Can perform="idea.export.zip">
                <Button
                  variant="light"
                  size="sm"
                  className="btn-icon rounded-circle text-primary"
                  onClick={() => handleDownloadZip(row.original)}
                  disabled={zipProcessingId === row.original.id}
                  title="Download ZIP"
                >
                  {zipProcessingId === row.original.id ? (
                    <Spinner size="sm" animation="border" />
                  ) : (
                    <TbArchive size={18} />
                  )}
                </Button>
              </Can>
              <Can perform="idea.view">
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
              </Can>

              {JSON.parse(localStorage.getItem('token')!)?.user.id ===
                row.original.user_info.id && (
                <Can perform="idea.update">
                  <Button
                    variant="light"
                    size="sm"
                    className="btn-icon rounded-circle"
                    onClick={async () => {
                      await fetchById(row.original.id)

                      const latestItem =
                        ideaStore.getState().activeItem || row.original
                      setActiveIdea(latestItem)

                      if (latestItem?.file_url) {
                        setUploadFiles([
                          {
                            name: 'Attachment',
                            type: getMimeType(latestItem.file_url),
                            preview: latestItem.file_url,
                            isExisting: true,
                          } as any,
                        ])
                      } else {
                        setUploadFiles([])
                      }

                      const selectedCategoryId = latestItem.category?.id
                        ? String(latestItem.category.id)
                        : String(latestItem.idea_category_id || '')

                      reset({
                        title: latestItem.title,
                        content: latestItem.content,
                        categoryId: selectedCategoryId,
                        isAnonymous: !!latestItem.is_annonymous,
                        terms: true,
                      })

                      setShowFormModal(true)
                    }}
                  >
                    <TbEdit />
                  </Button>
                </Can>
              )}

              {JSON.parse(localStorage.getItem('token')!)?.user.id ===
                row.original.user_info.id && (
                <Can perform="idea.delete">
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
                </Can>
              )}
            </div>
          )
        },
      },
    ],
    [categories, reset, fetchById, ideaStore, zipProcessingId],
  )

  const submitForm = handleSubmit(async (data) => {
    setIsSubmitLoading(true)
    try {
      let fileUrl = activeIdea?.file_url || ''
      if (uploadFiles && uploadFiles.length > 0) {
        const activeFile = uploadFiles[0] as any
        if (!activeFile.isExisting) {
          const formData = new FormData()
          formData.append('file', activeFile)
          const uploadRes = await axios.post(`/ideas/file-upload`, formData)
          fileUrl = uploadRes.data.file_url
        } else {
          fileUrl = activeFile.preview
        }
      }

      setPayload({
        ...data,
        idea_category_id: Number(data.categoryId),
        is_annonymous: data.isAnonymous,
        file_url: fileUrl,
      })

      if (activeIdea?.id) {
        await update(activeIdea.id)
      } else {
        await create()
      }

      setShowFormModal(false)
      closeNewIdeaModal()
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
          <div className="d-flex gap-2">
            <Can perform="idea.export.csv">
              <Button
                variant="outline-success"
                onClick={handleExportExcel}
                disabled={isExporting || !items?.length}
              >
                {isExporting ? (
                  <Spinner size="sm" className="me-1" />
                ) : (
                  <TbDownload className="me-1" />
                )}
                Export List
              </Button>
            </Can>
            <Can perform="idea.create">
              <Button
                variant="primary"
                onClick={() => {
                  setActiveIdea(null)
                  setUploadFiles([])
                  reset({
                    title: '',
                    content: '',
                    categoryId: '',
                    isAnonymous: false,
                    terms: true,
                  })
                  setShowFormModal(true)
                }}
              >
                <TbPlus className="me-1" /> New Idea
              </Button>
            </Can>
          </div>
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
            itemsName="ideas"
            renderHeader={(ctx: any) => (
              <SearchFilter
                value={ctx.globalFilter}
                onChange={ctx.setGlobalFilter}
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
        onHide={() => {
          setShowFormModal(false)
          closeNewIdeaModal()
        }}
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
            <Col md={12}>
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
                  maxFileCount={1}
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
