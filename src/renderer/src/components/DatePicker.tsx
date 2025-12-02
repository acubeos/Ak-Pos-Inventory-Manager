import { useState } from 'react'
import Datepicker from 'react-tailwindcss-datepicker'
interface DatePickerProps {
  onDateChange: (dateRange: { startDate: Date | null; endDate: Date | null }) => void
}

const DatePicker = ({ onDateChange }: DatePickerProps): React.JSX.Element => {
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
