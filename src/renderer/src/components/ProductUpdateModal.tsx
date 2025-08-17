import React from 'react'

const ProductUpdateModal: React.FC = () => {
  const productData = [
    { uuid: '1', name: 'Book A' },
    { uuid: '2', name: 'Book B' },
    { uuid: '3', name: 'Book C' }
  ]

  return (
    <>
      <dialog id="modify_product" className="modal">
        <div className="modal-box">
          <form method="dialog">
            {/* if there is a button in form, it will close the modal */}
            <button
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              onClick={() =>
                (document.getElementById('modify_product') as HTMLDialogElement)?.close()
              }
            >
              ✕
            </button>
            <h3 className="font-bold text-lg text-center">Update Product</h3>

            <div className="mt-5 flex flex-col justify-center items-center">
              <div className="flex flex-col pb-2  w-full max-w-xs">
                <label className="font-semibold pb-1" htmlFor="book">
                  Books
                </label>
                <select id="book" className="select select-bordered">
                  <option disabled selected>
                    Pick one
                  </option>
                  {productData.map((product) => (
                    <option key={product.uuid} value={JSON.stringify(product)}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col pb-2 w-full max-w-xs">
                <label className="font-semibold pb-1" htmlFor="qty">
                  Quantity
                </label>
                <input
                  id="qty"
                  type="number"
                  placeholder="Quantity"
                  className="input input-bordered "
                  required
                />
              </div>
              <button type="submit" className="my-4 btn btn-accent w-full max-w-xs">
                Update Product
              </button>
            </div>
          </form>
        </div>
      </dialog>
    </>
  )
}

export default ProductUpdateModal
