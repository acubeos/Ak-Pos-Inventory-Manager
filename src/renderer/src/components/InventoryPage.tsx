import { useEffect, useState } from 'react'
import { formatDate } from '@renderer/helpers/general'
import { Link } from 'react-router-dom'
import deleteIcon from '../assets/icons/deleteIcon.png'
import ProductModal from './ProductModal'
import ProductUpdateModal from './ProductUpdateModal'
import { SingleProduct } from '../../../main/api.types'
import ConfirmDialog from './ConfirmDialog'

const Inventory = (): React.JSX.Element => {
  const [products, setProducts] = useState<SingleProduct[]>([])
  const [loading, setLoading] = useState(false)
  const [deleteProductId, setDeleteProductId] = useState<number | null>(null)

  const fetchProducts = async (): Promise<void> => {
    try {
      setLoading(true)
      const res = await window.electronAPI?.products.getAll()

      if (res?.success) {
        setProducts(res.data.product || [])
      }
    } catch (err) {
      console.error('Failed to fetch products:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (): Promise<void> => {
    if (deleteProductId === null) return
    try {
      const res = await window.electronAPI?.products.delete(deleteProductId)
      if (res?.success) {
        setProducts((prev) => prev.filter((p) => p.id !== deleteProductId))
      } else {
        alert(res?.msg || 'Delete failed')
      }
    } catch (err) {
      console.error('Delete failed:', err)
    } finally {
      setDeleteProductId(null)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  return (
    <div className="bg-slate-100 ml-16 h-screen w-screen pr-16">
      <div className="pb-4 pt-1 pl-2">
        <h1 className="text-2xl font-semibold">Inventory</h1>
        <p className="text-xs text-gray-400">{products.length} Product(s)</p>
      </div>
      <hr />

      <div className="flex flex-row justify-between pl-2">
        <div>
          <button
            type="button"
            className="btn btn-accent btn-sm my-4"
            onClick={() =>
              (document.getElementById('add_product') as HTMLDialogElement)?.showModal()
            }
          >
            Add Product
          </button>
          <Link className="btn btn-outline btn-accent btn-sm my-4 ml-4" to="/stockHistory">
            Stock History
          </Link>
        </div>
        <button
          type="button"
          className="btn btn-outline btn-error btn-sm my-4 mr-4"
          onClick={() =>
            (document.getElementById('modify_product') as HTMLDialogElement)?.showModal()
          }
        >
          Update Product
        </button>
      </div>

      {/* Modals */}
      <ProductModal onProductCreated={fetchProducts} />
      <ProductUpdateModal products={products} onProductUpdated={fetchProducts} />

      <div className="overflow-x-auto max-h-[420px]">
        <table className="table table-xs table-pin-rows">
          <thead className="bg-accent">
            <tr>
              <th>Product</th>
              <th>Price</th>
              <th>Available</th>
              <th>Modified</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-4">
                  Loading...
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-4">
                  No products found
                </td>
              </tr>
            ) : (
              products.map((p) => (
                <tr key={p.uuid}>
                  <td>{p.name}</td>
                  <td># {p.price.toLocaleString()}</td>
                  <td>{p.quantity}</td>
                  <td>{formatDate(p.last_updated)}</td>
                  <td>{p.status === 1 ? 'Active' : 'Inactive'}</td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-xs btn-square btn-error"
                      onClick={() => {
                        setDeleteProductId(p.id)
                        ;(
                          document.getElementById('confirm_delete') as HTMLDialogElement
                        )?.showModal()
                      }}
                    >
                      <img src={deleteIcon} alt="delete" className="mx-auto w-1/2" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <ConfirmDialog
          id="confirm_delete"
          title="Delete Product"
          message="Are you sure you want to delete this product?"
          confirmText="Yes, Delete"
          cancelText="Cancel"
          onConfirm={handleDelete}
        />
      </div>
    </div>
  )
}

export default Inventory
