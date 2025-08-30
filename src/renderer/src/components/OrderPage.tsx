import book from '../assets/image/open-book.png'
import CustomerModal from './CustomerModal'
import left from '../assets/icons/icon-left.png'
import right from '../assets/icons/icon-right.png'
import React, { useEffect, useRef } from 'react'
import { CreateCustomerData } from 'src/main/api.types'

const PAGE_SIZE = 12 // products per page

const OrderPage = (): React.JSX.Element => {
  const [products, setProducts] = React.useState<{ id: number; name: string; price: number }[]>([])
  const [customers, setCustomers] = React.useState<CreateCustomerData[]>([])
  const [searchTerm, setSearchTerm] = React.useState<string>('')
  const [selectedCustomer, setSelectedCustomer] = React.useState<CreateCustomerData | null>(null)
  const [orderItems, setOrderItems] = React.useState<
    { id: number; name: string; price: number; quantity: number }[]
  >([])
  const [page, setPage] = React.useState<number>(1)
  const [hasMore, setHasMore] = React.useState<boolean>(true)

  const formRef = useRef<HTMLFormElement | null>(null)

  // fetch products from electron api
  useEffect(() => {
    const fetchProducts = async (): Promise<void> => {
      if (!window.electronAPI?.products?.getAll) {
        console.error('getAllProducts API not available')
        return
      }
      try {
        const productList = await window.electronAPI.products.getAll({ page, limit: PAGE_SIZE })
        if (productList?.data?.product && Array.isArray(productList.data.product)) {
          setProducts(productList.data.product)
          setHasMore(productList.data.products.length === PAGE_SIZE)
        } else {
          setProducts([])
          setHasMore(false)
        }
      } catch (error) {
        console.error('Failed to fetch products:', error)
      }
    }
    fetchProducts()
  }, [page])

  // fetch customers
  useEffect(() => {
    const fetchCustomers = async (): Promise<void> => {
      if (!window.electronAPI?.customers?.getAll) {
        console.error('getAllCustomers API not available')
        return
      }
      try {
        const customerList = await window.electronAPI.customers.getAll()
        if (customerList && Array.isArray(customerList.data.customers)) {
          setCustomers(customerList.data.customers)
        } else {
          setCustomers([])
        }
      } catch (error) {
        console.error('Failed to fetch customers:', error)
      }
    }
    fetchCustomers()
  }, [])

  // add product to order
  const handleAddToOrder = (product: { id: number; name: string; price: number }): void => {
    setOrderItems((prev) => {
      const existing = prev.find((item) => item.id === product.id)
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      }
      return [...prev, { ...product, quantity: 1 }]
    })
  }

  // handle form submit
  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    if (!selectedCustomer) {
      alert('Please select a customer first')
      return
    }
    if (orderItems.length === 0) {
      alert('Please add at least one product to the order')
      return
    }

    const totalPaid = Number(
      (formRef.current?.elements.namedItem('total_paid') as HTMLInputElement)?.value || 0
    )

    try {
      await window.electronAPI?.sales.create({
        customerId: selectedCustomer.id,
        items: orderItems,
        totalPaid
      })
      alert('✅ Order completed successfully')

      // reset state
      formRef.current?.reset()
      setOrderItems([])
      setSearchTerm('')
      setSelectedCustomer(null)
    } catch (error) {
      console.error('❌ Failed to complete order:', error)
      alert('Failed to complete order, check console for details')
    }
  }

  const total = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <div className="bg-slate-100 ml-16 pt-2 pl-4 pr-16 grid grid-cols-2 w-screen gap-x-1 h-screen">
      {/* LEFT: Products */}
      <div>
        <h1 className="font-bold">Select Books</h1>
        {products.length === 0 ? (
          <h1>No products available</h1>
        ) : (
          <div className="flex flex-wrap gap-2 max-w-lg py-4 text-center">
            {products.map((product) => (
              <div
                onClick={() => handleAddToOrder(product)}
                className="card bg-base-100 w-28 h-50 shadow-md cursor-pointer hover:shadow-lg"
                key={product.id}
              >
                <figure className="px-6 pt-0">
                  <img src={book} alt="book" />
                </figure>
                <div className="card-body pt-0 items-center text-center">
                  <h2 className="text-xs font-semibold">{product.name}</h2>
                  <p className="text-xs font-bold">#{product.price}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        <div className="flex flex-row mt-2 ml-2 gap-x-2 align-center items-center">
          <button
            type="button"
            className="btn btn-xs btn-ghost btn-square"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <img src={left} alt="Previous" />
          </button>
          <div className="flex flex-row gap-x-2 items-center">
            <label className="block text-sm font-medium">Page: {page}</label>
          </div>
          <button
            type="button"
            className="btn btn-xs btn-ghost btn-square"
            onClick={() => setPage((p) => p + 1)}
            disabled={!hasMore}
          >
            <img src={right} alt="Next" />
          </button>
        </div>
      </div>

      {/* RIGHT: Order */}
      <div className="min-w-md">
        <h1 className="font-bold">Current Order</h1>
        <div className="py-4">
          <form ref={formRef} id="form" onSubmit={handleSubmit}>
            {/* Search Customers */}
            <div className="flex gap-x-2">
              <input
                placeholder="Search Customer"
                list="select"
                name="select"
                className="input input-bordered w-full max-w-xs"
                value={searchTerm}
                onChange={(e) => {
                  const value = e.target.value
                  setSearchTerm(value)
                  const match = customers.find((c) => c.name.toLowerCase() === value.toLowerCase())
                  setSelectedCustomer(match || null)
                }}
              />
              <datalist id="select">
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.name}>
                    {customer.name}
                  </option>
                ))}
              </datalist>

              <button
                type="button"
                onClick={() => {
                  const modal = document.getElementById('add_customer') as HTMLDialogElement | null
                  if (modal) modal.showModal()
                }}
                className="btn btn-accent btn-sm h-12 w-16 ml-2"
              >
                +
              </button>
            </div>

            {/* Order Table */}
            <div className="mt-6 max-h-80 overflow-x-auto">
              {/* Selected Customer Display */}
              {selectedCustomer && (
                <div className="mt-4 mb-2 p-2 bg-white rounded-md shadow-sm">
                  <h2 className="font-semibold">Selected Customer:</h2>
                  <p>{selectedCustomer.name}</p>
                </div>
              )}

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
                  {orderItems.map((book) => (
                    <tr key={book.id}>
                      <td>{book.name}</td>
                      <td>
                        <input
                          placeholder="Enter quantity"
                          type="number"
                          min={1}
                          className="input input-bordered input-accent h-8 w-16"
                          value={book.quantity}
                          onChange={(e) => {
                            const qty = Math.max(1, Number(e.target.value))
                            setOrderItems((prev) =>
                              prev.map((item) =>
                                item.id === book.id ? { ...item, quantity: qty } : item
                              )
                            )
                          }}
                        />
                      </td>
                      <td>#{(book.price * book.quantity).toFixed(2)}</td>
                      <td>
                        <button
                          type="button"
                          className="btn text-red-600 btn-square btn-xs"
                          onClick={() => setOrderItems(orderItems.filter((i) => i.id !== book.id))}
                        >
                          X
                        </button>
                      </td>
                    </tr>
                  ))}

                  {/* Total Price Row */}
                  <tr>
                    <td className="font-bold">Total</td>
                    <td></td>
                    <td className="font-bold">#{total.toFixed(2)}</td>
                  </tr>

                  {/* Total Paid Row */}
                  <tr>
                    <td className="font-bold">Total Paid</td>
                    <td></td>
                    <td>
                      <input
                        placeholder="0"
                        name="total_paid"
                        type="number"
                        className="input input-bordered input-accent h-8 w-32"
                      />
                    </td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Buttons */}
            <div className="flex flex-col pt-4 gap-y-2">
              <button type="submit" className="btn btn-accent w-3/6">
                Complete Order
              </button>
              <button
                type="reset"
                onClick={() => {
                  formRef.current?.reset()
                  setSearchTerm('')
                  setOrderItems([])
                  setSelectedCustomer(null)
                }}
                className="btn btn-accent btn-outline w-3/6"
              >
                Clear Order
              </button>
            </div>
          </form>

          {/* Customer Modal */}
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
