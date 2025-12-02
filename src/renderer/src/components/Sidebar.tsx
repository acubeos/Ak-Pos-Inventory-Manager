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

        {/* Authentication (Login/Logout) */}
        <li className="mt-24">
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
