import { Area, AreaChart, CartesianGrid, Tooltip, XAxis, YAxis } from 'recharts'

const RevenueCharts = (): React.JSX.Element => {
  const data = [
    {
      name: 'Jan',
      uv: 4.0,
      pv: 2.4,
      amt: 2400
    },
    {
      name: 'Feb',
      uv: 3.0,
      pv: 1.398,
      amt: 2210
    },
    {
      name: 'Mar',
      uv: 2.0,
      pv: 9.8,
      amt: 2290
    },
    {
      name: 'Apr',
      uv: 2.78,
      pv: 3.908,
      amt: 2000
    },
    {
      name: 'May',
      uv: 1.89,
      pv: 4.8,
      amt: 2181
    },
    {
      name: 'Jun',
      uv: 2.39,
      pv: 3.8,
      amt: 2500
    },
    {
      name: 'Jul',
      uv: 3.49,
      pv: 4.3,
      amt: 2100
    },
    {
      name: 'Aug',
      uv: 3.49,
      pv: 4.3,
      amt: 2100
    },
    {
      name: 'Sept',
      uv: 3.49,
      pv: 4.3,
      amt: 2100
    },
    {
      name: 'Oct',
      uv: 3.49,
      pv: 4.3,
      amt: 2100
    },
    {
      name: 'Nov',
      uv: 3.49,
      pv: 4.3,
      amt: 2100
    },
    {
      name: 'Dec',
      uv: 3.49,
      pv: 4.3,
      amt: 2100
    }
  ]

  return (
    <>
      <AreaChart
        width={570}
        height={200}
        data={data}
        margin={{ top: 0, right: 20, left: -20, bottom: 0 }}
      >
        <defs>
          <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="name" />
        <YAxis />
        <CartesianGrid strokeDasharray="3 3" />
        <Tooltip />
        <Area type="monotone" dataKey="uv" stroke="#8884d8" fillOpacity={1} fill="url(#colorUv)" />
        <Area type="monotone" dataKey="pv" stroke="#82ca9d" fillOpacity={1} fill="url(#colorPv)" />
      </AreaChart>
    </>
  )
}

export default RevenueCharts
