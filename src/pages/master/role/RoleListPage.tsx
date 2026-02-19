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

import DetailFieldList from '@/components/common/DetailFieldList'
import CommonDataTable from '@/components/common/CommonDataTable'
import DashboardPage from '@/components/common/DashboardPage'
import EntityDetailModal from '@/components/common/EntityDetailModal'
import EntityFormModal from '@/components/common/EntityFormModal'
import SearchFilter from '@/components/common/SearchFilter'
import DeleteConfirmationModal from '@/components/table/DeleteConfirmationModal'
import type { Role } from '@/types/entity'

const roleFormSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  description: z.string().optional(),
})

type RoleFormValues = z.infer<typeof roleFormSchema>

const initialRoles: Role[] = [
  {
    id: 1,
    name: 'QA Manager',
    description: 'Oversees QA workflow',
    created_at: new Date('2025-09-01'),
  },
  {
    id: 2,
    name: 'QA Coordinator',
    description: 'Department coordinator',
    created_at: new Date('2025-09-01'),
  },
  {
    id: 3,
    name: 'Staff',
    description: 'Academic and support staff',
    created_at: new Date('2025-09-01'),
  },
]

const columnHelper = createColumnHelper<Role>()

export const RoleListPage = () => {
  const [roles, setRoles] = useState<Role[]>(() => [...initialRoles])
  const [showFormModal, setShowFormModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [activeRole, setActiveRole] = useState<Role | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RoleFormValues>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: { name: '', description: '' },
  })

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', { header: 'Role' }),
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
                setActiveRole(row.original)
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
                setActiveRole(row.original)
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
                setActiveRole(row.original)
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
    if (activeRole) {
      setRoles((prev) =>
        prev.map((item) =>
          item.id === activeRole.id
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
      setRoles((prev) => [
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
    setActiveRole(null)
  })

  const handleDelete = () => {
    if (!activeRole) return
    setRoles((prev) => prev.filter((item) => item.id !== activeRole.id))
    setShowDeleteModal(false)
    setActiveRole(null)
  }

  return (
    <Container fluid>
      <DashboardPage
        title="Roles"
        subtitle="Master"
        actions={
          <Button
            variant="primary"
            onClick={() => {
              setActiveRole(null)
              reset({ name: '', description: '' })
              setShowFormModal(true)
            }}
          >
            <TbPlus className="me-1" /> New Role
          </Button>
        }
      >
        <CommonDataTable
          title="Roles"
          data={roles}
          columns={columns}
          itemsName="roles"
          renderHeader={({ globalFilter, setGlobalFilter }) => (
            <SearchFilter
              value={globalFilter}
              onChange={setGlobalFilter}
              placeholder="Search roles..."
            />
          )}
        />
      </DashboardPage>

      <EntityFormModal
        show={showFormModal}
        title={activeRole ? 'Edit Role' : 'New Role'}
        onHide={() => {
          setShowFormModal(false)
          setActiveRole(null)
        }}
        onSubmit={submitForm}
        submitLabel={activeRole ? 'Update' : 'Create'}
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
        title="Role Details"
        onHide={() => {
          setShowDetailModal(false)
          setActiveRole(null)
        }}
      >
        {activeRole && (
          <DetailFieldList
            items={[
              { label: 'Name', value: activeRole.name },
              { label: 'Description', value: activeRole.description || '—' },
              {
                label: 'Created',
                value: activeRole.created_at.toLocaleDateString(),
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
        itemName="role"
      />
    </Container>
  )
}
