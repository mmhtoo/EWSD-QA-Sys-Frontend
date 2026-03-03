import { create } from 'zustand'
import axios from '@/lib/axios'
import toast from 'react-hot-toast'

interface CrudState<T> {
  items: T[]
  activeItem: T | null
  formValues: Partial<T>
  payload: any

  isLoading: boolean
  error: string | null

  // CRUD
  fetchAll: () => Promise<void>
  fetchById: (id: string | number) => Promise<void>
  create: () => Promise<void>
  update: (id: string | number) => Promise<void>
  remove: (id: string | number) => Promise<void>

  // Form helpers
  setFormValues: (values: Partial<T>) => void
  setPayload: (data: any) => void
  setField: <K extends keyof T>(key: K, value: T[K]) => void
  resetForm: () => void

  reset: () => void
}

export const createCrudStore = <T extends { id?: string | number }>(endpoint: string) =>
  create<CrudState<T>>((set, get) => ({
    items: [],
    activeItem: null,
    formValues: {},
    payload: null,

    isLoading: false,
    error: null,

    // ================= CRUD =================

    fetchAll: async () => {
      set({ isLoading: true, error: null })
      try {
        const { data } = await axios.get(endpoint)
        set({ items: data?.data, isLoading: false })
      } catch (err: any) {
        set({ error: err?.response?.data?.message || err.message, isLoading: false })
      }
    },

    fetchById: async (id) => {
      set({ isLoading: true, error: null })
      try {
        const { data } = await axios.get(`${endpoint}/${id}`)
        set({ activeItem: data, formValues: data, isLoading: false })
      } catch (err: any) {
        set({ error: err?.response?.data?.message || err.message, isLoading: false })
      }
    },

    create: async () => {
      set({ isLoading: true, error: null })
      try {
        const { data } = await axios.post(endpoint, get().payload)
        set((state) => ({
          items: [...state.items, data],
          isLoading: false,
          formValues: {},
        }))
        toast.success('Success')
      } catch (err: any) {
        toast.error('Something went wrong')
        set({ error: err?.response?.data?.message || err.message, isLoading: false })
      }
    },

    update: async (id) => {
      set({ isLoading: true, error: null })
      try {
        const { data } = await axios.patch(`${endpoint}/${id}`, get().payload)

        set((state) => ({
          items: state.items.map((item) => (item.id === id ? data : item)),
          activeItem: data,
          formValues: data,
          isLoading: false,
        }))
        toast.success('Success')
      } catch (err: any) {
        toast.error('Something went wrong')
        set({ error: err?.response?.data?.message || err.message, isLoading: false })
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
        set({ error: err?.response?.data?.message || err.message, isLoading: false })
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
