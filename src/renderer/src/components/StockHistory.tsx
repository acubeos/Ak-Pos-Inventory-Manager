import { useState, JSX, useEffect } from 'react'
import { formatDate } from '@renderer/helpers/general'
import left from '../assets/icons/icon-left.png'
import right from '../assets/icons/icon-right.png'
import { SingleStock } from 'src/main/api.types'

const StockHistory = (): JSX.Element => {
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [stocks, setStocks] = useState<SingleStock[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchStocks = async (): Promise<void> => {
      try {
        setLoading(true)

        // Check if API exists
        if (!window.electronAPI?.stock?.getAll) {
          console.error('Stock API not available')
          return
        }

        const result = await window.electronAPI.stock.getAll({ page, limit })

        // Debug the response
        console.log('Full API Response:', result)

        setStocks(result?.stock || [])
        setTotal(result?.total || 0)
      } catch (error) {
        console.error('Error fetching stock history:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchStocks()
  }, [page, limit])

  return (
    <div className="ml-16 h-screen w-screen">
      <div className="pb-4 pt-1 pl-2">
        <h1 className="text-2xl font-semibold">Stock History</h1>
      </div>
      <hr />
      <div className="max-h-screen">
        <table className="table table-zebra">
          <thead className="bg-accent">
            <tr>
              <th>Product</th>
              <th>Quantity</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center py-4">
                  Loading...
                </td>
              </tr>
            ) : stocks.length > 0 ? (
              stocks.map((stock) => (
                <tr key={stock.id}>
                  <td>{stock.Product?.name}</td>
                  <td>{stock.quantity}</td>
                  <td>{formatDate(stock.created_at, true)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center py-4">
                  No history found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-row mt-2 ml-2 gap-x-2 items-center">
        <button
          className="btn btn-xs btn-ghost btn-square"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          <img src={left} alt="Previous" />
        </button>

        <span className="ml-2 mr-2 text-sm">
          Page {page} of {total || 1}
        </span>

        <button
          className="btn btn-xs btn-ghost btn-square"
          onClick={() => setPage((p) => (p < total ? p + 1 : p))}
          disabled={page >= total}
        >
          <img src={right} alt="Next" />
        </button>

        <div className="flex flex-row gap-x-2 items-center ml-4">
          <label htmlFor="limit" className="block text-sm font-medium">
            Limit:
          </label>
          <select
            id="limit"
            className="select select-xs select-bordered w-full max-w-xs"
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value))
              setPage(1)
            }}
          >
            <option value={10}>10</option>
            <option value={15}>15</option>
          </select>
        </div>
      </div>
    </div>
  )
}

export default StockHistory
