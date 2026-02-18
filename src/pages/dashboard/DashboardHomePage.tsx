import { Container } from 'react-bootstrap'

import ComponentCard from '@/components/cards/ComponentCard'
import DashboardPage from '@/components/common/DashboardPage'

export const DashboardHomePage = () => {
  return (
    <Container fluid>
      <DashboardPage title="Dashboard" subtitle="QA" showBreadcrumb={false}>
        <ComponentCard title="Coming Soon">
          <p className="text-muted mb-0">
            Dashboard widgets are under construction. Please check back soon.
          </p>
        </ComponentCard>
      </DashboardPage>
    </Container>
  )
}
