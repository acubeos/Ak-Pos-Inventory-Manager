import { formatDate } from '@renderer/helpers/general'
import left from '../assets/icons/icon-left.png'
import right from '../assets/icons/icon-right.png'
import { JSX } from 'react'

const StockHistory = (): JSX.Element => {
  const stocks = [
    {
      id: 1,
      name: 'Product A',
      type: 'Added',
      quantity: 100,
      created_at: '2023-10-01T12:00:00Z'
    },
    {
      id: 2,
      name: 'Product B',
      type: 'Removed',
      quantity: 50,
      created_at: '2023-10-02T12:00:00Z'
    }
  ]

  return (
    <div className=" ml-16 h-screen w-screen">
      <div className="pb-4 pt-1 pl-2">
        <h1 className="text-2xl font-semibold">Stock History</h1>
      </div>
      <hr></hr>
      <div className="max-h-screen">
        <table className="table table-zebra">
          {/* head */}
          <thead className="bg-accent">
            <tr>
              <th>Product</th>
              <th>Transaction Type</th>
              <th>Quantity</th>
              <th>Transaction Date</th>
            </tr>
          </thead>
          <tbody>
            {/* row 1 */}
            {stocks.map((stock) => (
              <tr key={stock.id}>
                <td>{stock.name}</td>
                <td>{stock.type}</td>
                <td>{stock.quantity}</td>
                <td>{formatDate(stock.created_at, true)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-row mt-2 ml-2 gap-x-2 align-center items-center">
        <button className="btn btn-xs btn-ghost btn-square">
          <img src={left} alt="Previous" />
        </button>
        <div className="flex flex-row gap-x-2 items-center ml-4">
          <label htmlFor="page" className="block text-sm font-medium">
            Page:
          </label>
        </div>
        <div className="flex flex-row gap-x-2 items-center">
          <label htmlFor="limit" className="block text-sm font-medium">
            Limit:
          </label>
          <select
            id="limit"
            name="limit"
            className="select select-xs select-bordered w-full max-w-xs"
            // value={filters.limit}
          >
            <option value="10">10</option>
            <option value="15">15</option>
          </select>
        </div>
        <button className="btn btn-xs btn-ghost btn-square">
          <img src={right} alt="Next" />
        </button>
      </div>
    </div>
  )
}

export default StockHistory
