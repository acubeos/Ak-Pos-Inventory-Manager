import { formatDate } from '@renderer/helpers/general'
import left from '../assets/icons/icon-left.png'
import right from '../assets/icons/icon-right.png'

const Outstanding = (): React.JSX.Element => {
  const sales = [
    {
      id: 1,
      last_updated: '2023-10-01T12:00:00Z',
      Customer: { name: 'John Doe' },
      outstanding: 1500.0
    },
    {
      id: 2,
      last_updated: '2023-10-02T12:00:00Z',
      Customer: { name: 'Jane Smith' },
      outstanding: 2000.0
    }
  ]

  return (
    <div className=" ml-16 h-screen w-screen pr-16 pt-4">
      <div className="flex justify-between pb-3 pl-2 px-4">
        <h1 className="text-2xl font-semibold">Outstanding Balance</h1>
        <button className="btn btn-sm btn-outline btn-accent">Print</button>
      </div>
      <hr></hr>

      <table className="table table-zebra">
        {/* head */}
        <thead className="bg-accent">
          <tr>
            <th>Last Updated</th>
            <th>Customer</th>
            <th>Total Amount Outstanding</th>
          </tr>
        </thead>
        <tbody>
          {/* row 1 */}
          {sales &&
            sales.map((sale) => (
              <tr key={sale.id}>
                <th>{formatDate(sale.last_updated)}</th>
                <td>{sale.Customer.name}</td>
                <td># {sale.outstanding}</td>
              </tr>
            ))}
        </tbody>
      </table>
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

            // value={filters.limit}
          >
            <option value="10">10</option>
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

export default Outstanding
