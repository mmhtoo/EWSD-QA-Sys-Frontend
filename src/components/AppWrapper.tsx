import { LayoutProvider } from '@/context/useLayoutContext'
import { IdeaModalProvider } from '@/context/useIdeaModalContext'
import { NotificationProvider } from '@/context/useNotificationContext'
import type { ChildrenType } from '@/types'

const AppWrapper = ({ children }: ChildrenType) => {
  return (
    <LayoutProvider>
      <NotificationProvider>
        <IdeaModalProvider>{children}</IdeaModalProvider>
      </NotificationProvider>
    </LayoutProvider>
  )
}

export default AppWrapper
