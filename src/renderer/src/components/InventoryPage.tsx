import { formatDate } from '@renderer/helpers/general'
import { Link } from 'react-router-dom'
import deleteIcon from '../assets/icons/deleteIcon.png'
import left from '../assets/icons/icon-left.png'
import right from '../assets/icons/icon-right.png'
import ProductModal from './ProductModal'
import ProductUpdateModal from './ProductUpdateModal'

const Inventory = (): React.JSX.Element => {
  const products = [
    {
      uuid: '1',
      name: 'Product A',
      price: 1000,
      available: 50,
      last_updated: new Date(),
      amountSold: 5000,
      purchased: 30
    },
    {
      uuid: '2',
      name: 'Product B',
      price: 2000,
      available: 20,
      last_updated: new Date(),
      amountSold: 4000,
      purchased: 10
    }
    // Add more products as needed
  ]

  return (
    <div className="bg-slate-100 ml-16 h-screen w-screen pr-16">
      <div className="pb-4 pt-1 pl-2">
        <h1 className="text-2xl font-semibold">Inventory</h1>
        <p className="text-xs text-gray-400">6 Product(s)</p>
      </div>
      <hr></hr>

      <form onSubmit={(e) => e.preventDefault()}>
        <div className="flex flex-row justify-between pl-2">
          <div>
            <button
              className="btn btn-accent btn-sm my-4"
              onClick={() => {
                const modal = document.getElementById('add_product') as HTMLDialogElement
                modal.showModal()
              }}
            >
              Add Product
            </button>
            <Link className="btn btn-outline btn-accent btn-sm my-4 ml-4" to="/stockHistory">
              Stock History
            </Link>
          </div>
          <button
            className="btn btn-outline btn-error btn-sm my-4 mr-4"
            onClick={() => {
              const modal = document.getElementById('modify_product') as HTMLDialogElement
              modal.showModal()
            }}
          >
            Update Product
          </button>
        </div>
        <ProductModal />
        <ProductUpdateModal />
        <div className="overflow-x-auto max-h-[420px]">
          <table className="table table-xs table-pin-rows">
            {/* head */}
            <thead className="bg-accent">
              <tr>
                <th>Product</th>
                <th>Price</th>
                <th>Available</th>
                <th>Modified</th>
                <th>Total Sale</th>
                <th>Total Products Sold</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {/* row 1 */}
              {products.map((product) => (
                <tr key={product.uuid}>
                  <th>{product.name}</th>
                  <td># {product.price.toLocaleString()}</td>
                  <td>{product.available}</td>
                  <td>{formatDate(product.last_updated.toISOString())}</td>
                  <td>{product.amountSold}</td>
                  <td>{product.purchased}</td>
                  <td>
                    <button className="btn btn-xs btn-square btn-error">
                      <img src={deleteIcon} alt="icon" className="mx-auto w-1/2" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </form>
      <div className="flex flex-row mt-2 ml-2 gap-x-2 align-center items-center">
        <button className="btn btn-xs btn-ghost btn-square">
          <img src={left} alt="Previous" />
        </button>
        <div className="flex flex-row gap-x-2 items-center ml-4">
          <label htmlFor="page" className="block text-sm font-medium">
            Page:
          </label>
        </div>
        <div className="flex flex-row gap-x-2 items-center">
          <label htmlFor="limit" className="block text-sm font-medium">
            Limit:
          </label>
          <select
            id="limit"
            name="limit"
            className="select select-xs select-bordered w-full max-w-xs"
          >
            <option value="8">8</option>
            <option value="15">15</option>
          </select>
        </div>
        <button className="btn btn-xs btn-ghost btn-square">
          <img src={right} alt="Next" />
        </button>
      </div>
    </div>
  )
}

export default Inventory
