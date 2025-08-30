import React, { useState, useEffect } from 'react'
import { SingleProduct } from '../../../main/api.types'

interface Props {
  products: SingleProduct[]
  onProductUpdated?: () => void
}

const ProductUpdateModal: React.FC<Props> = ({ products, onProductUpdated }) => {
  const [selectedProduct, setSelectedProduct] = useState<SingleProduct | null>(null)
  const [quantity, setQuantity] = useState<number | ''>('')
  // const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (selectedProduct) setQuantity(selectedProduct.quantity)
  }, [selectedProduct])

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    if (!selectedProduct || quantity === '') return

    const newQuantity = (selectedProduct.quantity || 0) + Number(quantity)

    try {
      const res = await window.electronAPI?.products.update(selectedProduct.id, {
        quantity: newQuantity
      })
      if (res?.success) {
        onProductUpdated?.()
        ;(document.getElementById('modify_product') as HTMLDialogElement)?.close()
        setSelectedProduct(null)
        setQuantity('')
      } else {
        // setError(res?.msg || 'Update failed')
      }
    } catch (err) {
      console.error('Update failed:', err)
      // setError('Update failed. Please try again.')
    }
  }

  return (
    <dialog id="modify_product" className="modal">
      <div className="modal-box">
        <form onSubmit={handleSubmit}>
          <button
            type="button"
            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            onClick={() =>
              (document.getElementById('modify_product') as HTMLDialogElement)?.close()
            }
          >
            ✕
          </button>

          <h3 className="font-bold text-lg text-center">Update Product</h3>

          <div className="mt-5 flex flex-col justify-center items-center">
            <div className="flex flex-col pb-2 w-full max-w-xs">
              <label className="font-semibold pb-1" htmlFor="product">
                Product
              </label>
              <select
                id="product"
                className="select select-bordered"
                value={selectedProduct?.id || ''}
                onChange={(e) => {
                  const prod = products.find((p) => p.id === Number(e.target.value)) || null
                  setSelectedProduct(prod)
                }}
                required
              >
                <option value="">Pick one</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col pb-2 w-full max-w-xs">
              <label className="font-semibold pb-1" htmlFor="qty">
                Additional Quantity
              </label>
              <input
                id="qty"
                type="number"
                className="input input-bordered"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                disabled={!selectedProduct}
                required
                min={1}
              />
              {selectedProduct && (
                <small className="text-gray-500">Current stock: {selectedProduct.quantity}</small>
              )}
            </div>

            <button type="submit" className="my-4 btn btn-accent w-full max-w-xs">
              Update Product
            </button>
          </div>
        </form>
      </div>
    </dialog>
  )
}

export default ProductUpdateModal
