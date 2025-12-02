import { formatDate } from '@renderer/helpers/general'
import { useEffect, useState } from 'react'
import { Sale } from 'src/main/api.types'

const DashboardTable = (): React.JSX.Element => {
  // Convert Date objects to YYYY-MM-DD format
  const formatDateForDB = (date: Date | null): string => {
    if (!date) return ''
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const [sales, setSales] = useState<Sale[]>([])
  const [filters] = useState({
    from: formatDateForDB(new Date()),
    to: formatDateForDB(new Date()),
    limit: 10,
    page: 1,
    sort: '',
    name: ''
  })

  useEffect(() => {
    const fetchSales = async (): Promise<void> => {
      try {
        const response = await window.electronAPI?.sales.getAll(filters)
        if (response?.success) {
          setSales(response.data.sales)
        } else {
          console.error('Failed to fetch sales:', response?.error)
        }
      } catch (error) {
        console.error('Error fetching sales:', error)
      }
    }

    fetchSales()
  }, [filters])

  return (
    <div className="overflow-x-auto h-2/5 border rounded-lg bg-white ml-4 mr-4">
      <table className=" table table-sm table-pin-rows">
        <thead className="bg-accent">
          <tr>
            <th>Invoice id</th>
            <th>Customer name</th>
            <th>Date</th>
            <th>Total paid</th>
            <th>Outstanding</th>
          </tr>
        </thead>
        <tbody>
          {/* row 1 */}
          {sales.map((sale) => (
            <tr key={sale.id}>
              <td>INV-{sale.id}</td>
              <td>{sale.customer_name}</td>
              <td>{formatDate(sale.created_at)}</td>
              <td>₦ {sale.total_amount?.toFixed(2)}</td>
              <td>₦ {sale.outstanding_amount?.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default DashboardTable
