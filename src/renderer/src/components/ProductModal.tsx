import { useForm, SubmitHandler } from 'react-hook-form'
import { CreateProductData } from '../../../main/api.types'
interface ProductModalProps {
  onProductCreated?: () => void // optional callback to refresh product list in parent
}

const ProductModal = ({ onProductCreated }: ProductModalProps): React.JSX.Element => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<CreateProductData>({ mode: 'onChange' })

  const onSubmit: SubmitHandler<CreateProductData> = async (data) => {
    try {
      // ⚡ Call directly via exposed API
      const response = await window.electronAPI?.products.create(data)

      if (response?.success) {
        console.log('✅ Product created:', response.data)
        onProductCreated?.() // tell parent to refresh list
        reset()
        ;(document.getElementById('add_product') as HTMLDialogElement)?.close()
      } else {
        console.error('❌ Failed to create product:', response?.error)
        alert(response?.msg || 'Failed to create product')
      }
    } catch (err) {
      console.error('⚠️ Error creating product:', err)
      alert('Something went wrong while saving product')
    }
  }

  return (
    <dialog id="add_product" className="modal">
      <div className="modal-box">
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Close button */}
          <button
            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            type="button"
            onClick={() => (document.getElementById('add_product') as HTMLDialogElement)?.close()}
          >
            ✕
          </button>

          <h3 className="font-bold text-lg text-center">Add New Product</h3>

          <div className="mt-5 flex flex-col justify-center items-center">
            {/* Product Name */}
            <div className="flex flex-col pb-2 w-full max-w-xs">
              <label className="font-semibold pb-1" htmlFor="name">
                Product Name
              </label>
              <input
                id="name"
                type="text"
                placeholder="Enter Product Name"
                className="input input-bordered"
                {...register('name', { required: 'Product name is required' })}
              />
              {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
            </div>

            {/* Price & Quantity */}
            <div className="flex items-center pb-2 max-w-xs gap-x-2">
              <div>
                <label className="font-semibold pb-1" htmlFor="sp">
                  Price
                </label>
                <input
                  type="number"
                  id="sp"
                  placeholder="Price"
                  className="input input-bordered"
                  {...register('price', {
                    required: 'Price is required',
                    valueAsNumber: true
                  })}
                />
                {errors.price && <p className="text-red-500 text-sm">{errors.price.message}</p>}
              </div>
              <div>
                <label className="font-semibold pb-1" htmlFor="qty">
                  Quantity
                </label>
                <input
                  type="number"
                  id="qty"
                  placeholder="0"
                  className="input input-bordered w-11/12"
                  {...register('quantity', {
                    required: 'Quantity is required',
                    valueAsNumber: true
                  })}
                />
                {errors.quantity && (
                  <p className="text-red-500 text-sm">{errors.quantity.message}</p>
                )}
              </div>
            </div>

            {/* Transaction Type */}
            <div className="flex flex-col pb-2 w-full max-w-xs">
              <label className="font-semibold pb-1" htmlFor="transaction">
                Transaction Type
              </label>
              <select
                id="transaction"
                className="select select-bordered"
                {...register('type', { required: 'Transaction type is required' })}
                defaultValue=""
              >
                <option value="" disabled>
                  Pick one
                </option>
                <option value="stock">New Stock</option>
                <option value="return">Return</option>
              </select>
              {errors.type && <p className="text-red-500 text-sm">{errors.type.message}</p>}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="my-4 btn btn-accent w-full max-w-xs"
            >
              {isSubmitting ? 'Saving...' : 'Save Product'}
            </button>
          </div>
        </form>
      </div>
    </dialog>
  )
}

export default ProductModal
