import moment from 'moment'

export const formatDate = (date: string, time?: boolean): string => {
  const newDate = moment(date).format(time ? 'DD/MM/YYYY HH:mm:ss' : 'DD/MM/YYYY')
  return newDate
}

export const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    trailingZeroDisplay: 'stripIfInteger'
  }).format(amount)
