import { zodResolver } from '@hookform/resolvers/zod'
import { createColumnHelper } from '@tanstack/react-table'
import { useMemo, useState } from 'react'
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

const ideaCategoryFormSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  description: z.string().optional(),
})

type IdeaCategoryFormValues = z.infer<typeof ideaCategoryFormSchema>

const initialCategories: IdeaCategory[] = [
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

const usedCategoryIds = new Set([1, 2])

const columnHelper = createColumnHelper<IdeaCategory>()

export const IdeaCategoryListPage = () => {
  const [categories, setCategories] = useState<IdeaCategory[]>(() => [
    ...initialCategories,
  ])
  const [showFormModal, setShowFormModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [activeCategory, setActiveCategory] = useState<IdeaCategory | null>(
    null,
  )

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
        cell: ({ row }) => row.original.created_at.toLocaleDateString(),
      }),
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          const isUsed = usedCategoryIds.has(Number(row.original.id))
          return (
            <div className="d-flex gap-1 align-items-center">
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
              <Button
                variant="danger"
                size="sm"
                className="btn-icon rounded-circle"
                disabled={isUsed}
                onClick={() => {
                  setActiveCategory(row.original)
                  setShowDeleteModal(true)
                }}
              >
                <TbTrash className="fs-lg" />
              </Button>
              {isUsed && (
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

  const submitForm = handleSubmit((data) => {
    if (activeCategory) {
      setCategories((prev) =>
        prev.map((item) =>
          item.id === activeCategory.id
            ? {
                ...item,
                name: data.name,
                description: data.description,
                updated_at: new Date(),
              }
            : item,
        ),
      )
    } else {
      setCategories((prev) => [
        {
          id: Date.now(),
          name: data.name,
          description: data.description,
          created_at: new Date(),
        },
        ...prev,
      ])
    }

    reset({ name: '', description: '' })
    setShowFormModal(false)
    setActiveCategory(null)
  })

  const handleDelete = () => {
    if (!activeCategory) return
    setCategories((prev) =>
      prev.filter((item) => item.id !== activeCategory.id),
    )
    setShowDeleteModal(false)
    setActiveCategory(null)
  }

  return (
    <Container fluid>
      <DashboardPage
        title="Idea Categories"
        subtitle="Master"
        actions={
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
        }
      >
        <CommonDataTable
          title="Idea Categories"
          data={categories}
          columns={columns}
          itemsName="categories"
          renderHeader={({ globalFilter, setGlobalFilter }) => (
            <SearchFilter
              value={globalFilter}
              onChange={setGlobalFilter}
              placeholder="Search categories..."
            />
          )}
        />
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
                value: activeCategory.created_at.toLocaleDateString(),
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
