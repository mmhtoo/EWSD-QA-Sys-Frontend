export const LOADING_CONST = 'Loading...'

export const getMimeType = (url: string) => {
  const ext = url.split('.').pop()?.toLowerCase()
  const map: Record<string, string> = {
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    webp: 'image/webp',
  }
  return map[ext || ''] || 'application/octet-stream'
}

export const downloadFile = (url: string, fileName = 'download') => {
  const link = document.createElement('a')
  link.href = url

  link.setAttribute('download', fileName)

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
