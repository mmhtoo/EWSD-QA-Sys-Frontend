import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { BreadcrumbItem } from 'react-bootstrap'
import { TbChevronRight } from 'react-icons/tb'

import PageMetaData from '@/components/PageMetaData'

type DashboardPageProps = {
  title: string
  subtitle?: string
  actions?: ReactNode
  showBreadcrumb?: boolean
  children: ReactNode
}

const DashboardPage = ({
  title,
  subtitle,
  actions,
  showBreadcrumb = true,
  children,
}: DashboardPageProps) => {
  return (
    <>
      <PageMetaData title={title} />
      <div className="page-title-head">
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-2">
          <h4 className="fs-xl fw-bold m-0">{title}</h4>
          {actions ? (
            <div className="d-flex align-items-center gap-2">{actions}</div>
          ) : null}
        </div>
        {showBreadcrumb && (
          <div className="breadcrumb m-0 py-2 d-flex align-items-center gap-1">
            <BreadcrumbItem linkAs={Link} href="">
              QA System
            </BreadcrumbItem>
            <TbChevronRight />
            {subtitle && (
              <>
                <BreadcrumbItem linkAs={Link} href="">
                  {subtitle}
                </BreadcrumbItem>
                <TbChevronRight />
              </>
            )}
            <BreadcrumbItem active>{title}</BreadcrumbItem>
          </div>
        )}
      </div>
      {children}
    </>
  )
}

export default DashboardPage
