import { formatDate } from '@renderer/helpers/general'
import left from '../assets/icons/icon-left.png'
import right from '../assets/icons/icon-right.png'
import DatePicker from './DatePicker'
import { useState } from 'react'

const SalesHistory = (): React.JSX.Element => {
  const [filters, setFilters] = useState({
    from: '',
    to: '',
    limit: 10,
    page: 1,
    sort: '',
    name: ''
  })

  const handleDateChange = (dateRange: {
    startDate: string | null
    endDate: string | null
  }): void => {
    setFilters((prev) => ({
      ...prev,
      from: dateRange.startDate || '',
      to: dateRange.endDate || ''
    }))
  }

  const sales = [
    {
      customer: 'John Doe',
      id: 'INV123',
      last_updated: '2023-10-01T12:00:00Z',
      total: 100,
      outstanding: 20
    }
  ]

  const products = [
    {
      product_id: 'P001',
      name: 'Book A',
      quantity: 2,
      price: 50
    },
    {
      product_id: 'P002',
      name: 'Book B',
      quantity: 1,
      price: 30
    }
  ]

  return (
    <div className="bg-slate-100 ml-16 pr-16 h-screen w-screen">
      <div className="pb-4 pt-1 pl-2">
        <h1 className="text-2xl font-semibold">All Sales</h1>
        <p className="text-xs text-gray-400">200 Transactions</p>
      </div>
      <hr></hr>
      {/* Check if form is necessary */}
      <form>
        <div className="flex flex-row justify-between">
          <div className="mr-6 my-3 h-8 w-60 pl-2">
            <DatePicker onDateChange={handleDateChange} />
          </div>

          <div className="my-4 flex flex-nowrap gap-x-2 pr-4">
            <input
              name="name"
              className="input input-bordered input-accent input-sm w-64 mr-4"
              placeholder="Search..."
              value={filters.name}
            />

            <button type="submit" className="btn btn-sm btn-accent btn-outline">
              Filter
            </button>
          </div>
        </div>

        <div className="overflow-x-auto max-h-[420px]">
          <table className="table table-sm table-pin-rows">
            {/* head */}
            <thead className="bg-accent">
              <tr>
                <th>Date</th>
                <th>Invoice id</th>
                <th>Customer name</th>
                <th>Total paid</th>
                <th>Outstanding</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {/* row 1 */}
              {sales &&
                sales.map((sale) => (
                  <tr key={sale.id}>
                    <td>{formatDate(sale.last_updated)}</td>
                    <td>{sale.id}</td>
                    <td>{sale.customer}</td>
                    <td># {sale.total}</td>
                    <td># {sale.outstanding}</td>
                    <td>
                      <a
                        className="link link-accent"
                        onClick={() => {
                          const modal = document.getElementById('single_sale') as HTMLDialogElement
                          modal.showModal()
                        }}
                      >
                        Details
                      </a>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </form>
      <div className="flex flex-row mt-2 ml-2 gap-x-2 align-center items-center">
        <button className="btn btn-xs btn-ghost btn-square">
          <img src={left} alt="Previous" />
        </button>
        <div className="flex flex-row gap-x-2 items-center ml-4">
          <label htmlFor="page" className="block text-sm font-medium">
            Page: {filters.page}
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
            <option value="20">20</option>
            <option value="50">50</option>
          </select>
        </div>
        <button className="btn btn-xs btn-ghost btn-square">
          <img src={right} alt="Next" />
        </button>
      </div>

      <dialog id="single_sale" className="modal">
        <div className="modal-box">
          <button
            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            onClick={() => (document.getElementById('single_sale') as HTMLDialogElement)?.close()}
          >
            ✕
          </button>
          <table className="table table-sm table-pin-rows">
            <thead>
              <tr>
                <th>Books</th>
                <th>Quantity</th>
                <th>Sub-total</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.product_id}>
                  <td>{product.name}</td>
                  <td>{product.quantity}</td>
                  <td>#{(product.price! * product.quantity).toFixed(2)}</td>
                </tr>
              ))}
              {/* Total Price Row */}
              <tr>
                <td className="font-bold">Total</td>
                <td></td>
                <td className="font-bold">#20,000</td>
              </tr>
              {/* Outstanding Row */}
              <tr>
                <td className="font-bold">Total Paid</td>
                <td></td>
                <td className="text-500">#10,000</td>
                <td></td>
                <td></td>
              </tr>

              {/* Total Paid Row */}
              <tr>
                <td className="font-bold">Outstanding</td>
                <td></td>
                <td className="text-500">#10,000</td>
                <td></td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>
      </dialog>
    </div>
  )
}

export default SalesHistory
