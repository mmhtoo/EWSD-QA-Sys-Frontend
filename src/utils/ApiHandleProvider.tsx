import React from 'react'
import { LOADING_CONST } from '.'

interface ApiHandlingProviderProps {
  apiCalls: boolean[]
  loadingComponent?: React.ReactNode
  children: React.ReactNode
}

const ApiHandlingProvider: React.FC<ApiHandlingProviderProps> = ({
  apiCalls,
  loadingComponent,
  children,
}) => {
  const isGlobalLoading = apiCalls.some((apiCall) => apiCall === true)
  if (isGlobalLoading) {
    if (loadingComponent) {
      return <>{loadingComponent}</>
    } else {
      return (
        <div className="min-h-screen w-screen flex items-center justify-center bg-[#f9f9f9]">
          <p>{LOADING_CONST}</p>
        </div>
      )
    }
  }

  return <>{children}</>
}

export default ApiHandlingProvider
