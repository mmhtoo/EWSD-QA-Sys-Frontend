'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { createColumnHelper } from '@tanstack/react-table'
import { useMemo, useState, useEffect } from 'react'
import {
  Button,
  Container,
  Form,
  FormControl,
  FormGroup,
  FormLabel,
  Row,
  Col,
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
import { useRolePermissionAttachStore, useRoleStore } from './store'
import { usePermissionStore } from '../permission/store'
import ApiHandlingProvider from '@/utils/ApiHandleProvider'
import TblSkeletonLoading from '@/components/TblSkeletonLoading'

const roleFormSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  description: z.string().optional(),
  permissions: z.array(z.string()).default([]),
})

type RoleFormValues = z.infer<typeof roleFormSchema>

const columnHelper = createColumnHelper<Role>()

export const RoleListPage = () => {
  const {
    items: permissionItem,
    fetchAll: fetchAllPermission,
    isLoading: isLoadingPermission,
  } = usePermissionStore()

  const {
    items,
    fetchAll,
    create,
    update,
    remove,
    setPayload,
    fetchById,
    isLoading: isLoadingRole,
    activeItem,
  } = useRoleStore()

  const {
    create: rolePermissionAttachStore,
    setPayload: setPayloadForRolePermissionAttach,
    isLoading: isLoadingRolePermissionAttach,
  } = useRolePermissionAttachStore()

  const [showFormModal, setShowFormModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [activeRole, setActiveRole] = useState<Role | null>(null)

  useEffect(() => {
    fetchAll()
    fetchAllPermission()
  }, [fetchAll, fetchAllPermission])

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RoleFormValues>({
    resolver: zodResolver(roleFormSchema) as never,
    defaultValues: { name: '', description: '', permissions: [] },
  })

  useEffect(() => {
    if (activeItem && showFormModal) {
      reset({
        name: activeItem.name,
        description: activeItem.description ?? '',
        permissions: activeItem.permissions?.map((p: any) => p.name) || [],
      })
    }
  }, [activeItem, reset, showFormModal])

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', { header: 'Role' }),
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
        cell: ({ row }: any) => (
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
              onClick={async () => {
                setActiveRole(row.original)
                await fetchById(row.original.id)
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
    [fetchById],
  )

  const submitForm = handleSubmit(async (data) => {
    setPayload({
      name: data.name,
      description: data.description,
    })

    let roleId = activeRole?.id

    if (roleId) {
      await update(roleId)
    } else {
      const res: any = await create()
      roleId = res?.id
    }

    if (roleId) {
      setPayloadForRolePermissionAttach({
        role: roleId,
        permissions: data.permissions,
      })
      await rolePermissionAttachStore()
    }

    setShowFormModal(false)
    setActiveRole(null)
    reset({ name: '', description: '', permissions: [] })
    fetchAll()
  })

  const handleDelete = async () => {
    if (!activeRole?.id) return
    await remove(activeRole.id)
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
              reset({ name: '', description: '', permissions: [] })
              setShowFormModal(true)
            }}
          >
            <TbPlus className="me-1" /> New Role
          </Button>
        }
      >
        <ApiHandlingProvider
          apiCalls={[
            isLoadingPermission,
            isLoadingRole,
            isLoadingRolePermissionAttach,
          ]}
          loadingComponent={<TblSkeletonLoading />}
        >
          <CommonDataTable
            title="Roles"
            data={items}
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
        </ApiHandlingProvider>
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
        isSubmitting={isLoadingRole}
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

          <FormGroup className="mb-3">
            <FormLabel>Description</FormLabel>
            <FormControl as="textarea" rows={2} {...register('description')} />
          </FormGroup>

          <FormGroup>
            <FormLabel className="fw-bold text-primary">
              Assign Permissions
            </FormLabel>
            <div
              className="border rounded p-3 bg-light"
              style={{ maxHeight: '200px', overflowY: 'auto' }}
            >
              {permissionItem && permissionItem.length > 0 ? (
                <Row>
                  {permissionItem.map((perm: any) => (
                    <Col xs={12} key={perm.id} className="mb-2">
                      <Form.Check
                        type="checkbox"
                        id={`perm-${perm.id}`}
                        label={perm.name}
                        value={perm.name}
                        {...register('permissions')}
                      />
                    </Col>
                  ))}
                </Row>
              ) : (
                <div className="text-center text-muted py-2 small">
                  No permissions available
                </div>
              )}
            </div>
          </FormGroup>
        </Form>
      </EntityFormModal>

      {/* Details and Delete Modals stay the same */}
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
                value: activeRole.created_at
                  ? new Date(activeRole.created_at).toLocaleDateString()
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
        itemName="role"
      />
    </Container>
  )
}
