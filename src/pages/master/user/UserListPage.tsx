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
import type { Role, User } from '@/types/entity'

const userFormSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email is required'),
  roleId: z.string().min(1, 'Role is required'),
  departmentId: z.string().min(1, 'Department is required'),
  position: z.string().optional(),
})

type UserFormValues = z.infer<typeof userFormSchema>

const roles: Role[] = [
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

const initialUsers: User[] = [
  {
    id: 1001,
    role_id: 1,
    department_id: 1,
    name: 'Monica Fisher',
    email: 'monica.fisher@university.edu',
    password_hash: 'hash',
    position: 'QA Manager',
    created_at: new Date('2025-09-01'),
  },
  {
    id: 1002,
    role_id: 2,
    department_id: 2,
    name: 'Jordan Lee',
    email: 'jordan.lee@university.edu',
    password_hash: 'hash',
    position: 'QA Coordinator',
    created_at: new Date('2025-09-03'),
  },
  {
    id: 1003,
    role_id: 3,
    department_id: 3,
    name: 'Ella Patel',
    email: 'ella.patel@university.edu',
    password_hash: 'hash',
    position: 'Lecturer',
    created_at: new Date('2025-09-05'),
  },
]

const columnHelper = createColumnHelper<User>()

export const UserListPage = () => {
  const [users, setUsers] = useState<User[]>(() => [...initialUsers])
  const [showFormModal, setShowFormModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [activeUser, setActiveUser] = useState<User | null>(null)

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
      roleId: '',
      departmentId: '',
      position: '',
    },
  })

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', { header: 'Name' }),
      columnHelper.accessor('email', { header: 'Email' }),
      columnHelper.accessor('role_id', {
        header: 'Role',
        cell: ({ row }) =>
          roles.find((role) => Number(role.id) === row.original.role_id)
            ?.name ?? '—',
      }),
      columnHelper.accessor('department_id', {
        header: 'Department',
        cell: ({ row }) => `Department #${row.original.department_id}`,
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
                setActiveUser(row.original)
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
                setActiveUser(row.original)
                reset({
                  name: row.original.name,
                  email: row.original.email,
                  roleId: String(row.original.role_id),
                  departmentId: String(row.original.department_id),
                  position: row.original.position ?? '',
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
                setActiveUser(row.original)
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
    if (activeUser) {
      setUsers((prev) =>
        prev.map((item) =>
          item.id === activeUser.id
            ? {
                ...item,
                name: data.name,
                email: data.email,
                role_id: Number(data.roleId),
                department_id: Number(data.departmentId),
                position: data.position,
                updated_at: new Date(),
              }
            : item,
        ),
      )
    } else {
      setUsers((prev) => [
        {
          id: Date.now(),
          role_id: Number(data.roleId),
          department_id: Number(data.departmentId),
          name: data.name,
          email: data.email,
          password_hash: 'hash',
          position: data.position,
          created_at: new Date(),
        },
        ...prev,
      ])
    }

    reset({ name: '', email: '', roleId: '', departmentId: '', position: '' })
    setShowFormModal(false)
    setActiveUser(null)
  })

  const handleDelete = () => {
    if (!activeUser) return
    setUsers((prev) => prev.filter((item) => item.id !== activeUser.id))
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
                roleId: '',
                departmentId: '',
                position: '',
              })
              setShowFormModal(true)
            }}
          >
            <TbPlus className="me-1" /> New User
          </Button>
        }
      >
        <CommonDataTable
          title="Users"
          data={users}
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
      </DashboardPage>

      <EntityFormModal
        show={showFormModal}
        title={activeUser ? 'Edit User' : 'New User'}
        onHide={() => {
          setShowFormModal(false)
          setActiveUser(null)
        }}
        onSubmit={submitForm}
        submitLabel={activeUser ? 'Update' : 'Create'}
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
            <FormSelect isInvalid={!!errors.roleId} {...register('roleId')}>
              <option value="">Select role</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </FormSelect>
            <div className="invalid-feedback">{errors.roleId?.message}</div>
          </FormGroup>
          <FormGroup className="mb-3">
            <FormLabel>Department</FormLabel>
            <FormControl
              type="text"
              isInvalid={!!errors.departmentId}
              {...register('departmentId')}
            />
            <div className="invalid-feedback">
              {errors.departmentId?.message}
            </div>
          </FormGroup>
          <FormGroup>
            <FormLabel>Position</FormLabel>
            <FormControl type="text" {...register('position')} />
          </FormGroup>
        </Form>
      </EntityFormModal>

      <EntityDetailModal
        show={showDetailModal}
        title="User Details"
        onHide={() => {
          setShowDetailModal(false)
          setActiveUser(null)
        }}
      >
        {activeUser && (
          <DetailFieldList
            items={[
              { label: 'Name', value: activeUser.name },
              { label: 'Email', value: activeUser.email },
              {
                label: 'Role',
                value:
                  roles.find((role) => Number(role.id) === activeUser.role_id)
                    ?.name ?? '—',
              },
              {
                label: 'Department',
                value: `Department #${activeUser.department_id}`,
              },
              { label: 'Position', value: activeUser.position ?? '—' },
              {
                label: 'Created',
                value: activeUser.created_at.toLocaleDateString(),
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
