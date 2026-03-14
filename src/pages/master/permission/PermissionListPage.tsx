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
import { usePermissionStore } from './store'
import ApiHandlingProvider from '@/utils/ApiHandleProvider'
import TblSkeletonLoading from '@/components/TblSkeletonLoading'

const permissionFormSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  description: z.string().optional(),
})

type PermissionFormValues = z.infer<typeof permissionFormSchema>

const columnHelper = createColumnHelper<Permission>()

export const PermissionListPage = () => {
  const { items, fetchAll, create, update, remove, setPayload, isLoading } =
    usePermissionStore()

  const [showFormModal, setShowFormModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [activePermission, setActivePermission] = useState<Permission | null>(
    null,
  )

  useEffect(() => {
    fetchAll()
  }, [])

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

  const submitForm = handleSubmit(async (data) => {
    setPayload(data)

    if (activePermission?.id) {
      await update(activePermission.id)
    } else {
      await create()
    }

    setShowFormModal(false)
    setActivePermission(null)
    reset({ name: '', description: '' })

    fetchAll()
  })

  const handleDelete = async () => {
    if (!activePermission?.id) return
    await remove(activePermission.id)
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
        <ApiHandlingProvider
          apiCalls={[isLoading]}
          loadingComponent={<TblSkeletonLoading />}
        >
          <CommonDataTable
            title="Permissions"
            data={items}
            columns={columns}
            // loading={isLoading}
            itemsName="permissions"
            renderHeader={({ globalFilter, setGlobalFilter }) => (
              <SearchFilter
                value={globalFilter}
                onChange={setGlobalFilter}
                placeholder="Search permissions..."
              />
            )}
          />
        </ApiHandlingProvider>
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
        isSubmitting={isLoading}
      >
        <Form>
          <FormGroup className="mb-3">
            <FormLabel>Name</FormLabel>
            <FormControl
              type="text"
              isInvalid={!!errors.name}
              {...register('name')}
              placeholder="e.g., idea:create"
            />
            <div className="invalid-feedback">{errors.name?.message}</div>
          </FormGroup>
          <FormGroup>
            <FormLabel>Description</FormLabel>
            <FormControl
              as="textarea"
              rows={3}
              {...register('description')}
              placeholder="Describe what this permission allows..."
            />
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
                value: activePermission.created_at
                  ? new Date(activePermission.created_at).toLocaleDateString()
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
        itemName="permission"
      />
    </Container>
  )
}
