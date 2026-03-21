import { create } from 'zustand'
import axios from '@/lib/axios'
import toast from 'react-hot-toast'

interface CrudState<T> {
  items: T[]
  activeItem: T | any | null
  formValues: Partial<T>
  payload: any

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

    isLoading: false,
    error: null,

    // ================= CRUD =================

    fetchAll: async (params = '') => {
      set({ isLoading: true, error: null })
      try {
        const { data } = await axios.get(`${endpoint}${params}`)
        set({
          items: data?.data?.current_page === 1 ? data?.data?.data : data?.data,
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
        set({ activeItem: data?.data, formValues: data, isLoading: false })
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
        set((state) => ({
          items: [...state.items, data],
          isLoading: false,
          formValues: {},
        }))
        toast.success('Success')
      } catch (err: any) {
        toast.error('Something went wrong')
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

        set((state) => ({
          items: state.items.map((item) => (item.id === id ? data : item)),
          activeItem: data,
          formValues: data,
          isLoading: false,
        }))
        toast.success('Success')
      } catch (err: any) {
        toast.error('Something went wrong')
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
        toast.error('Something went wrong')
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
            access_token: res.data.access_token,
            refresh_token: res.data.refresh_token,
          }),
        )
        set({
          isLoading: false,
        })
      } catch (err: any) {
        toast.error('Something went wrong')
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
        error: null,
        isLoading: false,
      }),
  }))
