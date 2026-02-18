import logoDark from '@/assets/images/logo-black.png'
import logoSm from '@/assets/images/logo-sm.png'
import logo from '@/assets/images/logo.png'
import { AppRoutes } from '@/configs/routes'
import { useIdeaModalContext } from '@/context/useIdeaModalContext'
import { useLayoutContext } from '@/context/useLayoutContext'
import AppMenu from '@/layouts/components/sidenav/components/AppMenu'
import UserProfile from '@/layouts/components/sidenav/components/UserProfile'

import { Link, useNavigate } from 'react-router'
import { TbMenu4, TbPlus, TbX } from 'react-icons/tb'
import SimpleBar from 'simplebar-react'

const Sidenav = () => {
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
            <img src={logo} alt="logo" />
          </span>
          <span className="logo-sm">
            <img src={logoSm} alt="small logo" />
          </span>
        </span>

        <span className="logo logo-dark">
          <span className="logo-lg">
            <img src={logoDark} alt="dark logo" />
          </span>
          <span className="logo-sm">
            <img src={logoSm} alt="small logo" />
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
            className="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2"
            onClick={() => {
              navigate(AppRoutes.IDEA_LIST.fullPath)
              openNewIdeaModal()
            }}
          >
            <TbPlus className="fs-18" /> New Idea
          </button>
        </div>
        <AppMenu />
      </SimpleBar>
    </div>
  )
}

export default Sidenav
