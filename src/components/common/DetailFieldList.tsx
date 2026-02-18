import type { ReactNode } from 'react'
import { Col, Row } from 'react-bootstrap'

export type DetailFieldItem = {
  label: string
  value: ReactNode
}

export type DetailFieldListProps = {
  items: DetailFieldItem[]
}

const DetailFieldList = ({ items }: DetailFieldListProps) => {
  return (
    <div className="border rounded-3 p-3 bg-light-subtle">
      {items.map((item) => (
        <Row key={item.label} className="py-1">
          <Col sm={4} className="text-muted">
            {item.label}
          </Col>
          <Col sm={8} className="fw-semibold">
            {item.value}
          </Col>
        </Row>
      ))}
    </div>
  )
}

export default DetailFieldList
