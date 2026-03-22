import { Button, Col, FormLabel, Row } from 'react-bootstrap'
import Flatpickr from 'react-flatpickr'

type DashboardFiltersProps = {
  startDate: Date | null
  endDate: Date | null
  hasDateFilter: boolean
  onStartDateChange: (date: Date | null) => void
  onEndDateChange: (date: Date | null) => void
  onReset: () => void
}

export default function DashboardFilters({
  startDate,
  endDate,
  hasDateFilter,
  onStartDateChange,
  onEndDateChange,
  onReset,
}: DashboardFiltersProps) {
  return (
    <Row className="g-3 align-items-end">
      <Col lg={4} md={6}>
        <FormLabel className="fw-semibold">From Date</FormLabel>
        <Flatpickr
          className="form-control"
          value={startDate ?? undefined}
          options={{ dateFormat: 'd M, Y' }}
          onChange={(selectedDates: Date[]) => {
            onStartDateChange(selectedDates[0] ?? null)
          }}
          placeholder="Select start date"
        />
      </Col>

      <Col lg={4} md={6}>
        <FormLabel className="fw-semibold">To Date</FormLabel>
        <Flatpickr
          className="form-control"
          value={endDate ?? undefined}
          options={{ dateFormat: 'd M, Y' }}
          onChange={(selectedDates: Date[]) => {
            onEndDateChange(selectedDates[0] ?? null)
          }}
          placeholder="Select end date"
        />
      </Col>

      <Col lg="auto" md="auto">
        <Button
          variant="outline-secondary"
          onClick={onReset}
          disabled={!hasDateFilter}
        >
          Reset
        </Button>
      </Col>
    </Row>
  )
}
