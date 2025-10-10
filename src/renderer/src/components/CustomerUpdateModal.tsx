import { JSX, useEffect } from 'react'
import { CreateCustomerData } from 'src/main/api.types'
import { SubmitHandler, useForm } from 'react-hook-form'
import NotificationBar from './NotificationBar'
import toast from 'react-hot-toast'

interface Props {
  selectedCustomer: CreateCustomerData | null
  onClose: () => void
  onUpdated: (updated: CreateCustomerData) => void
}

const CustomerUpdateModal = ({ selectedCustomer, onClose, onUpdated }: Props): JSX.Element => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<CreateCustomerData>()

  useEffect(() => {
    if (selectedCustomer) {
      reset({
        name: selectedCustomer.name || '',
        phone: selectedCustomer.phone || '',
        address: selectedCustomer.address || ''
      })
    } else {
      reset({ name: '', phone: '', address: '' })
    }
  }, [selectedCustomer, reset])

  const submitHandler: SubmitHandler<CreateCustomerData> = async (data) => {
    if (!selectedCustomer) return

    try {
      const res = await window.electronAPI?.customers.update(selectedCustomer.id!, {
        ...data
      })

      if (res.success) {
        toast.success('Customer updated successfully!')
        onUpdated(res.data)
        onClose()
      } else {
        // alert('Update failed: ' + res.error)
        toast.error('Update failed: ' + res.error)
      }
    } catch (err) {
      toast.error('Error updating customer: ' + (err as Error).message)
    }
  }

  return (
    <>
      <NotificationBar />
      <dialog id="modify_customer" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg text-center">Modify Customer</h3>
          <form onSubmit={handleSubmit(submitHandler)}>
            {/* if there is a button in form, it will close the modal */}
            <button
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              type="button"
              onClick={() =>
                (document.getElementById('modify_customer') as HTMLDialogElement).close()
              }
            >
              ✕
            </button>

            <div className="mt-5 flex flex-col justify-center items-center">
              <div className="flex flex-col pb-2 w-full max-w-xs">
                <label className="font-semibold pb-1" htmlFor="name">
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="Enter name"
                  className="input input-bordered "
                  {...register('name', {
                    required: 'Name is required',
                    minLength: { value: 3, message: 'Name must be at least 3 characters' },
                    maxLength: { value: 40, message: 'Name must be less than 40 characters' }
                  })}
                />
                {errors.name && (
                  <p role="alert" className="text-error text-sm">
                    {errors.name.message}
                  </p>
                )}
              </div>
              <div className="flex flex-col pb-2  w-full max-w-xs">
                <label className="font-semibold pb-1" htmlFor="address">
                  Address
                </label>
                <input
                  type="text"
                  id="address"
                  className="input input-bordered"
                  placeholder="Enter address"
                  {...register('address', {
                    required: 'Address is required',
                    minLength: { value: 3, message: 'Address must be at least 3 characters' },
                    maxLength: { value: 100, message: 'Address must be less than 100 characters' }
                  })}
                  required
                />
                {errors.address && (
                  <p role="alert" className="text-error text-sm">
                    {errors.address.message}
                  </p>
                )}
              </div>
              <div className="flex flex-col pb-2  w-full max-w-xs">
                <label className="font-semibold pb-1" htmlFor="contact">
                  Contact
                </label>
                <input
                  type="tel"
                  id="phone"
                  placeholder="Enter phone number"
                  className="input input-bordered"
                  {...register('phone', {
                    required: 'Phone number is required',
                    pattern: { value: /^\+?\d{10,15}$/, message: 'Enter a valid phone number' }
                  })}
                />
                {errors.phone && (
                  <p role="alert" className="text-error text-sm">
                    {errors.phone.message}
                  </p>
                )}
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
