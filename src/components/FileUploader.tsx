import { type HTMLAttributes, useCallback, useEffect, useState } from 'react'
import { Button, Card, Col, Row, Spinner } from 'react-bootstrap'
import Dropzone, {
  type DropzoneProps,
  type DropzoneState,
  type FileRejection,
} from 'react-dropzone'
import { TbCloudUpload, TbX, TbDownload } from 'react-icons/tb'

import FileExtensionWithPreview from '@/components/FileExtensionWithPreview'
import { useNotificationContext } from '@/context/useNotificationContext'
import { formatBytes } from '@/helpers/file'
import clsx from 'clsx'

type FileUploaderProps = HTMLAttributes<HTMLDivElement> & {
  files?: File[]
  onValueChange?: (files: File[]) => void
  onUpload?: (files: File[]) => Promise<void>
  accept?: DropzoneProps['accept']
  maxSize?: DropzoneProps['maxSize']
  maxFileCount?: DropzoneProps['maxFiles']
  multiple?: boolean
  disabled?: boolean
  setFiles: (files: File[] | undefined) => void
}

export type FileWithPreview = File & { preview: string }

export type FilePreviewProps = {
  file: FileWithPreview
}

type FileCardProps = {
  file: File
  onRemove: () => void
}

function isFileWithPreview(file: File): file is File & { preview: string } {
  return 'preview' in file && typeof file.preview === 'string'
}

const FileUploader = (props: FileUploaderProps) => {
  const {
    files,
    setFiles,
    onUpload,
    accept = {
      'image/*': [],
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        ['.docx'],
      'application/msword': ['.doc'], 
    },
    maxSize = 1024 * 1024 * 100,
    maxFileCount = 1,
    multiple = false,
    disabled = false,
    className,
    ...dropzoneProps
  } = props

  const { showNotification } = useNotificationContext()

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      if (!multiple && maxFileCount === 1 && acceptedFiles.length > 1) {
        showNotification({
          message: 'Cannot upload more than 1 file at a time',
          variant: 'danger',
        })
        return
      }

      if ((files?.length ?? 0) + acceptedFiles.length > maxFileCount) {
        showNotification({
          message: `Cannot upload more than ${maxFileCount} files`,
          variant: 'danger',
        })
        return
      }

      const newFiles = acceptedFiles.map((file: File) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
        }),
      )

      const updatedFiles = files ? [...files, ...newFiles] : newFiles
      setFiles(updatedFiles)

      if (rejectedFiles.length > 0) {
        rejectedFiles.forEach(({ file }: FileRejection) => {
          showNotification({
            message: `File ${file.name} was rejected`,
            variant: 'danger',
          })
        })
      }
    },
    [files, maxFileCount, multiple, setFiles, showNotification],
  )

  function onRemove(index: number) {
    if (!files) return
    const newFiles = files.filter((_: File, i: number) => i !== index)
    setFiles(newFiles)
  }

  useEffect(() => {
    return () => {
      if (!files) return
      files.forEach((file) => {
        if (isFileWithPreview(file)) {
          if (file.preview.startsWith('blob:')) {
            URL.revokeObjectURL(file.preview)
          }
        }
      })
    }
  }, [files])

  const isDisabled = disabled || (files?.length ?? 0) >= maxFileCount

  return (
    <div>
      <Dropzone
        onDrop={onDrop}
        accept={accept}
        maxSize={maxSize}
        minSize={0}
        maxFiles={maxFileCount}
        multiple={maxFileCount > 1 || multiple}
        disabled={isDisabled}
      >
        {({ getRootProps, getInputProps }: DropzoneState) => (
          <div
            className={clsx(
              'dropzone border-dashed border-2 text-center p-4 rounded',
              className,
            )}
            {...getRootProps()}
            {...dropzoneProps}
          >
            <input {...getInputProps()} />
            <div className="dz-message needsclick">
              <div className="avatar-lg mx-auto mb-3">
                <span
                  className="avatar-title bg-info-subtle text-info rounded-circle d-inline-flex align-items-center justify-content-center"
                  style={{ width: '60px', height: '60px' }}
                >
                  <TbCloudUpload size={30} />
                </span>
              </div>
              <h5 className="mb-2">Drop files here or click to upload.</h5>
              <p className="text-muted small mb-0">
                Allowed: Images, PDF, DOC, DOCX
              </p>
            </div>
          </div>
        )}
      </Dropzone>

      {!!files?.length &&
        files?.map((file: File, index: number) => (
          <FileCard key={index} file={file} onRemove={() => onRemove(index)} />
        ))}
    </div>
  )
}

function FileCard({ file, onRemove }: FileCardProps) {
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownload = async () => {
    if (!isFileWithPreview(file)) return

    setIsDownloading(true)
    try {
      const response = await fetch(file.preview)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)

      const link = document.createElement('a')
      link.href = url
      link.download = file.name
      document.body.appendChild(link)
      link.click()

      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Download failed', error)
      window.open(file.preview, '_blank')
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div className="dropzone-previews mt-3">
      <Card className="mt-1 mb-0 border shadow-none bg-light">
        <div className="p-2">
          <Row className="align-items-center">
            <Col xs="auto">
              {isFileWithPreview(file) && <FilePreview file={file} />}
            </Col>
            <Col className="ps-0 overflow-hidden">
              <div className="fw-semibold text-truncate small">{file.name}</div>
              <p className="mb-0 text-muted fs-xs">
                {file.size > 0 ? formatBytes(file.size) : 'Cloud File'}
              </p>
            </Col>
            <Col xs="auto" className="d-flex gap-1">
              {isFileWithPreview(file) && (
                <Button
                  variant="link"
                  size="sm"
                  className="p-1 text-info"
                  onClick={handleDownload}
                  disabled={isDownloading}
                  title="Download"
                >
                  {isDownloading ? (
                    <Spinner animation="border" size="sm" />
                  ) : (
                    <TbDownload size={18} />
                  )}
                </Button>
              )}
              <Button
                variant="link"
                size="sm"
                className="p-1 text-danger"
                onClick={onRemove}
                title="Remove"
              >
                <TbX size={18} />
              </Button>
            </Col>
          </Row>
        </div>
      </Card>
    </div>
  )
}

function FilePreview({ file }: FilePreviewProps) {
  // Check MIME type or extension
  const isImage =
    file.type?.startsWith('image/') ||
    /\.(jpg|jpeg|png|webp|gif)$/i.test(file.name)

  if (isImage) {
    return (
      <img
        src={file.preview}
        alt={file.name}
        width={32}
        height={32}
        className="avatar-sm rounded bg-white border object-fit-cover"
      />
    )
  }

  return (
    <div
      className="avatar-sm rounded bg-white border d-flex align-items-center justify-content-center"
      style={{ width: '32px', height: '32px' }}
    >
      <FileExtensionWithPreview extension={file.name.split('.').pop() ?? ''} />
    </div>
  )
}

export default FileUploader
