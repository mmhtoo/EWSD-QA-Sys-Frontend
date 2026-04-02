import { useLayoutContext } from '@/context/useLayoutContext'
import LanguageDropdown from '@/layouts/components/topbar/components/LanguageDropdown'
import UserProfile from '@/layouts/components/topbar/components/UserProfile'

import { Link } from 'react-router'
import { Container } from 'react-bootstrap'
import { TbMenu4 } from 'react-icons/tb'

import logoDark from '@/assets/images/ewsd-gp4-logo-dark.svg'
import logoSm from '@/assets/images/ewsd-gp4-icon.svg'
import logo from '@/assets/images/ewsd-gp4-logo-light.svg'
import MonochromeThemeModeToggler from './components/MonoChromeTheme'

const Topbar = () => {
  const { sidenav, changeSideNavSize, showBackdrop } = useLayoutContext()

  const toggleSideNav = () => {
    const html = document.documentElement
    const currentSize = html.getAttribute('data-sidenav-size')

    if (currentSize === 'offcanvas') {
      html.classList.toggle('sidebar-enable')
      showBackdrop()
    } else if (sidenav.size === 'compact') {
      changeSideNavSize(
        currentSize === 'compact' ? 'condensed' : 'compact',
        false,
      )
    } else {
      changeSideNavSize(currentSize === 'condensed' ? 'default' : 'condensed')
    }
  }

  return (
    <header className="app-topbar">
      <Container fluid className="topbar-menu">
        <div className="d-flex align-items-center gap-2">
          <div className="logo-topbar">
            <Link to="/" className="logo-light">
              <img src={logo} alt="EWSD GP4" />
            </Link>

            <Link to="/" className="logo-dark">
              <span className="logo-lg">
                <img src={logoDark} alt="EWSD GP4" />
              </span>
              <span className="logo-sm">
                <img src={logoSm} alt="EWSD GP4" />
              </span>
            </Link>
          </div>

          <button
            onClick={toggleSideNav}
            className="sidenav-toggle-button btn btn-default btn-icon"
          >
            <TbMenu4 className="fs-22" />
          </button>
        </div>

        <div className="d-flex align-items-center gap-2">
          <MonochromeThemeModeToggler/>
          <LanguageDropdown />
          <UserProfile />
        </div>
      </Container>
    </header>
  )
}

export default Topbar
