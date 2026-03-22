import { downloadFile } from '@/utils'
import { useState } from 'react'
import { TbDownload, TbLoader } from 'react-icons/tb'

export default function DownloadButton({
  fileUrl,
  fileName,
}: {
  fileUrl: string
  fileName: string
}) {
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownload = async () => {
    setIsDownloading(true)

    try {
      downloadFile(fileUrl, fileName)
    } catch (error) {
      console.error('Download failed', error)
    } finally {
      // Reset state after a brief moment
      setTimeout(() => setIsDownloading(false), 1000)
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={isDownloading}
      className="btn btn-primary d-flex align-items-center gap-2"
    >
      {isDownloading ? (
        <TbLoader className="spinner-border spinner-border-sm" />
      ) : (
        <TbDownload />
      )}
      {isDownloading ? 'Downloading...' : 'Download File'}
    </button>
  )
}
