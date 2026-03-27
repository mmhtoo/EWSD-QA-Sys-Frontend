import type { ApexOptions } from 'apexcharts'

import ComponentCard from '@/components/cards/ComponentCard'
import CustomApexChart from '@/components/CustomApexChart.tsx'

type DashboardChartCardProps = {
  title: string
  chartKey: string
  options: ApexOptions
  series: ApexOptions['series']
  type: 'bar' | 'donut'
  hasData: boolean
  height?: number
  emptyMessage?: string
}

export default function DashboardChartCard({
  title,
  chartKey,
  options,
  series,
  type,
  hasData,
  height = 320,
  emptyMessage = 'No data available for selected filters.',
}: DashboardChartCardProps) {
  return (
    <ComponentCard title={title}>
      <div style={{ minHeight: height }}>
        {hasData ? (
          <CustomApexChart
            key={chartKey}
            getOptions={() => options}
            series={series}
            type={type}
            height={height}
          />
        ) : (
          <div className="h-100 d-flex align-items-center justify-content-center text-center">
            <p className="text-muted mb-0">{emptyMessage}</p>
          </div>
        )}
      </div>
    </ComponentCard>
  )
}
