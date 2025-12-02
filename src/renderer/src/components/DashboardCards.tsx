import sale from '../assets/icons/outstanding-icon.png'
import customer from '../assets/icons/customer-icon.png'
import Outstanding from '../assets/icons/sale-icon.png'
import { useEffect, useState } from 'react'
import { formatCurrency } from '@renderer/helpers/general'
import { SingleProduct } from 'src/main/api.types'

interface Cards {
  title: string
  value: string | number
  icon?: string
  badge?: number
}

const Cards = (): React.JSX.Element => {
  const [total, setTotal] = useState(0)
  const [outstanding, setOutstanding] = useState('')
  const [products, setProducts] = useState<SingleProduct[]>([])

  const fetchCustomers = async (): Promise<void> => {
    const customers = await window.electronAPI?.customers.getAll()
    setTotal(customers.data.total)
  }
  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchOutstanding = async (): Promise<void> => {
    const outstanding = await window.electronAPI?.payments.getOutstanding()
    const total = outstanding.data.outstandingPayments
      .map((item) => item.total_outstanding)
      .reduce((a, b) => a + b, 0)
    setOutstanding(formatCurrency(total))
  }
  useEffect(() => {
    fetchOutstanding()
  }, [])

  const fetchProducts = async (): Promise<void> => {
    const products = await window.electronAPI?.products.getAll()
    setProducts(products.data.product || [])
  }
  useEffect(() => {
    fetchProducts()
  }, [])

  const cards: Cards[] = [
    {
      title: 'Daily Sale',
      value: '#Admin only!',
      icon: sale
    },
    {
      title: 'Customers',
      value: total,
      icon: customer
    },
    {
      title: 'Outstanding',
      value: outstanding,
      icon: Outstanding
    },
    {
      title: 'Product Details',
      value: 'Product Count',
      badge: products.length
    }
  ]

  return (
    <div className="flex flex-wrap gap-2">
      {cards.map((card) => (
        <div
          key={card.title}
          className="flex flex-col justify-center border bg-white rounded-lg w-52 h-32 p-3"
        >
          <h2 className="font-bold">{card.title}</h2>
          <div className="flex flex-row gap-x-4">
            <p className="font-semibold">{card.value}</p>
            {card.badge && <button className="btn btn-xs badge-secondary">{card.badge}</button>}
            {card.icon && (
              <div className="rounded-full overflow-hidden w-6 bg-slate-200">
                <img src={card.icon} alt="icon1" className="object-contain" />
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default Cards
