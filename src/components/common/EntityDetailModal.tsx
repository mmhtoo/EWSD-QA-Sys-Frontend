import type { ReactNode } from 'react'
import {
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from 'react-bootstrap'

export type EntityDetailModalProps = {
  show: boolean
  title: string
  onHide: () => void
  children: ReactNode
}

const EntityDetailModal = ({
  show,
  title,
  onHide,
  children,
}: EntityDetailModalProps) => {
  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <ModalHeader closeButton>
        <ModalTitle>{title}</ModalTitle>
      </ModalHeader>
      <ModalBody>{children}</ModalBody>
      <ModalFooter>
        <Button variant="light" onClick={onHide}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  )
}

export default EntityDetailModal
