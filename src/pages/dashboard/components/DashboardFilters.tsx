import { Button, Col, FormLabel, Row } from 'react-bootstrap'

import SelectFilter, {
  type SelectOption,
} from '@/components/common/SelectFilter'

type DashboardFiltersProps = {
  selectedAcademicYear: string
  academicYearOptions: SelectOption[]
  selectedAcademicYearPreview: string
  hasAcademicYearFilter: boolean
  onAcademicYearChange: (value: string) => void
  onReset: () => void
}

export default function DashboardFilters({
  selectedAcademicYear,
  academicYearOptions,
  selectedAcademicYearPreview,
  hasAcademicYearFilter,
  onAcademicYearChange,
  onReset,
}: DashboardFiltersProps) {
  return (
    <Row className="g-3 align-items-end">
      <Col lg={6} md={8}>
        <FormLabel className="fw-semibold">Academic Year</FormLabel>
        <SelectFilter
          value={selectedAcademicYear}
          onChange={onAcademicYearChange}
          options={academicYearOptions}
          placeholder="All academic years"
        />
        <small className="text-muted d-block mt-2">
          {selectedAcademicYearPreview}
        </small>
      </Col>

      <Col lg="auto" md="auto">
        <Button
          variant="outline-secondary"
          onClick={onReset}
          disabled={!hasAcademicYearFilter}
        >
          Reset
        </Button>
      </Col>
    </Row>
  )
}
