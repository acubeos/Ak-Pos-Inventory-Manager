import { useState } from 'react'
import Datepicker from 'react-tailwindcss-datepicker'
interface DatePickerCProps {
  onDateChange: (dateRange: { startDate: string | null; endDate: string | null }) => void
}

const DatePicker = ({ onDateChange }: DatePickerCProps): React.JSX.Element => {
  const [value, setValue] = useState({
    startDate: null,
    endDate: null
  })

  const handleValueChange = (newValue): void => {
    setValue(newValue)
    onDateChange(newValue)
  }

  return <Datepicker value={value} onChange={handleValueChange} showShortcuts={true} />
}

export default DatePicker
