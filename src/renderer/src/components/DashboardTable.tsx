import { formatDate } from '@renderer/helpers/general'

const DashboardTable = (): React.JSX.Element => {
  const sales = [
    {
      customer: { name: 'John Doe' },
      id: 'INV001',
      last_updated: '2023-10-01T12:00:00Z',
      total: 1000000,
      outstanding: 400000
    },
    {
      customer: { name: 'John Doe' },
      id: 'INV001',
      last_updated: '2023-10-01T12:00:00Z',
      total: 1000000,
      outstanding: 400000
    },
    {
      customer: { name: 'John Doe' },
      id: 'INV001',
      last_updated: '2023-10-01T12:00:00Z',
      total: 1000000,
      outstanding: 400000
    },
    {
      customer: { name: 'John Doe' },
      id: 'INV001',
      last_updated: '2023-10-01T12:00:00Z',
      total: 1000000,
      outstanding: 400000
    },
    {
      customer: { name: 'John Doe' },
      id: 'INV001',
      last_updated: '2023-10-01T12:00:00Z',
      total: 1000000,
      outstanding: 400000
    },
    {
      customer: { name: 'John Doe' },
      id: 'INV001',
      last_updated: '2023-10-01T12:00:00Z',
      total: 1000000,
      outstanding: 400000
    },
    {
      customer: { name: 'John Doe' },
      id: 'INV001',
      last_updated: '2023-10-01T12:00:00Z',
      total: 1000000,
      outstanding: 400000
    }
  ]
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
              <td>{sale.id}</td>
              <td>{sale.customer.name}</td>
              <td>{formatDate(sale.last_updated)}</td>
              <td># {sale.total}</td>
              <td># {sale.outstanding}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default DashboardTable
