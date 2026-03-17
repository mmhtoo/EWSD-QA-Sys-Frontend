import logoDark from '@/assets/images/ewsd-gp4-logo-dark.svg'
import logoSm from '@/assets/images/ewsd-gp4-icon.svg'
import logo from '@/assets/images/ewsd-gp4-logo-light.svg'
import { AppRoutes } from '@/configs/routes'
import { useIdeaModalContext } from '@/context/useIdeaModalContext'
import { useLayoutContext } from '@/context/useLayoutContext'
import AppMenu from '@/layouts/components/sidenav/components/AppMenu'
import UserProfile from '@/layouts/components/sidenav/components/UserProfile'

import { Link, useNavigate } from 'react-router'
import { TbMenu4, TbPlus, TbX } from 'react-icons/tb'
import SimpleBar from 'simplebar-react'
import { useIdeaSpecificStore } from '@/pages/idea/store'

const Sidenav = () => {
  const { setShowFormModal } = useIdeaSpecificStore()
  const { sidenav, hideBackdrop, changeSideNavSize } = useLayoutContext()
  const { openNewIdeaModal } = useIdeaModalContext()
  const navigate = useNavigate()

  const toggleSidebar = () => {
    changeSideNavSize(
      sidenav.size === 'on-hover-active' ? 'on-hover' : 'on-hover-active',
    )
  }

  const closeSidebar = () => {
    const html = document.documentElement
    html.classList.toggle('sidebar-enable')
    hideBackdrop()
  }

  return (
    <div className="sidenav-menu">
      <Link to="/" className="logo">
        <span className="logo logo-light">
          <span className="logo-lg">
            <img src={logo} alt="EWSD GP4" />
          </span>
          <span className="logo-sm">
            <img src={logoSm} alt="EWSD GP4" />
          </span>
        </span>

        <span className="logo logo-dark">
          <span className="logo-lg">
            <img src={logoDark} alt="EWSD GP4" />
          </span>
          <span className="logo-sm">
            <img src={logoSm} alt="EWSD GP4" />
          </span>
        </span>
      </Link>

      <button className="button-on-hover">
        <TbMenu4 onClick={toggleSidebar} className="fs-22 align-middle" />
      </button>

      <button className="button-close-offcanvas">
        <TbX onClick={closeSidebar} className="align-middle" />
      </button>

      <SimpleBar id="sidenav" className="scrollbar">
        {sidenav.user && <UserProfile />}
        <div className="px-3 pt-3">
          <button
            type="button"
            className="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2 new-idea-button"
            onClick={() => {
              navigate(AppRoutes.IDEA_LIST.fullPath)
              openNewIdeaModal()
              setShowFormModal(true)
            }}
          >
            <TbPlus className="fs-18" />
            <span className="new-idea-label">New Idea</span>
          </button>
        </div>
        <AppMenu />
      </SimpleBar>
    </div>
  )
}

export default Sidenav
