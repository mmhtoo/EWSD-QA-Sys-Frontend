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
import type { Permission } from '@/types/entity'

const permissionFormSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  description: z.string().optional(),
})

type PermissionFormValues = z.infer<typeof permissionFormSchema>

const initialPermissions: Permission[] = [
  {
    id: 1,
    name: 'idea:create',
    description: 'Create ideas',
    created_at: new Date('2025-09-01'),
  },
  {
    id: 2,
    name: 'idea:review',
    description: 'Review and moderate ideas',
    created_at: new Date('2025-09-01'),
  },
  {
    id: 3,
    name: 'report:resolve',
    description: 'Resolve content reports',
    created_at: new Date('2025-09-01'),
  },
]

const columnHelper = createColumnHelper<Permission>()

export const PermissionListPage = () => {
  const [permissions, setPermissions] = useState<Permission[]>(() => [
    ...initialPermissions,
  ])
  const [showFormModal, setShowFormModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [activePermission, setActivePermission] = useState<Permission | null>(
    null,
  )

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PermissionFormValues>({
    resolver: zodResolver(permissionFormSchema),
    defaultValues: { name: '', description: '' },
  })

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', { header: 'Permission' }),
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
                setActivePermission(row.original)
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
                setActivePermission(row.original)
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
                setActivePermission(row.original)
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
    if (activePermission) {
      setPermissions((prev) =>
        prev.map((item) =>
          item.id === activePermission.id
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
      setPermissions((prev) => [
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
    setActivePermission(null)
  })

  const handleDelete = () => {
    if (!activePermission) return
    setPermissions((prev) =>
      prev.filter((item) => item.id !== activePermission.id),
    )
    setShowDeleteModal(false)
    setActivePermission(null)
  }

  return (
    <Container fluid>
      <DashboardPage
        title="Permissions"
        subtitle="Master"
        actions={
          <Button
            variant="primary"
            onClick={() => {
              setActivePermission(null)
              reset({ name: '', description: '' })
              setShowFormModal(true)
            }}
          >
            <TbPlus className="me-1" /> New Permission
          </Button>
        }
      >
        <CommonDataTable
          title="Permissions"
          data={permissions}
          columns={columns}
          itemsName="permissions"
          renderHeader={({ globalFilter, setGlobalFilter }) => (
            <SearchFilter
              value={globalFilter}
              onChange={setGlobalFilter}
              placeholder="Search permissions..."
            />
          )}
        />
      </DashboardPage>

      <EntityFormModal
        show={showFormModal}
        title={activePermission ? 'Edit Permission' : 'New Permission'}
        onHide={() => {
          setShowFormModal(false)
          setActivePermission(null)
        }}
        onSubmit={submitForm}
        submitLabel={activePermission ? 'Update' : 'Create'}
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
        title="Permission Details"
        onHide={() => {
          setShowDetailModal(false)
          setActivePermission(null)
        }}
      >
        {activePermission && (
          <DetailFieldList
            items={[
              { label: 'Name', value: activePermission.name },
              {
                label: 'Description',
                value: activePermission.description || '—',
              },
              {
                label: 'Created',
                value: activePermission.created_at.toLocaleDateString(),
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
        itemName="permission"
      />
    </Container>
  )
}
