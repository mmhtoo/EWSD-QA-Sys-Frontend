import { Link } from 'react-router'

import logoDark from '@/assets/images/ewsd-gp4-logo-dark.svg'
import logo from '@/assets/images/ewsd-gp4-logo-light.svg'

const AppLogo = ({ height }: { height?: number }) => {
  return (
    <>
      <Link to="/" className="logo-dark">
        <img src={logoDark} alt="EWSD GP4" height={height ?? 28} />
      </Link>
      <Link to="/" className="logo-light">
        <img src={logo} alt="EWSD GP4" height={height ?? 28} />
      </Link>
    </>
  )
}

export default AppLogo
