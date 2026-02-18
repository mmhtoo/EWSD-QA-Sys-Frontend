import type { ReactNode } from 'react'
import {
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from 'react-bootstrap'

export type EntityFormModalProps = {
  show: boolean
  title: string
  onHide: () => void
  onSubmit: () => void
  submitLabel?: string
  cancelLabel?: string
  isSubmitting?: boolean
  children: ReactNode
}

const EntityFormModal = ({
  show,
  title,
  onHide,
  onSubmit,
  submitLabel = 'Save',
  cancelLabel = 'Cancel',
  isSubmitting = false,
  children,
}: EntityFormModalProps) => {
  return (
    <Modal show={show} onHide={onHide} centered backdrop="static">
      <ModalHeader closeButton>
        <ModalTitle>{title}</ModalTitle>
      </ModalHeader>
      <ModalBody>{children}</ModalBody>
      <ModalFooter>
        <Button variant="light" onClick={onHide} disabled={isSubmitting}>
          {cancelLabel}
        </Button>
        <Button variant="primary" onClick={onSubmit} disabled={isSubmitting}>
          {submitLabel}
        </Button>
      </ModalFooter>
    </Modal>
  )
}

export default EntityFormModal
