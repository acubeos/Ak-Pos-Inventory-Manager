import logo from '../assets/image/logo.png'
import home from '../assets/image/home.png'
import order from '../assets/image/order.png'
import history from '../assets/image/history.png'
import customers from '../assets/image/customers.png'
import inventory from '../assets/image/inventory.png'
import sales from '../assets/image/sales.png'
import loginImg from '../assets/image/login.png'
// import logoutImg from '../assets/image/logout.png'
import { NavLink } from 'react-router-dom'

const Sidebar = (): React.JSX.Element => {
  return (
    <aside className="controls w-16 bg-[#003849] h-screen">
      <img src={logo} alt="logo" className="mb-10" />
      <ul className="menu p-0">
        <li>
          <NavLink to="/" className="tooltip tooltip-right rounded-none z-20" data-tip="Home">
            <img src={home} alt="home" />
          </NavLink>
        </li>
        <li>
          <NavLink to="/order" className="tooltip tooltip-right rounded-none z-20" data-tip="Order">
            <img src={order} alt="order" />
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/customers"
            className="tooltip tooltip-right rounded-none z-20"
            data-tip="Customers"
          >
            <img src={customers} alt="customers" />
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/outstanding"
            className="tooltip tooltip-right rounded-none z-20"
            data-tip="Outstanding"
          >
            <img src={history} alt="Outstanding" />
          </NavLink>
        </li>
        <li>
          <NavLink to="/sales" className="tooltip tooltip-right rounded-none z-20" data-tip="Sales">
            <img src={sales} alt="sales" />
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/inventory"
            className="tooltip tooltip-right rounded-none z-20"
            data-tip="Inventory"
          >
            <img src={inventory} alt="inventory" />
          </NavLink>
        </li>

        {/* Settings */}
        <li className="mt-auto">
          <NavLink
            to="/settings"
            className="tooltip tooltip-right rounded-none z-20"
            data-tip="Settings"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </NavLink>
        </li>

        {/* Authentication (Login/Logout) */}
        <li>
          <button className="tooltip tooltip-right rounded-none z-20" data-tip={'Login'}>
            <NavLink to="/auth">
              <img src={loginImg} alt={'login'} />
            </NavLink>
          </button>
        </li>
      </ul>
    </aside>
  )
}

export default Sidebar
