import { SubmitHandler, useForm } from 'react-hook-form'
import { CreateCustomerData } from '../../../main/api.types'

const CustomerModal = (): React.JSX.Element => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<CreateCustomerData>({ mode: 'onChange' }) //Add 'mode' for real-time validation

  const submitHandler: SubmitHandler<CreateCustomerData> = async (data) => {
    if (!window.electronAPI) {
      console.error('Electron API is undefined')
      alert('API is not available. Make sure preload script is working.')
      return
    }
    if (!window.electronAPI.customers) {
      console.error('create customer API is undefined')
      alert('API is not available. Make sure preload script is working.')
      return
    }
    try {
      const newCustomer = await window.electronAPI.customers.create(data)
      console.log('New Customer ID:', newCustomer)
      alert(`Customer added successfully! New ID: ${newCustomer.data.name}`)
      reset()
      ;(document.getElementById('add_customer') as HTMLDialogElement)?.close()
    } catch (error) {
      alert('Failed to add customer. Check the console for details.')
      console.error('Error adding customer:', error)
    }
  }

  return (
    <dialog id="add_customer" className="modal">
      <div className="modal-box">
        <form method="dialog" onSubmit={handleSubmit(submitHandler)}>
          <h3 className="font-bold text-center">Add New Customer</h3>
          {/* if there is a button in form, it will close the modal */}
          <button
            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            type="button"
            onClick={() => (document.getElementById('add_customer') as HTMLDialogElement)?.close()}
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

            <div className="flex flex-col pb-2 w-full max-w-xs">
              <label className="font-semibold pb-1" htmlFor="address">
                Address
              </label>
              <input
                type="text"
                id="address"
                placeholder="Enter address"
                className="input input-bordered"
                {...register('address', {
                  required: 'Address is required',
                  minLength: { value: 3, message: 'Address must be at least 5 characters' },
                  maxLength: { value: 100, message: 'Address must be less than 100 characters' }
                })}
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
                type="tel"
                id="phone"
                placeholder="Enter phone number"
                className="input input-bordered"
                {...register('phone', {
                  required: 'Phone number is required',
                  minLength: { value: 11, message: 'Phone number must be at least 11 digits' }
                })}
              />
              {errors.phone && (
                <p role="alert" className="text-error text-sm">
                  {errors.phone.message}
                </p>
              )}
            </div>
            <button className="my-4 btn btn-accent w-full max-w-xs">Save Customer</button>
          </div>
        </form>
      </div>
    </dialog>
  )
}

export default CustomerModal
