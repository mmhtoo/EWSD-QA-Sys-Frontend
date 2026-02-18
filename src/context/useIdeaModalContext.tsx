import { createContext, use, useCallback, useMemo, useState } from 'react'

import type { ChildrenType } from '@/types'

type IdeaModalContextType = {
  isNewIdeaModalOpen: boolean
  openNewIdeaModal: () => void
  closeNewIdeaModal: () => void
}

const IdeaModalContext = createContext<IdeaModalContextType | undefined>(
  undefined,
)

export const useIdeaModalContext = () => {
  const context = use(IdeaModalContext)
  if (!context) {
    throw new Error('useIdeaModalContext must be used within IdeaModalProvider')
  }
  return context
}

export const IdeaModalProvider = ({ children }: ChildrenType) => {
  const [isNewIdeaModalOpen, setIsNewIdeaModalOpen] = useState<boolean>(false)

  const openNewIdeaModal = useCallback(() => {
    setIsNewIdeaModalOpen(true)
  }, [])

  const closeNewIdeaModal = useCallback(() => {
    setIsNewIdeaModalOpen(false)
  }, [])

  const value = useMemo(
    () => ({ isNewIdeaModalOpen, openNewIdeaModal, closeNewIdeaModal }),
    [isNewIdeaModalOpen, openNewIdeaModal, closeNewIdeaModal],
  )

  return (
    <IdeaModalContext.Provider value={value}>
      {children}
    </IdeaModalContext.Provider>
  )
}
