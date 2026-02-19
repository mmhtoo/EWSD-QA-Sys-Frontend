import { zodResolver } from '@hookform/resolvers/zod'
import { createColumnHelper } from '@tanstack/react-table'
import { useMemo, useState } from 'react'
import {
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
import type { Department } from '@/types/entity'

const departmentFormSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  description: z.string().optional(),
})

type DepartmentFormValues = z.infer<typeof departmentFormSchema>

const initialDepartments: Department[] = [
  {
    id: 1,
    name: 'Engineering',
    description: 'Engineering and Technology',
    created_at: new Date('2025-09-01'),
  },
  {
    id: 2,
    name: 'Business',
    description: 'Business and Management',
    created_at: new Date('2025-09-01'),
  },
  {
    id: 3,
    name: 'Arts',
    description: 'Arts and Humanities',
    created_at: new Date('2025-09-01'),
  },
]

const columnHelper = createColumnHelper<Department>()

export const DepartmentListPage = () => {
  const [departments, setDepartments] = useState<Department[]>(() => [
    ...initialDepartments,
  ])
  const [showFormModal, setShowFormModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [activeDepartment, setActiveDepartment] = useState<Department | null>(
    null,
  )

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DepartmentFormValues>({
    resolver: zodResolver(departmentFormSchema),
    defaultValues: { name: '', description: '' },
  })

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', { header: 'Department' }),
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
        cell: ({ row }) => (
          <div className="d-flex gap-1">
            <Button
              variant="light"
              size="sm"
              className="btn-icon rounded-circle"
              onClick={() => {
                setActiveDepartment(row.original)
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
                setActiveDepartment(row.original)
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
              onClick={() => {
                setActiveDepartment(row.original)
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
    if (activeDepartment) {
      setDepartments((prev) =>
        prev.map((item) =>
          item.id === activeDepartment.id
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
      setDepartments((prev) => [
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
    setActiveDepartment(null)
  })

  const handleDelete = () => {
    if (!activeDepartment) return
    setDepartments((prev) =>
      prev.filter((item) => item.id !== activeDepartment.id),
    )
    setShowDeleteModal(false)
    setActiveDepartment(null)
  }

  return (
    <Container fluid>
      <DashboardPage
        title="Departments"
        subtitle="Master"
        actions={
          <Button
            variant="primary"
            onClick={() => {
              setActiveDepartment(null)
              reset({ name: '', description: '' })
              setShowFormModal(true)
            }}
          >
            <TbPlus className="me-1" /> New Department
          </Button>
        }
      >
        <CommonDataTable
          title="Departments"
          data={departments}
          columns={columns}
          itemsName="departments"
          renderHeader={({ globalFilter, setGlobalFilter }) => (
            <SearchFilter
              value={globalFilter}
              onChange={setGlobalFilter}
              placeholder="Search departments..."
            />
          )}
        />
      </DashboardPage>

      <EntityFormModal
        show={showFormModal}
        title={activeDepartment ? 'Edit Department' : 'New Department'}
        onHide={() => {
          setShowFormModal(false)
          setActiveDepartment(null)
        }}
        onSubmit={submitForm}
        submitLabel={activeDepartment ? 'Update' : 'Create'}
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
        title="Department Details"
        onHide={() => {
          setShowDetailModal(false)
          setActiveDepartment(null)
        }}
      >
        {activeDepartment && (
          <DetailFieldList
            items={[
              { label: 'Name', value: activeDepartment.name },
              {
                label: 'Description',
                value: activeDepartment.description || '—',
              },
              {
                label: 'Created',
                value: activeDepartment.created_at.toLocaleDateString(),
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
        itemName="department"
      />
    </Container>
  )
}
