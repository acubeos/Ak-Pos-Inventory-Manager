import deleteIcon from '../assets/icons/deleteIcon.png'
import editIcon from '../assets/icons/editIcon.png'
import left from '../assets/icons/icon-left.png'
import right from '../assets/icons/icon-right.png'

import React, { JSX, useEffect } from 'react'
import { CreateCustomerData } from '../../../main/api.types'
import CustomerModal from './CustomerModal'
import CustomerUpdateModal from './CustomerUpdateModal'

const CustomerContact = (): JSX.Element => {
  const [customers, setCustomers] = React.useState<CreateCustomerData[]>([])
  const [total, setTotal] = React.useState<number>(0)
  const [searchTerm, setSearchTerm] = React.useState<string>('')
  const [page, setPage] = React.useState(1)
  const [limit, setLimit] = React.useState(11)
  const [selectedCustomer, setSelectedCustomer] = React.useState<CreateCustomerData | null>(null)

  useEffect(() => {
    const fetchCustomers = async (): Promise<void> => {
      if (!window.electronAPI?.customers.getAll) {
        console.error('getAllCustomers API not available')
        return
      }
      try {
        const customerList = await window.electronAPI.customers.getAll({ page, limit })
        // console.log('Fetched Customers:', customerList)
        if (customerList && Array.isArray(customerList.data.customers)) {
          setCustomers(customerList.data.customers) // for APIs that wrap data
          setTotal(customerList.data.total) // for APIs that return total count
        } else {
          setCustomers([]) // fallback to empty array
          setTotal(0) // reset total if no customers found
        }
      } catch (error) {
        console.error('Failed to fetch customers:', error)
      }
    }
    fetchCustomers()
  }, [page, limit])

  return (
    <div className="bg-slate-100 ml-16 h-screen w-screen pr-16">
      <div className="pb-4 pt-1 pl-2">
        <h1 className="text-2xl font-semibold">Customers</h1>
        <p className="text-xs text-gray-400">{total} Customer(s)</p>
      </div>
      <hr></hr>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          window.electronAPI?.customers
            .search(searchTerm, { page, limit })
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
        <button
          className="btn btn-accent btn-sm my-4 ml-2"
          onClick={() => {
            const modal = document.getElementById('add_customer') as HTMLDialogElement
            modal.showModal()
          }}
        >
          Add New
        </button>
        <input
          name="name"
          type="text"
          placeholder="search..."
          className="input input-bordered input-sm w-full max-w-xs ml-4"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button type="submit" className="mx-4 btn btn-sm btn-accent btn-outline">
          Filter
        </button>
      </form>
      <div className="overflow-x-auto max-h-[420px]">
        <table className="table table-xs table-pin-rows">
          {/* head */}
          <thead className="bg-accent">
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Contact</th>
              <th>Address</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {/* row 1 */}

            {customers.map((customer) => (
              <tr key={customer.uuid}>
                <th>{customer.id}</th>
                <th>{customer.name}</th>
                <td>{customer.phone}</td>
                <td>{customer.address}</td>
                <td>
                  <div className="flex gap-x-2">
                    <button
                      className="btn btn-xs btn-square btn-outline btn-accent"
                      onClick={(e) => {
                        e.preventDefault()
                        setSelectedCustomer(customer)
                        const modal = document.getElementById(
                          'modify_customer'
                        ) as HTMLDialogElement
                        modal.showModal()
                      }}
                    >
                      <img src={editIcon} alt="icon" className="mx-auto w-1/2" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete ${customer.name}?`)) {
                          window.electronAPI?.customers
                            .delete(customer.id!)
                            .then((res) => {
                              if (res.success) {
                                setCustomers((prev) => prev.filter((c) => c.id !== customer.id))
                              } else {
                                alert('Failed to delete customer: ' + res.error)
                              }
                            })
                            .catch((err) => alert('Error: ' + err.message))
                        }
                      }}
                      className="btn btn-xs btn-square btn-error"
                    >
                      <img src={deleteIcon} alt="icon" className="mx-auto w-1/2" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <CustomerModal />
      <CustomerUpdateModal selectedCustomer={selectedCustomer} />
      <div className="flex flex-row mt-2 ml-2 gap-x-2 align-center items-center">
        <button
          className="btn btn-xs btn-ghost btn-square"
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
        >
          <img src={left} alt="Previous" />
        </button>
        <div className="flex flex-row gap-x-2 items-center ml-4">
          <label className="block text-sm font-medium">
            Page {page} of {Math.ceil(total / limit)}
          </label>
        </div>
        <div className="flex flex-row gap-x-2 items-center">
          <label htmlFor="limit" className="block text-sm font-medium">
            Limit:
          </label>
          <select
            id="limit"
            name="limit"
            className="select select-xs select-bordered w-full  max-w-xs"
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
          >
            <option value="11">11</option>
            <option value="15">15</option>
          </select>
        </div>
        <button
          className="btn btn-xs btn-ghost btn-square"
          disabled={page >= Math.ceil(total / limit)}
          onClick={() => setPage((prev) => prev + 1)}
        >
          <img src={right} alt="next" />
        </button>
      </div>
    </div>
  )
}

export default CustomerContact
