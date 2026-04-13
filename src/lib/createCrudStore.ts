import { create } from 'zustand'
import axios from '@/lib/axios'
import toast from 'react-hot-toast'

interface CrudState<T> {
  items: T[]
  activeItem: T | any | null
  formValues: Partial<T>
  payload: any
  pagination: {
    current_page: number
    per_page: number
    total: number
    last_page: number
  } | null

  isLoading: boolean
  error: string | null

  // CRUD
  fetchAll: (params?: string) => Promise<void>
  fetchById: (id: string | number) => Promise<void>
  create: (params?: string) => Promise<void>
  update: (id: string | number, params?: string) => Promise<void>
  remove: (id: string | number) => Promise<void>
  fetchRefreshToken: () => Promise<void>

  // Form helpers
  setFormValues: (values: Partial<T>) => void
  setPayload: (data: any) => void
  setField: <K extends keyof T>(key: K, value: T[K]) => void
  resetForm: () => void

  reset: () => void
}

export const createCrudStore = <T extends { id?: string | number }>(
  endpoint: string,
) =>
  create<CrudState<T>>((set, get) => ({
    items: [],
    activeItem: null,
    formValues: {},
    payload: null,
    pagination: null,

    isLoading: false,
    error: null,

    // ================= CRUD =================

    fetchAll: async (params = '') => {
      set({ isLoading: true, error: null })
      try {
        const { data } = await axios.get(`${endpoint}${params}`)

        const collection = Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.data?.data)
            ? data.data.data
            : Array.isArray(data)
              ? data
              : []

        const pagination = data?.pagination
          ? {
              current_page: Number(data.pagination.current_page || 1),
              per_page: Number(data.pagination.per_page || 10),
              total: Number(data.pagination.total || collection.length),
              last_page: Number(data.pagination.last_page || 1),
            }
          : null

        let allItems = collection

        const hasExplicitPage = /(^|[?&])page=/.test(params)
        if (
          pagination &&
          !hasExplicitPage &&
          pagination.last_page > 1 &&
          pagination.current_page === 1
        ) {
          const extraRequests = Array.from(
            { length: pagination.last_page - 1 },
            (_, index) => {
              const page = index + 2
              const separator = params.includes('?') ? '&' : '?'
              const pageParams = `${params}${separator}page=${page}&per_page=${pagination.per_page}`
              return axios.get(`${endpoint}${pageParams}`)
            },
          )

          const extraResponses = await Promise.all(extraRequests)

          const extraItems = extraResponses.flatMap((response) => {
            const payload = response.data
            if (Array.isArray(payload?.data)) return payload.data
            if (Array.isArray(payload?.data?.data)) return payload.data.data
            if (Array.isArray(payload)) return payload
            return []
          })

          allItems = [...collection, ...extraItems]
        }

        set({
          items: allItems,
          pagination,
          isLoading: false,
        })
      } catch (err: any) {
        set({
          error: err?.response?.data?.message || err.message,
          isLoading: false,
        })
      }
    },

    fetchById: async (id) => {
      set({ isLoading: true, error: null })
      try {
        const { data } = await axios.get(`${endpoint}/${id}`)
        const entity = data?.data ?? data
        set({ activeItem: entity, formValues: entity, isLoading: false })
      } catch (err: any) {
        set({
          error: err?.response?.data?.message || err.message,
          isLoading: false,
        })
      }
    },

    create: async (params = '') => {
      set({ isLoading: true, error: null })
      try {
        const { data } = await axios.post(`${endpoint}${params}`, get().payload)
        const createdItem = data?.data ?? data
        set((state) => ({
          items:
            createdItem && typeof createdItem === 'object'
              ? [...state.items, createdItem]
              : state.items,
          isLoading: false,
          formValues: {},
        }))
        toast.success('Success')
      } catch (err: any) {
        toast.error(err?.response?.data?.message || 'Something went wrong')
        set({
          error: err?.response?.data?.message || err.message,
          isLoading: false,
        })
      }
    },

    update: async (id, params = '') => {
      set({ isLoading: true, error: null })
      try {
        const { data } = await axios.patch(
          `${endpoint}/${id}${params}`,
          get().payload,
        )

        const updatedItem = data?.data ?? data

        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? updatedItem : item,
          ),
          activeItem: updatedItem,
          formValues: updatedItem,
          isLoading: false,
        }))
        toast.success('Success')
      } catch (err: any) {
        toast.error(err?.response?.data?.message || 'Something went wrong')
        set({
          error: err?.response?.data?.message || err.message,
          isLoading: false,
        })
      }
    },

    remove: async (id) => {
      set({ isLoading: true, error: null })
      try {
        await axios.delete(`${endpoint}/${id}`)
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
          isLoading: false,
        }))
        toast.success('Success')
      } catch (err: any) {
        toast.error(err?.response?.data?.message || 'Something went wrong')
        set({
          error: err?.response?.data?.message || err.message,
          isLoading: false,
        })
      }
    },

    fetchRefreshToken: async () => {
      set({ isLoading: true, error: null })

      try {
        const refresh_token = JSON.parse(
          localStorage.getItem('token')!,
        )?.refresh_token

        const res = await axios.post('/auth/refresh-token', { refresh_token })

        const oldStorage = JSON.parse(localStorage.getItem('token')!)

        localStorage.setItem(
          'token',
          JSON.stringify({
            ...oldStorage,
            user: {
              ...oldStorage.user,
              permissions: res.data.user.permissions,
            },
            access_token: res.data.access_token,
            refresh_token: res.data.refresh_token,
          }),
        )
        set({
          isLoading: false,
        })
      } catch (err: any) {
        toast.error(err?.response?.data?.message || 'Something went wrong')
        set({
          error: err?.response?.data?.message || err.message,
          isLoading: false,
        })
      }
    },

    // ================= FORM =================

    setFormValues: (values) =>
      set((state) => ({
        formValues: { ...state.formValues, ...values },
      })),

    setPayload: (data) => set({ payload: data }),

    setField: (key, value) =>
      set((state) => ({
        formValues: {
          ...state.formValues,
          [key]: value,
        },
      })),

    resetForm: () => set({ formValues: {} }),

    reset: () =>
      set({
        items: [],
        activeItem: null,
        formValues: {},
        pagination: null,
        error: null,
        isLoading: false,
      }),
  }))
