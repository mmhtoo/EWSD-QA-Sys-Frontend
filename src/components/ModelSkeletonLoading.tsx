import { Placeholder } from 'react-bootstrap'

const ModelSkeletonLoading = () => (
  <div className="p-2">
    {[1, 2, 3, 4, 5].map((i) => (
      <div key={i} className="mb-3">
        <Placeholder as="div" animation="glow">
          <Placeholder xs={3} className="mb-2" /> <br />
          <Placeholder xs={12} style={{ height: '38px' }} className="rounded" />
        </Placeholder>
      </div>
    ))}
  </div>
)

export default ModelSkeletonLoading
