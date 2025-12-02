import { Link } from 'react-router-dom'
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

      {/* Quick Actions */}
      <div className="px-4 pt-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-sm text-gray-700">
              Backup your data or transfer it to another computer
            </span>
          </div>
          <Link to="/settings" className="btn btn-sm btn-primary">
            Go to Settings
          </Link>
        </div>
      </div>

      {/* Transaction history  */}
      <div className="px-4 pt-4 pb-2 font-semibold">Recent Transactions</div>
      <DashboardTable />
    </div>
  )
}

export default Dashboard
