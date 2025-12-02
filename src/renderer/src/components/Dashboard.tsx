import RevenueCharts from './RevenueCharts'
import Cards from './DashboardCards'
import DashboardTable from './DashboardTable'

const Dashboard = (): React.JSX.Element => {
  return (
    <div className="h-screen w-screen pl-16">
      <div className="flex gap-x-4 pt-1">
        <div className="border basis-auto bg-white rounded-lg p-2 ml-4 ">
          <h2 className="pl-2 font-semibold pb-2">Revenue(M)</h2>
          <RevenueCharts />
        </div>
        <Cards />
      </div>

      {/* Transaction history  */}
      <div className="px-4 pt-4 pb-2 font-semibold">Recent Transactions</div>
      <DashboardTable />
    </div>
  )
}

export default Dashboard
