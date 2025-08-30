import { formatDate } from '@renderer/helpers/general'
import left from '../assets/icons/icon-left.png'
import right from '../assets/icons/icon-right.png'
import DatePicker from './DatePicker'
import { useState, useEffect } from 'react'
import { Sale } from '../../../main/api.types'

const SalesHistory = (): React.JSX.Element => {
  const [filters, setFilters] = useState({
    from: '',
    to: '',
    limit: 10,
    page: 1,
    sort: '',
    name: ''
  })

  const [sales, setSales] = useState<Sale[]>([])
  const [totalSales, setTotalSales] = useState(0)
  const [loading, setLoading] = useState(false)
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null)

  // Fetch sales data
  const fetchSales = async (): Promise<void> => {
    setLoading(true)
    try {
      const response = await window.electronAPI?.sales.getAll(filters)
      if (response?.success) {
        setSales(response.data.sales)
        setTotalSales(response.data.total)
      } else {
        console.error('Failed to fetch sales:', response?.error)
      }
    } catch (error) {
      console.error('Error fetching sales:', error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch sales on component mount and when filters change
  useEffect(() => {
    fetchSales()
  }, [filters])

  const handleDateChange = (dateRange: {
    startDate: string | null
    endDate: string | null
  }): void => {
    setFilters((prev) => ({
      ...prev,
      from: dateRange.startDate || '',
      to: dateRange.endDate || '',
      page: 1 // Reset to first page when filtering
    }))
  }

  const handleSearchSubmit = (e: React.FormEvent): void => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    setFilters((prev) => ({
      ...prev,
      name: formData.get('name') as string,
      page: 1
    }))
  }

  const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    setFilters((prev) => ({
      ...prev,
      limit: parseInt(e.target.value),
      page: 1
    }))
  }

  const handlePageChange = (direction: 'prev' | 'next'): void => {
    setFilters((prev) => {
      const totalPages = Math.ceil(totalSales / prev.limit)
      if (direction === 'prev' && prev.page > 1) {
        return { ...prev, page: prev.page - 1 }
      } else if (direction === 'next' && prev.page < totalPages) {
        return { ...prev, page: prev.page + 1 }
      }
      return prev
    })
  }

  const openSaleDetails = (sale: Sale): void => {
    setSelectedSale(sale)
    const modal = document.getElementById('single_sale') as HTMLDialogElement
    modal.showModal()
  }

  const totalPages = Math.ceil(totalSales / filters.limit)

  return (
    <div className="bg-slate-100 ml-16 pr-16 h-screen w-screen">
      <div className="pb-4 pt-1 pl-2">
        <h1 className="text-2xl font-semibold">All Sales</h1>
        <p className="text-xs text-gray-400">{totalSales} Transactions</p>
      </div>
      <hr></hr>

      <form onSubmit={handleSearchSubmit}>
        <div className="flex flex-row justify-between">
          <div className="mr-6 my-3 h-8 w-60 pl-2">
            <DatePicker onDateChange={handleDateChange} />
          </div>

          <div className="my-4 flex flex-nowrap gap-x-2 pr-4">
            <input
              name="name"
              className="input input-bordered input-accent input-sm w-64 mr-4"
              placeholder="Search customer..."
              defaultValue={filters.name}
            />

            <button type="submit" className="btn btn-sm btn-accent btn-outline" disabled={loading}>
              {loading ? 'Loading...' : 'Filter'}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto max-h-[420px]">
          <table className="table table-sm table-pin-rows">
            <thead className="bg-accent">
              <tr>
                <th>Date</th>
                <th>Invoice ID</th>
                <th>Customer Name</th>
                <th>Total Amount</th>
                <th>Total Paid</th>
                <th>Outstanding</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-4">
                    <span className="loading loading-spinner loading-md"></span>
                  </td>
                </tr>
              ) : sales.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-4 text-gray-500">
                    No sales found
                  </td>
                </tr>
              ) : (
                sales.map((sale) => (
                  <tr key={sale.id}>
                    <td>{formatDate(sale.created_at)}</td>
                    <td>INV-{sale.id}</td>
                    <td>{sale.customer_name}</td>
                    <td>₦ {sale.total_amount?.toFixed(2)}</td>
                    <td>₦ {sale.total_paid?.toFixed(2)}</td>
                    <td>₦ {sale.outstanding_amount?.toFixed(2)}</td>
                    <td>
                      <button className="link link-accent" onClick={() => openSaleDetails(sale)}>
                        Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </form>

      <div className="flex flex-row mt-2 ml-2 gap-x-2 align-center items-center">
        <button
          className="btn btn-xs btn-ghost btn-square"
          onClick={() => handlePageChange('prev')}
          disabled={filters.page <= 1}
        >
          <img src={left} alt="Previous" />
        </button>
        <div className="flex flex-row gap-x-2 items-center ml-4">
          <label htmlFor="page" className="block text-sm font-medium">
            Page: {filters.page} of {totalPages}
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
            value={filters.limit}
            onChange={handleLimitChange}
          >
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </select>
        </div>
        <button
          className="btn btn-xs btn-ghost btn-square"
          onClick={() => handlePageChange('next')}
          disabled={filters.page >= totalPages}
        >
          <img src={right} alt="Next" />
        </button>
      </div>

      {/* Sale Details Modal */}
      <dialog id="single_sale" className="modal">
        <div className="modal-box">
          <button
            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            onClick={() => (document.getElementById('single_sale') as HTMLDialogElement)?.close()}
          >
            ✕
          </button>

          {selectedSale && (
            <>
              <h3 className="font-bold text-lg mb-4">Sale Details - INV-{selectedSale.id}</h3>
              <div className="mb-4">
                <p>
                  <strong>Customer:</strong> {selectedSale.customer_name}
                </p>
                <p>
                  <strong>Date:</strong> {formatDate(selectedSale.created_at)}
                </p>
              </div>

              <table className="table table-sm table-pin-rows">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Sub-total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedSale.products?.map((product, index) => (
                    <tr key={index}>
                      <td>{product.name || `Product ${product.product_id}`}</td>
                      <td>{product.quantity}</td>
                      <td>₦ {product.price?.toFixed(2)}</td>
                      <td>₦ {(product.price * product.quantity).toFixed(2)}</td>
                    </tr>
                  ))}

                  {/* Summary rows */}
                  <tr className="border-t-2">
                    <td className="font-bold">Total Amount</td>
                    <td></td>
                    <td></td>
                    <td className="font-bold">₦ {selectedSale.total_amount?.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td className="font-bold">Total Paid</td>
                    <td></td>
                    <td></td>
                    <td className="text-green-600 font-bold">
                      ₦ {selectedSale.total_paid?.toFixed(2)}
                    </td>
                  </tr>
                  <tr>
                    <td className="font-bold">Outstanding</td>
                    <td></td>
                    <td></td>
                    <td className="text-red-600 font-bold">
                      ₦ {selectedSale.outstanding_amount?.toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </>
          )}
        </div>
      </dialog>
    </div>
  )
}

export default SalesHistory
