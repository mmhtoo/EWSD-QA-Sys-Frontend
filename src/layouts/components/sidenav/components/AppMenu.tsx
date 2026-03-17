import { useLayoutContext } from '@/context/useLayoutContext'
import { scrollToElement } from '@/helpers/layout'
import { menuItems } from '@/layouts/components/data'
import type { MenuItemType } from '@/types/layout'
import { Link, useLocation, useNavigate } from 'react-router'
import { useEffect, useState } from 'react'
import { Collapse } from 'react-bootstrap'
import { TbChevronDown } from 'react-icons/tb'
import { hasPermission } from '@/utils/rbac'

const MenuItemWithChildren = ({
  item,
  openMenuKey,
  setOpenMenuKey,
  level = 0,
}: {
  item: MenuItemType
  openMenuKey: string | null
  setOpenMenuKey: (key: string | null) => void
  level?: number
}) => {
  const { pathname } = useLocation()
  const isTopLevel = level === 0

  const [localOpen, setLocalOpen] = useState(false)
  const [didAutoOpen, setDidAutoOpen] = useState(false)

  const isChildActive = (children: MenuItemType[]): boolean =>
    children.some(
      (child) =>
        (child.url && pathname.endsWith(child.url)) ||
        (child.children && isChildActive(child.children)),
    )

  const isActive = isChildActive(item.children || [])

  const isOpen = isTopLevel ? openMenuKey === item.key : localOpen

  useEffect(() => {
    if (isTopLevel && isActive && !didAutoOpen) {
      setOpenMenuKey(item.key)
      setDidAutoOpen(true)
    }
    if (!isTopLevel && isActive && !didAutoOpen) {
      setLocalOpen(true)
      setDidAutoOpen(true)
    }
  }, [isActive, isTopLevel, item.key, setOpenMenuKey, didAutoOpen])

  const toggleOpen = () => {
    if (isTopLevel) {
      setOpenMenuKey(isOpen ? null : item.key)
    } else {
      setLocalOpen((prev) => !prev)
    }
  }

  return (
    <li className={`side-nav-item ${isOpen ? 'active' : ''}`}>
      <button
        onClick={toggleOpen}
        className="side-nav-link"
        aria-expanded={isOpen}
      >
        {item.icon && (
          <span className="menu-icon">
            <item.icon />
          </span>
        )}
        <span className="menu-text">{item.label}</span>
        {item.badge ? (
          <span className={`badge bg-${item.badge.variant}`}>
            {item.badge.text}
          </span>
        ) : (
          <TbChevronDown className="menu-arrow" />
        )}
      </button>
      <Collapse in={isOpen}>
        <div>
          <ul className="sub-menu">
            {(item.children || []).map((child) =>
              child.children ? (
                <MenuItemWithChildren
                  key={child.key}
                  item={child}
                  openMenuKey={openMenuKey}
                  setOpenMenuKey={setOpenMenuKey}
                  level={level + 1}
                />
              ) : (
                <MenuItem key={child.key} item={child} />
              ),
            )}
          </ul>
        </div>
      </Collapse>
    </li>
  )
}

const MenuItem = ({ item }: { item: MenuItemType }) => {
  const { pathname } = useLocation()
  const isActive = item.url && pathname.endsWith(item.url)
  const navigate = useNavigate()

  const { sidenav, hideBackdrop } = useLayoutContext()

  const toggleBackdrop = () => {
    if (sidenav.size === 'offcanvas') {
      hideBackdrop()
    }
  }

  const isLogout = item.key === 'logout'
  const linkClass = `side-nav-link ${isActive ? 'active' : ''} ${item.isDisabled ? 'disabled' : ''} ${item.isSpecial ? 'special-menu' : ''} ${isLogout ? 'text-danger fw-semibold bg-transparent' : ''}`

  if (isLogout) {
    return (
      <li className={`side-nav-item ${isActive ? 'active' : ''}`}>
        <button
          type="button"
          onClick={() => {
            if (!window.confirm('Are you sure you want to log out?')) return
            toggleBackdrop()
            navigate(item.url ?? '/')
          }}
          className={`${linkClass} btn btn-link p-0 text-start`}
          aria-label={item.label}
        >
          {item.icon && (
            <span className="menu-icon text-danger">
              <item.icon />
            </span>
          )}
          <span className="menu-text">{item.label}</span>
        </button>
      </li>
    )
  }

  return (
    <li className={`side-nav-item ${isActive ? 'active' : ''}`}>
      <Link to={item.url ?? '/'} onClick={toggleBackdrop} className={linkClass}>
        {item.icon && (
          <span className="menu-icon">
            <item.icon />
          </span>
        )}
        <span className="menu-text">{item.label}</span>
        {item.badge && (
          <span className={`badge text-bg-${item.badge.variant} opacity-50`}>
            {item.badge.text}
          </span>
        )}
      </Link>
    </li>
  )
}

const AppMenu = () => {
  const [openMenuKey, setOpenMenuKey] = useState<string | null>(null)

  const scrollToActiveLink = () => {
    const activeItem: HTMLAnchorElement | null = document.querySelector(
      '.side-nav-link.active',
    )
    if (activeItem) {
      const simpleBarContent = document.querySelector(
        '#sidenav .simplebar-content-wrapper',
      )
      if (simpleBarContent) {
        const offset = activeItem.offsetTop - window.innerHeight * 0.4
        scrollToElement(simpleBarContent, offset, 500)
      }
    }
  }

  const filteredMenuItems = menuItems.filter((item) => {
    if (
      !item.permission ||
      (Array.isArray(item.permission) && item.permission.length === 0)
    ) {
      return true
    }

    return hasPermission(item.permission)
  })

  useEffect(() => {
    setTimeout(() => scrollToActiveLink(), 100)
  }, [])

  return (
    <ul className="side-nav">
      {filteredMenuItems.map((item) =>
        item.isTitle ? (
          <li className={'side-nav-title mt-2'} key={item.key}>
            {item.label}
          </li>
        ) : item.children ? (
          <MenuItemWithChildren
            key={item.key}
            item={item}
            openMenuKey={openMenuKey}
            setOpenMenuKey={setOpenMenuKey}
          />
        ) : (
          <MenuItem key={item.key} item={item} />
        ),
      )}
    </ul>
  )
}

export default AppMenu
