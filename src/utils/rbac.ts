export const getPermissions = (): string[] => {
  if (typeof window === 'undefined') return []
  const tokenData = localStorage.getItem('token')
  if (!tokenData) return []

  try {
    const parsed = JSON.parse(tokenData)
    return parsed.user.permissions || []
  } catch (e) {
    return []
  }
}

export const hasPermission = (required: string | string[]): boolean => {
  const userPermissions = getPermissions()

  if (Array.isArray(required)) {
    return required.some((p) => userPermissions.includes(p))
  }

  return userPermissions.includes(required)
}
