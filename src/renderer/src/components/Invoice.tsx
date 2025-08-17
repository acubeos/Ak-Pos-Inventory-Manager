const Invoice = (): React.JSX.Element => {
  return (
    <div className="card card-compact bg-slate-100 w-96 border">
      <div className="card-body ">
        <div className="card-actions justify-end">
          <button className="btn text-red-600 btn-square btn-xs">X</button>
        </div>
        <h4 className="card-title -mt-9">
          <div className="badge badge-secondary">CN</div> Customer Name
        </h4>
        <h4 className="-mt-4 pl-12">Invoice No</h4>
        <div className="flex justify-between">
          <div>Tue, July 11, 2024</div>
          <div>11:00am</div>
        </div>
        <div className="h-40 mt-2 overflow-x-auto">
          <table className="table table-xs border">
            <thead>
              <tr>
                <th>Items</th>
                <th>Quantity</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Bece Oyo</td>
                <td>20</td>
                <td>60,000</td>
              </tr>
              <tr>
                <td>Neco</td>
                <td>10</td>
                <td>30,000</td>
              </tr>
              <tr>
                <td>SSCE</td>
                <td>5</td>
                <td>20,000</td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <th>Total</th>
                <td></td>
                <th>#105,000</th>
              </tr>
              <tr>
                <th>Amount paid</th>
                <td></td>
                <th>#85,000</th>
              </tr>
            </tfoot>
          </table>
          {/* <div className="card-actions justify-end mt-1">
            <button className="btn btn-primary btn-xs">Print</button>
          </div> */}
        </div>
        <div className="card-actions justify-end">
          <button className="btn btn-primary btn-xs">Print</button>
        </div>
      </div>
    </div>
  )
}

export default Invoice
