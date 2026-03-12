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
  FormSelect,
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
import TblSkeletonLoading from '@/components/TblSkeletonLoading'
import ApiHandlingProvider from '@/utils/ApiHandleProvider'
import type { User } from '@/types/entity'
import { useRegisterStore, useUserStore } from './store'
import { useRoleStore } from '../role/store'
import { useDepartmentStore } from '../department/store'

const userFormSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email is required'),
  role_id: z.coerce.number().min(1, 'Role is required'),
  department_id: z.coerce.number().min(1, 'Department is required'),
  position: z.string().optional(),
})

type UserFormValues = z.infer<typeof userFormSchema>

const columnHelper = createColumnHelper<User>()

export const UserListPage = () => {
  const { create: createRegister, setPayload: setPayloadRegister } =
    useRegisterStore()
  const {
    items,
    fetchAll,
    create,
    update,
    remove,
    setPayload,
    isLoading: isLoadingUser,
  } = useUserStore()

  const {
    items: itemsRole,
    fetchAll: fetchAllRole,
    isLoading: isLoadingRole,
  } = useRoleStore()

  const {
    items: itemsDepartment,
    fetchAll: fetchAllDepartment,
    isLoading: isLoadingDepartment,
  } = useDepartmentStore()

  const [showFormModal, setShowFormModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [activeUser, setActiveUser] = useState<User | null>(null)

  useEffect(() => {
    fetchAll()
    fetchAllRole()
    fetchAllDepartment()
  }, [])

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: '',
      email: '',
      role_id: 0,
      department_id: 0,
      position: '',
    },
  })

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', { header: 'Name' }),
      columnHelper.accessor('email', { header: 'Email' }),
      columnHelper.accessor('role', {
        header: 'Role',
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
                setActiveUser(row.original)
                setShowDetailModal(true)
              }}
            >
              <TbEye className="fs-lg" />
            </Button>
            {/* <Button
              variant="light"
              size="sm"
              className="btn-icon rounded-circle"
              onClick={() => {
                setActiveUser(row.original)
                reset({
                  name: row.original.name,
                  email: row.original.email,
                  role_id: row.original.role_id,
                  department_id: row.original.department_id,
                  position: row.original.position ?? '',
                })
                setShowFormModal(true)
              }}
            >
              <TbEdit className="fs-lg" />
            </Button> */}
            {/* <Button
              variant="danger"
              size="sm"
              className="btn-icon rounded-circle"
              onClick={() => {
                setActiveUser(row.original)
                setShowDeleteModal(true)
              }}
            >
              <TbTrash className="fs-lg" />
            </Button> */}
          </div>
        ),
      },
    ],
    [reset],
  )

  const submitForm = handleSubmit(async (data) => {
    setPayloadRegister({ ...data, password: 'password123' })
    if (activeUser?.id) {
      await update(activeUser.id)
    } else {
      await createRegister()
    }
    setShowFormModal(false)
    setActiveUser(null)
    reset()
    fetchAll()
  })

  const handleDelete = async () => {
    if (!activeUser?.id) return
    await remove(activeUser.id)
    setShowDeleteModal(false)
    setActiveUser(null)
  }

  return (
    <Container fluid>
      <DashboardPage
        title="Users"
        subtitle="Master"
        actions={
          <Button
            variant="primary"
            onClick={() => {
              setActiveUser(null)
              reset({
                name: '',
                email: '',
                role_id: 0,
                department_id: 0,
                position: '',
              })
              setShowFormModal(true)
            }}
          >
            <TbPlus className="me-1" /> New User
          </Button>
        }
      >
        <ApiHandlingProvider
          apiCalls={[isLoadingRole, isLoadingUser, isLoadingDepartment]}
          loadingComponent={<TblSkeletonLoading />}
        >
          <CommonDataTable
            title="Users List"
            data={items}
            columns={columns}
            itemsName="users"
            renderHeader={({ globalFilter, setGlobalFilter }) => (
              <SearchFilter
                value={globalFilter}
                onChange={setGlobalFilter}
                placeholder="Search users..."
              />
            )}
          />
        </ApiHandlingProvider>
      </DashboardPage>

      <EntityFormModal
        show={showFormModal}
        title={activeUser ? 'Edit User' : 'New User'}
        onHide={() => setShowFormModal(false)}
        onSubmit={submitForm}
        submitLabel={activeUser ? 'Update' : 'Create'}
        isSubmitting={isLoadingUser}
      >
        <Form>
          <FormGroup className="mb-3">
            <FormLabel>Name</FormLabel>
            <FormControl isInvalid={!!errors.name} {...register('name')} />
            <div className="invalid-feedback">{errors.name?.message}</div>
          </FormGroup>
          <FormGroup className="mb-3">
            <FormLabel>Email</FormLabel>
            <FormControl
              type="email"
              isInvalid={!!errors.email}
              {...register('email')}
            />
            <div className="invalid-feedback">{errors.email?.message}</div>
          </FormGroup>
          <FormGroup className="mb-3">
            <FormLabel>Role</FormLabel>
            <FormSelect isInvalid={!!errors.role_id} {...register('role_id')}>
              <option value="">Select role</option>
              {itemsRole.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </FormSelect>
            <div className="invalid-feedback">{errors.role_id?.message}</div>
          </FormGroup>
          <FormGroup className="mb-3">
            <FormLabel>Department ID</FormLabel>
            <FormSelect
              isInvalid={!!errors.department_id}
              {...register('department_id')}
            >
              <option value="">Select role</option>
              {itemsDepartment.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </FormSelect>

            <div className="invalid-feedback">
              {errors.department_id?.message}
            </div>
          </FormGroup>
          <FormGroup>
            <FormLabel>Position</FormLabel>
            <FormControl {...register('position')} />
          </FormGroup>
        </Form>
      </EntityFormModal>

      <EntityDetailModal
        show={showDetailModal}
        title="User Details"
        onHide={() => setShowDetailModal(false)}
      >
        {activeUser && (
          <DetailFieldList
            items={[
              { label: 'Name', value: activeUser.name },
              { label: 'Email', value: activeUser.email },
              {
                label: 'Role',
                value:
                  itemsRole.find((r) => r.id === activeUser.role_id)?.name ??
                  '—',
              },
              { label: 'Position', value: activeUser.position ?? '—' },
              {
                label: 'Created',
                value: activeUser.created_at
                  ? new Date(activeUser.created_at).toLocaleDateString()
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
        itemName="user"
      />
    </Container>
  )
}
