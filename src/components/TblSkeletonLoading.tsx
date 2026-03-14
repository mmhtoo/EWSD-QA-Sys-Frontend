const TblSkeletonLoading = () => {
  const columnWidths = ['20%', '30%', '15%', '20%', '15%']

  return (
    <div className="card">
      <div className="card-body">
        <div className="table table-bordered p-3">
          {/* Table header placeholder */}
          <div className="d-flex border-bottom pb-2 mb-2">
            {columnWidths.map((width, i) => (
              <div key={i} style={{ width }} className="me-2">
                <span
                  className="placeholder col-12 placeholder-wave bg-secondary"
                  style={{ height: '24px', borderRadius: '4px' }}
                ></span>
              </div>
            ))}
          </div>

          {/* Table rows */}
          {[...Array(5)].map((_, rowIndex) => (
            <div key={rowIndex} className="d-flex align-items-center mb-3">
              {columnWidths.map((width, colIndex) => (
                <div
                  key={colIndex}
                  style={{ width }}
                  className="me-2 placeholder-glow"
                >
                  <span
                    className="placeholder col-12 placeholder-wave"
                    style={{ height: '20px', borderRadius: '4px' }}
                  ></span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default TblSkeletonLoading
