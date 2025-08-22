import book from '../assets/image/open-book.png'
import CustomerModal from './CustomerModal'
import left from '../assets/icons/icon-left.png'
import right from '../assets/icons/icon-right.png'
import React, { useEffect } from 'react'
import { CreateCustomerData } from 'src/main/api.types'

const OrderPage = (): React.JSX.Element => {
  const products = [
    { id: 1, name: 'Book 1', price: 10.0 },
    { id: 2, name: 'Book 2', price: 15.0 },
    { id: 3, name: 'Book 3', price: 20.0 },
    { id: 4, name: 'Book 4', price: 25.0 },
    { id: 5, name: 'Book 5', price: 30.0 }
  ]

  const books = [
    { id: 1, name: 'Book A', price: 10.0, quantity: 1 },
    { id: 2, name: 'Book B', price: 15.0, quantity: 1 },
    { id: 3, name: 'Book C', price: 20.0, quantity: 1 }
  ]

  const [customers, setCustomers] = React.useState<CreateCustomerData[]>([])
  const [searchTerm, setSearchTerm] = React.useState<string>('')

  useEffect(() => {
    const fetchCustomers = async (): Promise<void> => {
      if (!window.electronAPI?.customers.getAll) {
        console.error('getAllCustomers API not available')
        return
      }
      try {
        const customerList = await window.electronAPI.customers.getAll()
        // console.log('Fetched Customers:', customerList)
        if (customerList && Array.isArray(customerList.data.customers)) {
          setCustomers(customerList.data.customers) // for APIs that wrap data
        } else {
          setCustomers([]) // fallback to empty array
        }
      } catch (error) {
        console.error('Failed to fetch customers:', error)
      }
    }
    fetchCustomers()
  }, [])

  return (
    <div className="bg-slate-100 ml-16 pt-2 pl-4 pr-16 grid grid-cols-2 w-screen gap-x-1 h-screen">
      <div>
        <h1 className="font-bold">Select Books</h1>
        <div className="flex flex-wrap gap-2 max-w-lg py-4 text-center">
          {products.map((product) => (
            <div className="card bg-base-100 w-28 h-50 shadow-md cursor-pointer" key={product.id}>
              <figure className="px-6 pt-0">
                <img src={book} alt="book" />
              </figure>
              <div className="card-body pt-0 items-center text-center">
                <h2>{product.name}</h2>
                <p>#{product.price}</p>
              </div>
            </div>
          ))}
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
          <button className="btn btn-xs btn-ghost btn-square">
            <img src={right} alt="Next" />
          </button>
        </div>
      </div>

      <div className="min-w-md">
        <h1 className="font-bold">Current Order</h1>
        <div className="py-4">
          <form
            id="form"
            onSubmit={(e) => {
              e.preventDefault()
              window.electronAPI?.customers
                .search(searchTerm)
                .then((res) => {
                  if (res && Array.isArray(res.data.customers)) {
                    setCustomers(res.data.customers)
                  } else {
                    setCustomers([])
                  }
                })
                .catch(console.error)
            }}
          >
            <div className="flex gap-x-2">
              <input
                placeholder="Search Customer"
                list="select"
                name="select"
                className="input input-bordered w-full max-w-xs"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <datalist id="select">
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.name}>
                    {customer.name}
                  </option>
                ))}
              </datalist>

              <button
                onClick={() => {
                  const modal = document.getElementById('add_customer') as HTMLDialogElement | null
                  if (modal) modal.showModal()
                }}
                className="btn btn-accent btn-sm h-12 w-16 ml-2"
              >
                +
              </button>
            </div>

            <div className="mt-6 max-h-80 overflow-x-auto">
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
                  {books.map((book) => (
                    <tr key={book.id}>
                      <td>{book.name}</td>
                      <td>
                        <input
                          placeholder="0"
                          className="input input-bordered input-accent h-8 w-16"
                          type="number"
                          value={book.price}
                        />
                      </td>
                      <td>#{(book.price! * book.quantity).toFixed(2)}</td>
                      <td>
                        <button className="btn text-red-600 btn-square btn-xs">X</button>
                      </td>
                    </tr>
                  ))}
                  {/* Total Price Row */}
                  <tr>
                    <td className="font-bold">Total</td>
                    <td></td>
                    <td className="font-bold">
                      #20,000
                      {/* {order.products
                        .reduce((total, product) => total + product.price! * product.quantity, 0)
                        .toFixed(2)} */}
                    </td>
                  </tr>
                  {/* Total Paid Row */}
                  <tr>
                    <td className="font-bold">Total Paid</td>
                    <td></td>
                    <td className="text-500">
                      <input
                        placeholder="0"
                        name="total_paid"
                        type="number"
                        className="input input-bordered input-accent h-8 w-32"
                        // value={order.total_paid}
                      />
                    </td>
                    <td></td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex flex-col pt-4 gap-y-2">
              <button type="submit" className="btn btn-accent w-3/6">
                Complete Order
              </button>
              <button
                type="reset"
                onClick={() => {
                  const form = document.getElementById('form') as HTMLFormElement
                  form.reset()
                  setSearchTerm('')
                }}
                className="btn btn-accent btn-outline w-3/6"
              >
                Clear Order
              </button>
            </div>
          </form>
          <CustomerModal
            onClose={() => {
              const modal = document.getElementById('add_customer') as HTMLDialogElement
              modal.close()
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default OrderPage
