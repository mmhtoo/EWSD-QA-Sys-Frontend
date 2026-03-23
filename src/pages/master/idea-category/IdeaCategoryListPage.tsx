'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { createColumnHelper } from '@tanstack/react-table'
import { useMemo, useState, useEffect } from 'react'
import {
  Badge,
  Button,
  Container,
  Form,
  FormControl,
  FormGroup,
  FormLabel,
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
import type { IdeaCategory } from '@/types/entity'
import { useIdeaCategoryStore } from './store'
import ApiHandlingProvider from '@/utils/ApiHandleProvider'
import TblSkeletonLoading from '@/components/TblSkeletonLoading'
import Can from '@/components/Can'

const ideaCategoryFormSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  description: z.string().optional(),
})

type IdeaCategoryFormValues = z.infer<typeof ideaCategoryFormSchema>

const columnHelper = createColumnHelper<IdeaCategory>()

export const IdeaCategoryListPage = () => {
  const { items, fetchAll, create, update, remove, setPayload, isLoading } =
    useIdeaCategoryStore()

  const [showFormModal, setShowFormModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [activeCategory, setActiveCategory] = useState<IdeaCategory | null>(
    null,
  )

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<IdeaCategoryFormValues>({
    resolver: zodResolver(ideaCategoryFormSchema),
    defaultValues: { name: '', description: '' },
  })

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', { header: 'Category' }),
      columnHelper.accessor('description', {
        header: 'Description',
        cell: ({ row }) => row.original.description || '—',
      }),
      columnHelper.accessor('created_at', {
        header: 'Created',
        cell: ({ row }) => {
          const date = row.original.created_at
          return date ? new Date(date).toLocaleDateString() : '—'
        },
      }),
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }: any) => {
          return (
            <div className="d-flex gap-1 align-items-center">
              <Can perform="idea.categories.manage">
                <Button
                  variant="light"
                  size="sm"
                  className="btn-icon rounded-circle"
                  onClick={() => {
                    setActiveCategory(row.original)
                    setShowDetailModal(true)
                  }}
                >
                  <TbEye className="fs-lg" />
                </Button>
              </Can>
              <Can perform="idea.categories.manage">
                <Button
                  variant="light"
                  size="sm"
                  className="btn-icon rounded-circle"
                  onClick={() => {
                    setActiveCategory(row.original)
                    reset({
                      name: row.original.name,
                      description: row.original.description ?? '',
                    })
                    setShowFormModal(true)
                  }}
                >
                  <TbEdit className="fs-lg" />
                </Button>
              </Can>
              <Can perform="idea.categories.manage">
                <Button
                  variant="danger"
                  size="sm"
                  className="btn-icon rounded-circle"
                  disabled={row.original.is_in_use}
                  onClick={() => {
                    setActiveCategory(row.original)
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
              </Can>
            </div>
          )
        },
      },
    ],
    [reset],
  )

  const submitForm = handleSubmit(async (data) => {
    setPayload(data)

    if (activeCategory?.id) {
      await update(activeCategory.id)
    } else {
      await create()
    }

    setShowFormModal(false)
    setActiveCategory(null)
    reset({ name: '', description: '' })
    fetchAll()
  })

  const handleDelete = async () => {
    if (!activeCategory?.id) return
    await remove(activeCategory.id)
    setShowDeleteModal(false)
    setActiveCategory(null)
  }

  return (
    <Container fluid>
      <DashboardPage
        title="Idea Categories"
        subtitle="Master"
        actions={
          <Can perform="idea.categories.manage">
            <Button
              variant="primary"
              onClick={() => {
                setActiveCategory(null)
                reset({ name: '', description: '' })
                setShowFormModal(true)
              }}
            >
              <TbPlus className="me-1" /> New Category
            </Button>
          </Can>
        }
      >
        <ApiHandlingProvider
          apiCalls={[isLoading]}
          loadingComponent={<TblSkeletonLoading />}
        >
          <CommonDataTable
            title="Idea Categories"
            data={items}
            columns={columns}
            // loading={isLoading}
            itemsName="categories"
            renderHeader={({ globalFilter, setGlobalFilter }) => (
              <SearchFilter
                value={globalFilter}
                onChange={setGlobalFilter}
                placeholder="Search categories..."
              />
            )}
          />
        </ApiHandlingProvider>
      </DashboardPage>

      <EntityFormModal
        show={showFormModal}
        title={activeCategory ? 'Edit Category' : 'New Category'}
        onHide={() => {
          setShowFormModal(false)
          setActiveCategory(null)
        }}
        onSubmit={submitForm}
        submitLabel={activeCategory ? 'Update' : 'Create'}
        isSubmitting={isLoading}
      >
        <Form>
          <FormGroup className="mb-3">
            <FormLabel>Name</FormLabel>
            <FormControl
              type="text"
              isInvalid={!!errors.name}
              {...register('name')}
            />
            <div className="invalid-feedback">{errors.name?.message}</div>
          </FormGroup>
          <FormGroup>
            <FormLabel>Description</FormLabel>
            <FormControl as="textarea" rows={3} {...register('description')} />
          </FormGroup>
        </Form>
      </EntityFormModal>

      <EntityDetailModal
        show={showDetailModal}
        title="Category Details"
        onHide={() => {
          setShowDetailModal(false)
          setActiveCategory(null)
        }}
      >
        {activeCategory && (
          <DetailFieldList
            items={[
              { label: 'Name', value: activeCategory.name },
              {
                label: 'Description',
                value: activeCategory.description || '—',
              },
              {
                label: 'Created',
                value: activeCategory.created_at
                  ? new Date(activeCategory.created_at).toLocaleDateString()
                  : '—',
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
        itemName="category"
      />
    </Container>
  )
}
