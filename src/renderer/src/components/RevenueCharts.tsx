import { Area, AreaChart, CartesianGrid, Tooltip, XAxis, YAxis } from 'recharts'
import { useEffect, useState } from 'react'

interface MonthlySalesData {
  month: string
  sales: number
  revenue: number
  orders: number
}

interface ChartData {
  name: string
  sales: number
}

const monthMap: Record<string, string> = {
  '01': 'Jan',
  '02': 'Feb',
  '03': 'Mar',
  '04': 'Apr',
  '05': 'May',
  '06': 'Jun',
  '07': 'Jul',
  '08': 'Aug',
  '09': 'Sep',
  '10': 'Oct',
  '11': 'Nov',
  '12': 'Dec'
}

const RevenueCharts = (): React.JSX.Element => {
  const [chartData, setChartData] = useState<ChartData[]>([])

  useEffect(() => {
    const fetchMonthlyData = async (): Promise<void> => {
      try {
        const response = await window.electronAPI?.analytics.get()
        if (response?.success && response?.data?.sales?.monthlyTrends) {
          const monthlyTrends: MonthlySalesData[] = response.data.sales.monthlyTrends

          const transformed = monthlyTrends.map((trend) => {
            const [year, month] = trend.month.split('-')
            const monthName = monthMap[month]

            return {
              name: `${monthName} ${year}`,
              sales: trend.sales
            }
          })

          setChartData(transformed)
        }
      } catch (error) {
        console.error('Error fetching monthly sales data:', error)
      }
    }

    fetchMonthlyData()
  }, [])

  return (
    <>
      <AreaChart
        width={570}
        height={200}
        data={chartData}
        margin={{ top: 0, right: 20, left: -20, bottom: 0 }}
      >
        <defs>
          <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="name" />
        <YAxis
          tickFormatter={(value) => {
            if (value >= 1000000) {
              return (value / 1000000).toFixed(1)
            }
            return value.toString()
          }}
        />
        <CartesianGrid strokeDasharray="3 3" />
        <Tooltip
          formatter={(value) =>
            `₦ ${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
          }
        />
        <Area
          type="monotone"
          dataKey="sales"
          stroke="#8884d8"
          fillOpacity={1}
          fill="url(#colorSales)"
          name="Total Monthly Sales"
        />
      </AreaChart>
    </>
  )
}

export default RevenueCharts
