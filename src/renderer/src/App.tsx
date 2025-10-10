import '../index.css'
import { Route, Routes } from 'react-router-dom'
import Layout from './Layout'
import Dashboard from './components/Dashboard'
import AuthPage from './components/AuthPage'
import Invoice from './components/Invoice'
import OrderPage from './components/OrderPage'
import SalesHistory from './components/SalesHistory'
import Outstanding from './components/OutstandingPage'
import StockHistory from './components/StockHistory'
import CustomerContact from './components/CustomerContact'
import InventoryPage from './components/InventoryPage'

function App(): React.JSX.Element {
  return (
    <>
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* Child routes */}
          <Route index element={<Dashboard />} />
          <Route path="auth" element={<AuthPage />} />
          <Route path="invoice" element={<Invoice />} />
          <Route path="order" element={<OrderPage />} />
          <Route path="products" element={<InventoryPage />} />
          <Route path="sales" element={<SalesHistory />} />
          <Route path="outstanding" element={<Outstanding />} />
          <Route path="stockHistory" element={<StockHistory />} />
          <Route path="customers" element={<CustomerContact />} />
          <Route path="inventory" element={<InventoryPage />} />
        </Route>
      </Routes>
    </>
  )
}

export default App
