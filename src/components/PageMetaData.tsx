type PageMetaDataProps = {
  title: string
  description?: string
  keywords?: string
}

const defaultPageMetaData: PageMetaDataProps = {
  title: 'EWSD GPA4',
}

const PageMetaData = ({
  title,
  description = defaultPageMetaData.description,
  keywords = defaultPageMetaData.keywords,
}: PageMetaDataProps) => {
  return (
    <>
      <title>
        {title
          ? `${title} | ${defaultPageMetaData.title}`
          : defaultPageMetaData.title}
      </title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
    </>
  )
}
export default PageMetaData
