import { SubmitHandler, useForm } from 'react-hook-form'
import { CreateCustomerData } from '../../../main/api.types'
import NotificationBar from './NotificationBar'
import toast from 'react-hot-toast'

interface Props {
  onClose: () => void
  onSuccess?: () => void
}

const CustomerModal = ({ onClose, onSuccess }: Props): React.JSX.Element => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<CreateCustomerData>({ mode: 'onChange' })

  const submitHandler: SubmitHandler<CreateCustomerData> = async (data) => {
    try {
      const newCustomer = await window.electronAPI?.customers?.create(data)
      toast.success(`${newCustomer.data.name} added successfully!`)

      reset({ name: '', phone: '', address: '' })
      onClose()
      onSuccess && onSuccess()
    } catch (error) {
      toast.error('Failed to add customer. Please try again.')
      console.error('Error adding customer:', error)
    }
  }

  return (
    <>
      <NotificationBar />
      <dialog id="add_customer" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-center">Add New Customer</h3>
          <form onSubmit={handleSubmit(submitHandler)}>
            <button
              type="button"
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              onClick={() => onClose()}
            >
              ✕
            </button>

            {/* inputs */}
            <div className="mt-5 flex flex-col justify-center items-center">
              <div className="flex flex-col pb-2 w-full max-w-xs">
                <label className="font-semibold pb-1" htmlFor="name">
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  className="input input-bordered"
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

              <div className="flex flex-col pb-2 w-full max-w-xs">
                <label className="font-semibold pb-1" htmlFor="address">
                  Address
                </label>
                <input
                  id="address"
                  type="text"
                  className="input input-bordered"
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

              <div className="flex flex-col pb-2 w-full max-w-xs">
                <label className="font-semibold pb-1" htmlFor="phone">
                  Contact
                </label>
                <input
                  id="phone"
                  type="tel"
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
                Save Customer
              </button>
            </div>
          </form>
        </div>
      </dialog>
    </>
  )
}

export default CustomerModal
