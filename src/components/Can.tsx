import React from 'react'
import { hasPermission } from '@/utils/rbac'

interface CanProps {
  perform: string
  children: React.ReactNode
  fallback?: React.ReactNode
}

const Can: React.FC<CanProps> = ({ perform, children, fallback = null }) => {
  return hasPermission(perform) ? <>{children}</> : <>{fallback}</>
}

export default Can
