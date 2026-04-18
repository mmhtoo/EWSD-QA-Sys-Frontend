import { userDropdownItems } from '@/layouts/components/data'

import { Link } from 'react-router'
import { Fragment } from 'react'
import {
  Dropdown,
  DropdownDivider,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
} from 'react-bootstrap'
import { TbChevronDown } from 'react-icons/tb'
import { useNavigate } from 'react-router'

import user3 from '@/assets/images/users/user-3.jpg'
import { useLocalStorage } from 'usehooks-ts'
import dayjs from 'dayjs'

const UserProfile = () => {
  const navigate = useNavigate()
  const [lastLoggedInDate] = useLocalStorage('lastLoggedInDate', '')
  const handleAction = (id?: string) => {
    if (id === 'logout-btn') {
      localStorage.removeItem('token')
      navigate('/auth/login')
    }
  }

  return (
    <div className="topbar-item nav-user">
      <Dropdown align="end">
        <DropdownToggle
          as={'a'}
          className="topbar-link dropdown-toggle drop-arrow-none px-2"
        >
          <img
            src={user3}
            width="32"
            height="32"
            className="rounded-circle me-lg-2 d-flex"
            alt="user-image"
          />
          <div className="d-lg-flex align-items-center gap-1 d-none">
            <h5 className="my-0">
              {JSON.parse(localStorage.getItem('token')!)?.user?.name ??
                'Geneva'}
            </h5>

            <TbChevronDown className="align-middle" />
          </div>
        </DropdownToggle>
        <DropdownMenu className="dropdown-menu-end">
          {lastLoggedInDate && (
            <div className="dropdown-header noti-title">
              <h6 className="text-overflow m-0">
                Last Logged In:{' '}
                {dayjs(lastLoggedInDate).format('DD MMM YYYY HH:mm:ss')}
              </h6>
            </div>
          )}

          {userDropdownItems.map((item, idx) => (
            <Fragment key={idx}>
              {item.isHeader ? (
                <div className="dropdown-header noti-title">
                  <h6 className="text-overflow m-0">{item.label}</h6>
                </div>
              ) : item.isDivider ? (
                <DropdownDivider />
              ) : (
                <DropdownItem
                  as={Link}
                  to={item.url ?? ''}
                  className={item.class}
                  onClick={() => handleAction(item.id)}
                >
                  {item.icon && (
                    <item.icon className="me-2 fs-17 align-middle" />
                  )}
                  <span className="align-middle">{item.label}</span>
                </DropdownItem>
              )}
            </Fragment>
          ))}
        </DropdownMenu>
      </Dropdown>
    </div>
  )
}

export default UserProfile
