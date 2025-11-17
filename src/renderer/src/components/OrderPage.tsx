import book from '../assets/image/open-book.png'
import CustomerModal from './CustomerModal'
import left from '../assets/icons/icon-left.png'
import right from '../assets/icons/icon-right.png'
import React, { useEffect, useRef } from 'react'
import { CreateCustomerData, CreateSaleData } from 'src/main/api.types'
import { formatCurrency } from '@renderer/helpers/general'
import toast from 'react-hot-toast'

const PAGE_SIZE = 12 // products per page

// Enhanced interfaces for better type safety
interface ProductWithStock {
  id: number
  name: string
  price: number
  quantity: number
  type: string
  featured: boolean
  rating: number
  status: number
}

interface CustomerWithId extends CreateCustomerData {
  id: number
}

interface OrderItem {
  id: number
  name: string
  price: number
  quantity: number
  availableStock: number
}

const OrderPage = (): React.JSX.Element => {
  const [products, setProducts] = React.useState<ProductWithStock[]>([])
  const [customers, setCustomers] = React.useState<CustomerWithId[]>([])
  const [searchTerm, setSearchTerm] = React.useState<string>('')
  const [selectedCustomer, setSelectedCustomer] = React.useState<CustomerWithId | null>(null)
  const [orderItems, setOrderItems] = React.useState<OrderItem[]>([])
  const [page, setPage] = React.useState<number>(1)
  const [hasMore, setHasMore] = React.useState<boolean>(true)
  const [loading, setLoading] = React.useState<boolean>(false)
  const [error, setError] = React.useState<string>('')
  const [totalPaidDisplay, setTotalPaidDisplay] = React.useState<string>('') // State for formatted input

  const formRef = useRef<HTMLFormElement | null>(null)

  // Fetch products from electron api
  useEffect(() => {
    const fetchProducts = async (): Promise<void> => {
      if (!window.electronAPI?.products?.getAll) {
        setError('Products API not available')
        return
      }

      setLoading(true)
      setError('')

      try {
        const response = await window.electronAPI.products.getAll({
          page,
          limit: PAGE_SIZE,
          sort: 'name-asc'
        })

        if (response?.success && response.data?.product && Array.isArray(response.data.product)) {
          setProducts(response.data.product)
          setHasMore(response.data.product.length === PAGE_SIZE)
        } else {
          setProducts([])
          setHasMore(false)
          setError(response?.error || 'Failed to load products')
        }
      } catch (error) {
        console.error('Failed to fetch products:', error)
        setError('Failed to fetch products')
        setProducts([])
        setHasMore(false)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [page])

  // Fetch customers
  const fetchCustomers = async (): Promise<void> => {
    if (!window.electronAPI?.customers?.getAll) {
      setError('Customers API not available')
      return
    }

    try {
      const response = await window.electronAPI.customers.getAll()
      if (response?.success && Array.isArray(response.data?.customers)) {
        setCustomers(response.data.customers)
      } else {
        setCustomers([])
        setError(response?.error || 'Failed to load customers')
      }
    } catch (error) {
      console.error('Failed to fetch customers:', error)
      setError('Failed to fetch customers')
      setCustomers([])
    }
  }

  useEffect(() => {
    fetchCustomers()
  }, [])

  // Add product to order with stock validation
  const handleAddToOrder = async (product: ProductWithStock): Promise<void> => {
    try {
      // Check current stock levels
      const response = await window.electronAPI?.products.getById(product.id)

      if (!response?.success || !response.data) {
        toast.error('Unable to verify product availability')
        return
      }

      const currentStock = response.data.quantity

      if (currentStock <= 0) {
        toast.error(`${product.name} is out of stock`)
        return
      }

      const existingItem = orderItems.find((item) => item.id === product.id)
      const currentOrderQuantity = existingItem ? existingItem.quantity : 0

      if (currentOrderQuantity >= currentStock) {
        toast.error(`Cannot add more ${product.name}. Available stock: ${currentStock}`)
        return
      }

      setOrderItems((prev) => {
        const existing = prev.find((item) => item.id === product.id)
        if (existing) {
          return prev.map((item) =>
            item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
          )
        }
        return [
          ...prev,
          {
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
            availableStock: currentStock
          }
        ]
      })
    } catch (error) {
      console.error('Error adding product to order:', error)
      toast.error('Failed to add product to order. Please try again.')
    }
  }

  // Update quantity with stock validation
  const handleQuantityChange = (productId: number, newQuantity: number): void => {
    if (newQuantity < 1) return

    setOrderItems((prev) =>
      prev.map((item) => {
        if (item.id === productId) {
          if (newQuantity > item.availableStock) {
            toast.error(`Cannot exceed available stock of ${item.availableStock} for ${item.name}`)
            return item
          }
          return { ...item, quantity: newQuantity }
        }
        return item
      })
    )
  }

  // Remove item from order
  const handleRemoveItem = (productId: number): void => {
    setOrderItems((prev) => prev.filter((item) => item.id !== productId))
  }

  // Handle formatting for the total paid input
  const handleTotalPaidChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value
    // Remove all non-digit characters except the decimal point
    const numericValue = value.replace(/[^0-9.]/g, '')
    const parts = numericValue.split('.')

    // Prevent multiple decimal points
    if (parts.length > 2) {
      return
    }

    // Format the integer part with commas
    const integerPart = parts[0]
    const formattedInteger = new Intl.NumberFormat('en-US').format(Number(integerPart))

    // Reconstruct the value
    const formattedValue = parts.length > 1 ? `${formattedInteger}.${parts[1]}` : formattedInteger

    setTotalPaidDisplay(formattedValue)
  }

  // Handle form submit - create the sale
  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()

    if (!selectedCustomer) {
      toast.error('Please select a customer first')
      return
    }

    if (orderItems.length === 0) {
      toast.error('Please add at least one product to the order')
      return
    }

    // Parse the number from the state, removing commas
    const totalPaid = Number(totalPaidDisplay.replace(/,/g, '')) || 0

    if (totalPaid < 0) {
      toast.error('Total paid cannot be negative')
      return
    }

    const totalAmount = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const outstanding = Math.max(0, totalAmount - totalPaid)

    if (totalPaid > totalAmount) {
      toast.error('Amount paid cannot be more than goods bought')
      return
    }

    try {
      setLoading(true)

      const saleData: CreateSaleData = {
        customer_id: selectedCustomer.id!,
        customer_name: selectedCustomer.name,
        total_paid: totalPaid,
        outstanding: outstanding,
        products: orderItems.map((item) => ({
          product_id: String(item.id),
          name: item.name,
          quantity: item.quantity,
          price: item.price
        }))
      }

      const response = await window.electronAPI?.sales.create(saleData)

      if (response?.success) {
        toast.success('Order completed successfully!')

        // Reset form and state
        formRef.current?.reset()
        setOrderItems([])
        setSearchTerm('')
        setSelectedCustomer(null)
        setError('')
        setTotalPaidDisplay('') // Reset the formatted input state

        // Refresh products to show updated quantities
        const productsResponse = await window.electronAPI?.products.getAll({
          page,
          limit: PAGE_SIZE,
          sort: 'name-asc'
        })

        if (productsResponse?.success && productsResponse.data?.product) {
          setProducts(productsResponse.data.product)
        }
      } else {
        throw new Error(response?.error || 'Failed to create sale')
      }
    } catch (error) {
      console.error('Failed to complete order:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      setError(`Failed to complete order: ${errorMessage}`)
      toast.error(`Failed to complete order: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  // Handle customer selection
  const handleCustomerSearch = (value: string): void => {
    setSearchTerm(value)
    const match = customers.find((c) => c.name.toLowerCase() === value.toLowerCase())
    setSelectedCustomer(match || null)
  }

  // Clear order
  const handleClearOrder = (): void => {
    formRef.current?.reset()
    setSearchTerm('')
    setOrderItems([])
    setSelectedCustomer(null)
    setError('')
    setTotalPaidDisplay('') // Reset the formatted input state
  }

  // Handle customer modal success
  const handleCustomerAdded = (): void => {
    fetchCustomers() // Refresh customers list
    const modal = document.getElementById('add_customer') as HTMLDialogElement
    modal?.close()
  }

  const total = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <div className="bg-slate-100 ml-16 pt-2 pl-4 pr-16 grid grid-cols-2 w-screen gap-x-1 h-screen">
      {/* LEFT: Products */}
      <div>
        <h1 className="font-bold">Select Books</h1>

        {error && (
          <div className="alert alert-error alert-sm mb-4 max-w-96">
            <span>{error.slice(0, 6)}</span>
            <p>Press Clear Order button</p>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <span>loading...</span>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-8">
            <h2 className="text-gray-500">No products available</h2>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 max-w-lg py-4 text-center">
            {products.map((product) => (
              <div
                onClick={() => handleAddToOrder(product)}
                className={`card bg-base-100 w-28 h-50 shadow-md cursor-pointer hover:shadow-lg ${
                  product.quantity === 0 ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                key={product.id}
              >
                <figure className="px-6 pt-0">
                  <img src={book} alt="book" />
                </figure>
                <div className="card-body px-6 pt-0 items-center text-center">
                  <h2 className="text-xs font-semibold">{product.name}</h2>
                  {product.quantity !== 0 && (
                    <p className="text-xs font-bold">{formatCurrency(product.price)}</p>
                  )}
                  {product.quantity === 0 && <p className="text-xs text-red-500">Out of Stock</p>}
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
            disabled={page === 1 || loading}
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
            disabled={!hasMore || loading}
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
                onChange={(e) => handleCustomerSearch(e.target.value)}
                disabled={loading}
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
                disabled={loading}
              >
                +
              </button>
            </div>

            {/* Order Table */}
            <div className="mt-2 max-h-80 overflow-x-auto max-w-[500px]">
              {/* Selected Customer Display */}
              {selectedCustomer && (
                <div className="mt-2 mb-2 p-2 bg-white rounded-md shadow-sm">
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
                      <td>
                        <div>
                          <div>{book.name}</div>
                          <div className="text-xs text-gray-500">
                            Available: {book.availableStock}
                          </div>
                        </div>
                      </td>
                      <td>
                        <input
                          placeholder="Enter quantity"
                          type="number"
                          min={1}
                          max={book.availableStock}
                          className="input input-bordered input-accent h-8 w-16"
                          value={book.quantity}
                          onChange={(e) => {
                            const qty = Math.max(1, Number(e.target.value))
                            handleQuantityChange(book.id, qty)
                          }}
                        />
                      </td>
                      <td>{formatCurrency(book.price * book.quantity)}</td>
                      <td>
                        <button
                          type="button"
                          className="btn text-red-600 btn-square btn-xs"
                          onClick={() => handleRemoveItem(book.id)}
                        >
                          X
                        </button>
                      </td>
                    </tr>
                  ))}

                  {orderItems.length === 0 && (
                    <tr>
                      <td colSpan={4} className="text-center text-gray-500 py-8">
                        No items in order yet
                      </td>
                    </tr>
                  )}

                  {orderItems.length > 0 && (
                    <>
                      {/* Total Price Row */}
                      <tr className="border-t-2">
                        <td className="font-bold">Total</td>
                        <td></td>
                        <td className="font-bold">{formatCurrency(total)}</td>
                        <td></td>
                      </tr>

                      {/* Total Paid Row */}
                      <tr>
                        <td className="font-bold">Total Paid</td>
                        <td></td>
                        <td>
                          <input
                            placeholder="0"
                            name="total_paid"
                            type="text"
                            inputMode="decimal"
                            className="input input-bordered input-accent h-8 w-32"
                            value={totalPaidDisplay}
                            onChange={handleTotalPaidChange}
                            required
                          />
                        </td>
                        <td></td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>

            {/* Buttons */}
            <div className="flex flex-col pt-4 gap-y-2">
              <button
                type="submit"
                className="btn btn-accent w-3/6"
                disabled={loading || !selectedCustomer || orderItems.length === 0}
              >
                {loading ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  'Complete Order'
                )}
              </button>
              <button
                type="button"
                onClick={handleClearOrder}
                className="btn btn-accent btn-outline w-3/6"
                disabled={loading}
              >
                Clear Order
              </button>
            </div>
          </form>

          {/* Customer Modal */}
          <CustomerModal
            onClose={() => {
              const modal = document.getElementById('add_customer') as HTMLDialogElement
              modal?.close()
            }}
            onSuccess={handleCustomerAdded}
          />
        </div>
      </div>
    </div>
  )
}

export default OrderPage
