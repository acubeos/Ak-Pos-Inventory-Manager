import { JSX, useEffect, useState } from 'react'
import { CreateCustomerData } from 'src/main/api.types'

interface Props {
  selectedCustomer: CreateCustomerData | null
  onClose: () => void
  onUpdated: (updated: CreateCustomerData) => void
}

const CustomerUpdateModal = ({ selectedCustomer, onClose, onUpdated }: Props): JSX.Element => {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')

  useEffect(() => {
    if (selectedCustomer) {
      setName(selectedCustomer.name || '')
      setPhone(selectedCustomer.phone || '')
      setAddress(selectedCustomer.address || '')
    }
  }, [selectedCustomer])

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    if (!selectedCustomer) return

    try {
      const res = await window.electronAPI?.customers.update(selectedCustomer.id!, {
        name,
        phone,
        address
      })

      if (res.success) {
        onUpdated(res.data) // notify parent to refresh state
        onClose()
      } else {
        alert('Update failed: ' + res.error)
      }
    } catch (err) {
      alert('Error: ' + (err instanceof Error ? err.message : String(err)))
    }
  }

  return (
    <>
      <dialog id="modify_customer" className="modal">
        <div className="modal-box">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSubmit(e)
            }}
          >
            {/* if there is a button in form, it will close the modal */}
            <button
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              type="button"
              onClick={() =>
                (document.getElementById('modify_customer') as HTMLDialogElement)?.close()
              }
            >
              ✕
            </button>
            <h3 className="font-bold text-lg text-center">Modify Customer</h3>

            <div className="mt-5 flex flex-col justify-center items-center">
              <div className="flex flex-col pb-2 w-full max-w-xs">
                <label className="font-semibold pb-1" htmlFor="name">
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="Enter name"
                  onChange={(e) => setName(e.target.value)}
                  className="input input-bordered "
                  value={name}
                  required
                />
              </div>
              <div className="flex flex-col pb-2  w-full max-w-xs">
                <label className="font-semibold pb-1" htmlFor="address">
                  Address
                </label>
                <input
                  type="text"
                  id="address"
                  placeholder="Enter address"
                  onChange={(e) => setAddress(e.target.value)}
                  className="input input-bordered"
                  value={address}
                  required
                />
              </div>
              <div className="flex flex-col pb-2  w-full max-w-xs">
                <label className="font-semibold pb-1" htmlFor="contact">
                  Contact
                </label>
                <input
                  type="number"
                  id="contact"
                  placeholder="Enter phone number"
                  className="input input-bordered"
                  onChange={(e) => setPhone(e.target.value)}
                  value={phone}
                  required
                />
              </div>
              <button type="submit" className="my-4 btn btn-accent w-full max-w-xs">
                Update
              </button>
            </div>
          </form>
        </div>
      </dialog>
    </>
  )
}

export default CustomerUpdateModal
