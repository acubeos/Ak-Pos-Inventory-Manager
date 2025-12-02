import React, { useState, useMemo, useEffect } from 'react'
import { formatCurrency, formatDate } from '@renderer/helpers/general'
import ConfirmDialog from './ConfirmDialog'
import NotificationBar from './NotificationBar'
import toast from 'react-hot-toast'

interface OutstandingSale {
  id: number
  last_updated: string
  Customer: {
    name: string
    phone?: string
    address?: string
    creditLimit?: number
  }
  outstanding: number
  individualSales?: Array<{
    id: number
    created_at: string
    total_amount: number
    outstanding_amount: number
    payment_status?: string
  }>
  outstanding_sales_count?: number
}

interface PaymentModalProps {
  isOpen: boolean
  sale: OutstandingSale | null
  onClose: () => void
  onPayment: (
    customerId: number,
    amount: number,
    isPartial: boolean,
    paymentMethod: string
  ) => Promise<void>
}

interface CustomerDetailModalProps {
  isOpen: boolean
  sale: OutstandingSale | null
  onClose: () => void
  onRefresh: () => Promise<void>
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, sale, onClose, onPayment }) => {
  const [paymentAmount, setPaymentAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [notes, setNotes] = useState('')
  const [isPartialPayment, setIsPartialPayment] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    if (sale) {
      setPaymentAmount(sale.outstanding.toString())
      setIsPartialPayment(false)
      setNotes('')
      setPaymentMethod('cash')
    }
  }, [sale])

  const handleSubmit = async (): Promise<void> => {
    const amount = parseFloat(paymentAmount)
    if (amount > 0 && amount <= (sale?.outstanding || 0)) {
      setIsProcessing(true)
      try {
        await onPayment(sale!.id, amount, amount < sale!.outstanding, paymentMethod)
        onClose()
      } catch (error) {
        console.error('Payment failed:', error)
      } finally {
        setIsProcessing(false)
      }
    }
  }

  if (!isOpen || !sale) return null

  return (
    <>
      <NotificationBar />
      <div className="modal modal-open">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Process Payment</h3>
          <div className="py-4">
            <p>
              <strong>Customer:</strong> {sale.Customer.name}
            </p>
            <p>
              <strong>Outstanding:</strong> {formatCurrency(sale.outstanding)}
            </p>

            <div className="form-control mt-4">
              <label className="label">
                <span className="label-text">Payment Amount</span>
              </label>
              <input
                type="number"
                value={paymentAmount}
                onChange={(e) => {
                  setPaymentAmount(e.target.value)
                  setIsPartialPayment(parseFloat(e.target.value) < sale.outstanding)
                }}
                className="input input-bordered"
                max={sale.outstanding}
                min={0}
                step="0.01"
                placeholder="Enter payment amount"
                disabled={isProcessing}
              />
            </div>

            <div className="form-control mt-3">
              <label className="label">
                <span className="label-text">Payment Method</span>
              </label>
              <select
                className="select select-bordered"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                disabled={isProcessing}
                aria-label="Payment Method"
              >
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="check">Check</option>
                <option value="mobile_payment">Mobile Payment</option>
              </select>
            </div>

            <div className="form-control mt-3">
              <label className="label">
                <span className="label-text">Notes (Optional)</span>
              </label>
              <textarea
                className="textarea textarea-bordered"
                placeholder="Add any notes about this payment..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={isProcessing}
                rows={2}
              />
            </div>

            {isPartialPayment && (
              <div className="alert alert-info mt-3">
                <span>
                  Remaining balance:{' '}
                  {formatCurrency(sale.outstanding - parseFloat(paymentAmount || '0'))}
                </span>
              </div>
            )}
          </div>

          <div className="modal-action">
            <button className="btn btn-ghost" onClick={onClose} disabled={isProcessing}>
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={!paymentAmount || parseFloat(paymentAmount) <= 0 || isProcessing}
            >
              {isProcessing ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Processing...
                </>
              ) : (
                'Process Payment'
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

const CustomerDetailModal: React.FC<CustomerDetailModalProps> = ({
  isOpen,
  sale,
  onClose,
  onRefresh
}) => {
  const [isLoadingDetails, setIsLoadingDetails] = useState(false)
  const [detailedInfo, setDetailedInfo] = useState<any>(null)

  const loadCustomerDetails = React.useCallback(async (): Promise<void> => {
    if (!sale) return

    setIsLoadingDetails(true)
    try {
      const response = await window.electronAPI?.payments.getCustomerDetails(sale.id)
      if (response.success) {
        setDetailedInfo(response.data)
      }
    } catch (error) {
      console.error('Failed to load customer details:', error)
    } finally {
      setIsLoadingDetails(false)
    }
  }, [sale])

  useEffect(() => {
    if (isOpen && sale) {
      loadCustomerDetails()
    }
  }, [isOpen, sale, loadCustomerDetails])

  if (!isOpen || !sale) return null

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-5xl">
        <h3 className="font-bold text-lg mb-4">Customer Details: {sale.Customer.name}</h3>

        {isLoadingDetails ? (
          <div className="flex justify-center items-center py-8">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : (
          <div className="py-4">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-base-200 p-4 rounded-lg">
                <p className="text-sm opacity-70">Contact Information</p>
                <p className="mt-2">
                  <strong>Phone:</strong> {sale.Customer.phone || 'N/A'}
                </p>
                <p>
                  <strong>Address:</strong> {sale.Customer.address || 'N/A'}
                </p>
              </div>
              <div className="bg-base-200 p-4 rounded-lg">
                <p className="text-sm opacity-70">Account Summary</p>
                <p className="mt-2">
                  <strong>Total Outstanding:</strong> {formatCurrency(sale.outstanding)}
                </p>
                {sale.Customer.creditLimit && (
                  <p>
                    <strong>Credit Limit:</strong> {formatCurrency(sale.Customer.creditLimit)}
                  </p>
                )}
                <p>
                  <strong>Last Updated:</strong> {formatDate(sale.last_updated)}
                </p>
              </div>
            </div>

            {detailedInfo && (
              <>
                {/* Outstanding Sales */}
                {detailedInfo.outstandingSales && detailedInfo.outstandingSales.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-semibold mb-3 text-lg">Outstanding Sales</h4>
                    <div className="overflow-x-auto">
                      <table className="table table-sm table-zebra">
                        <thead>
                          <tr>
                            <th>Sale ID</th>
                            <th>Date</th>
                            <th>Total Amount</th>
                            <th>Outstanding</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {detailedInfo.outstandingSales.map((individualSale) => (
                            <tr key={individualSale.id}>
                              <td>#{individualSale.id}</td>
                              <td>{formatDate(individualSale.created_at)}</td>
                              <td>{formatCurrency(individualSale.total_amount)}</td>
                              <td className="text-error font-semibold">
                                {formatCurrency(individualSale.outstanding_amount)}
                              </td>
                              <td>
                                <span
                                  className={`badge badge-sm ${
                                    individualSale.payment_status === 'paid'
                                      ? 'badge-success'
                                      : individualSale.payment_status === 'partial'
                                        ? 'badge-warning'
                                        : 'badge-error'
                                  }`}
                                >
                                  {individualSale.payment_status || 'pending'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Payment History */}
                {detailedInfo.paymentHistory && detailedInfo.paymentHistory.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3 text-lg">Recent Payment History</h4>
                    <div className="overflow-x-auto">
                      <table className="table table-sm table-zebra">
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Amount</th>
                            <th>Method</th>
                            <th>Sale ID</th>
                            <th>Notes</th>
                          </tr>
                        </thead>
                        <tbody>
                          {detailedInfo.paymentHistory.slice(0, 10).map((payment) => (
                            <tr key={payment.id}>
                              <td>{formatDate(payment.payment_date)}</td>
                              <td className="text-success font-semibold">
                                {formatCurrency(payment.payment_amount)}
                              </td>
                              <td>
                                <span className="badge badge-sm">{payment.payment_method}</span>
                              </td>
                              <td>{payment.sale_id ? `#${payment.sale_id}` : 'General'}</td>
                              <td className="text-sm opacity-70">{payment.notes || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Analytics Summary */}
                {detailedInfo.agingAnalysis && (
                  <div className="mt-6 bg-base-200 p-4 rounded-lg">
                    <h4 className="font-semibold mb-3">Aging Analysis</h4>
                    <div className="grid grid-cols-4 gap-4 text-center">
                      <div>
                        <p className="text-sm opacity-70">Current</p>
                        <p className="text-lg font-bold">
                          {formatCurrency(detailedInfo.agingAnalysis.current.amount)}
                        </p>
                        <p className="text-xs">
                          ({detailedInfo.agingAnalysis.current.count} sales)
                        </p>
                      </div>
                      <div>
                        <p className="text-sm opacity-70">31-60 Days</p>
                        <p className="text-lg font-bold text-warning">
                          {formatCurrency(detailedInfo.agingAnalysis['31-60'].amount)}
                        </p>
                        <p className="text-xs">
                          ({detailedInfo.agingAnalysis['31-60'].count} sales)
                        </p>
                      </div>
                      <div>
                        <p className="text-sm opacity-70">61-90 Days</p>
                        <p className="text-lg font-bold text-error">
                          {formatCurrency(detailedInfo.agingAnalysis['61-90'].amount)}
                        </p>
                        <p className="text-xs">
                          ({detailedInfo.agingAnalysis['61-90'].count} sales)
                        </p>
                      </div>
                      <div>
                        <p className="text-sm opacity-70">90+ Days</p>
                        <p className="text-lg font-bold text-error">
                          {formatCurrency(detailedInfo.agingAnalysis['90+'].amount)}
                        </p>
                        <p className="text-xs">({detailedInfo.agingAnalysis['90+'].count} sales)</p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        <div className="modal-action">
          <button
            className="btn btn-ghost"
            onClick={async () => {
              await onRefresh()
              onClose()
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

const Outstanding = (): React.JSX.Element => {
  const [isLoading, setIsLoading] = useState(true)
  const [outstandingSales, setOutstandingSales] = useState<OutstandingSale[]>([])
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const maxRetries = 3

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [filterBy, setFilterBy] = useState<'all' | 'current' | 'overdue'>('all')

  // Modal states
  const [paymentModal, setPaymentModal] = useState<{
    isOpen: boolean
    sale: OutstandingSale | null
  }>({
    isOpen: false,
    sale: null
  })
  const [detailModal, setDetailModal] = useState<{ isOpen: boolean; sale: OutstandingSale | null }>(
    {
      isOpen: false,
      sale: null
    }
  )

  // Sorting state
  const [sortBy, setSortBy] = useState<'customer' | 'outstanding' | 'last_updated' | 'aging'>(
    'outstanding'
  )
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const getAgingInfo = (lastUpdated: string): { label: string; class: string; days: number } => {
    const days = Math.floor((Date.now() - new Date(lastUpdated).getTime()) / (1000 * 60 * 60 * 24))
    if (days <= 30) return { label: 'Current', class: 'badge-success', days }
    if (days <= 60) return { label: '31-60 days', class: 'badge-warning', days }
    if (days <= 90) return { label: '61-90 days', class: 'badge-error', days }
    return { label: '90+ days', class: 'badge-error', days }
  }

  const fetchOutstandingData = React.useCallback(
    async (isRetry = false): Promise<void> => {
      try {
        setIsLoading(true)
        setError(null)

        const response = await window.electronAPI?.payments.getOutstanding({
          agingFilter: filterBy === 'all' ? undefined : filterBy,
          searchTerm: searchTerm || undefined
        })

        if (!response.success || !response.data) {
          throw new Error(response.error || 'Failed to fetch outstanding payments')
        }

        const { outstandingPayments } = response.data

        const mappedSales: OutstandingSale[] = outstandingPayments.map((payment) => ({
          id: payment.customer_id,
          last_updated: payment.last_updated,
          Customer: {
            name: payment.customer_name,
            phone: payment.customer_phone,
            address: payment.customer_address,
            creditLimit: payment.credit_limit
          },
          outstanding: payment.total_outstanding,
          outstanding_sales_count: payment.outstanding_sales_count,
          individualSales: payment.sale_ids
            ? payment.sale_ids.split(',').map((id) => ({
                id: parseInt(id),
                created_at: '',
                total_amount: 0,
                outstanding_amount: 0
              }))
            : []
        }))

        setOutstandingSales(mappedSales)
        setRetryCount(0)
      } catch (err) {
        console.error('Error fetching outstanding sales:', err)

        if (retryCount < maxRetries && !isRetry) {
          setRetryCount((prev) => prev + 1)
          setTimeout(() => fetchOutstandingData(true), 2000)
        } else {
          setError(err instanceof Error ? err.message : 'Failed to fetch data')
        }
      } finally {
        setIsLoading(false)
      }
    },
    [retryCount, maxRetries, filterBy, searchTerm]
  )

  // Real-time updates
  useEffect(() => {
    fetchOutstandingData()
    const interval = setInterval(fetchOutstandingData, 30000)
    return () => clearInterval(interval)
  }, [fetchOutstandingData])

  const filteredSales = useMemo(() => outstandingSales, [outstandingSales])

  // Sorting
  const sortedSales = useMemo(() => {
    const sorted = [...filteredSales]
    sorted.sort((a, b) => {
      if (sortBy === 'customer') {
        return sortOrder === 'asc'
          ? a.Customer.name.localeCompare(b.Customer.name)
          : b.Customer.name.localeCompare(a.Customer.name)
      }
      if (sortBy === 'outstanding') {
        return sortOrder === 'asc' ? a.outstanding - b.outstanding : b.outstanding - a.outstanding
      }
      if (sortBy === 'last_updated') {
        return sortOrder === 'asc'
          ? new Date(a.last_updated).getTime() - new Date(b.last_updated).getTime()
          : new Date(b.last_updated).getTime() - new Date(a.last_updated).getTime()
      }
      if (sortBy === 'aging') {
        const aDays = getAgingInfo(a.last_updated).days
        const bDays = getAgingInfo(b.last_updated).days
        return sortOrder === 'asc' ? aDays - bDays : bDays - aDays
      }
      return 0
    })
    return sorted
  }, [filteredSales, sortBy, sortOrder])

  // Total outstanding
  const totalOutstanding = useMemo(
    () => sortedSales.reduce((sum, sale) => sum + sale.outstanding, 0),
    [sortedSales]
  )

  const handlePrint = (): void => window.electronAPI?.utils.savePdf()

  // const handlePrint = async (): Promise<void> => {
  //   window.print()
  // }

  // const handlePrint = async (): Promise<void> => {
  //   // 1. Add a class to force full render
  //   document.body.classList.add('printing-pdf')

  //   // 2. Small delay to let React render all rows
  //   await new Promise((resolve) => setTimeout(resolve, 300))

  //   // 3. Trigger PDF from main
  //   const result = await window.electronAPI?.utils.savePdf()

  //   // 4. Clean up
  //   document.body.classList.remove('printing-pdf')

  //   if (result?.success) {
  //     toast.success(`PDF saved to ${result.path}`)
  //   }
  // }

  const handleRefresh = (): Promise<void> => fetchOutstandingData()

  const handleSort = (field: 'customer' | 'outstanding' | 'last_updated' | 'aging'): void => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortBy(field)
      setSortOrder('asc')
    }
  }

  // Export functionality
  const handleExport = (): void => {
    const csvData = sortedSales.map((sale) => ({
      customer: sale.Customer.name,
      phone: sale.Customer.phone || 'N/A',
      outstanding: sale.outstanding,
      lastUpdated: sale.last_updated,
      aging: getAgingInfo(sale.last_updated).label
    }))

    const csvContent = [
      ['Customer', 'Phone', 'Outstanding', 'Last Updated', 'Aging'],
      ...csvData.map((row) => [
        row.customer,
        row.phone,
        row.outstanding.toString(),
        row.lastUpdated,
        row.aging
      ])
    ]
      .map((row) => row.join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `outstanding_payments_${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handlePayment = async (
    customerId: number,
    amount: number,
    isPartial: boolean,
    paymentMethod: string = 'cash'
  ): Promise<void> => {
    try {
      const response = await window.electronAPI?.payments.process({
        customerId,
        amount,
        paymentMethod,
        notes: isPartial ? `Partial payment of ${formatCurrency(amount)}` : 'Full payment'
      })

      if (!response.success) {
        throw new Error(response.error || 'Payment processing failed')
      }

      await fetchOutstandingData()

      toast.success(
        `Payment processed successfully!\n\nAmount: ${formatCurrency(amount)}\nApplied to: ${response.data.totalSalesUpdated} sale(s)`
      )
    } catch (err) {
      console.error('Payment processing failed:', err)
      toast.error(
        `Payment processing failed: ${err instanceof Error ? err.message : 'Unknown error'}`
      )
      throw err
    }
  }

  const handlePaymentModal = (sale: OutstandingSale): void => {
    setPaymentModal({ isOpen: true, sale })
  }

  const handleCustomerDetail = (sale: OutstandingSale): void => {
    setDetailModal({ isOpen: true, sale })
  }

  return (
    <div className="maggi ml-16 h-screen w-screen pr-16 pt-4 flex flex-col">
      <div className="flex justify-between pb-3 pl-2 px-4">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-semibold">Outstanding Balance</h1>
          {!isLoading && (
            <div className="badge badge-neutral">Total: {formatCurrency(totalOutstanding)}</div>
          )}
          {retryCount > 0 && (
            <div className="badge badge-warning">
              Retrying... ({retryCount}/{maxRetries})
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <button
            className="controls btn btn-sm btn-success"
            onClick={handleExport}
            disabled={isLoading || sortedSales.length === 0}
          >
            Export CSV
          </button>
          <button
            className="controls btn btn-sm btn-accent"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="controls loading loading-spinner loading-xs"></span>
            ) : (
              'Refresh'
            )}
          </button>
          <button
            className="controls btn btn-sm btn-outline btn-accent"
            onClick={handlePrint}
            disabled={isLoading}
          >
            Print
          </button>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex controls gap-4 mb-4 px-2">
        <div className="form-control">
          <input
            type="text"
            placeholder="Search customers or phone..."
            className="input input-bordered input-sm w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                fetchOutstandingData()
              }
            }}
          />
        </div>
        <div className="form-control">
          <select
            className="select select-bordered select-sm"
            value={filterBy}
            onChange={(e) => {
              setFilterBy(e.target.value as 'all' | 'current' | 'overdue')
            }}
            aria-label="Filter outstanding sales"
          >
            <option value="all">All Outstanding</option>
            <option value="current">Current (≤30 days)</option>
            <option value="overdue">Overdue (&gt;30 days)</option>
          </select>
        </div>
        {(searchTerm || filterBy !== 'all') && (
          <button
            className="btn btn-sm btn-ghost"
            onClick={() => {
              setSearchTerm('')
              setFilterBy('all')
            }}
          >
            Clear Filters
          </button>
        )}
        <button className="btn btn-sm btn-primary" onClick={() => fetchOutstandingData()}>
          Search
        </button>
      </div>

      <hr />

      {/* Error */}
      {error && (
        <div className="alert alert-error mt-4 mx-2">
          <span>{error}</span>
          <button className="btn btn-sm btn-ghost" onClick={handleRefresh}>
            Retry
          </button>
        </div>
      )}

      {/* Loading */}
      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <div className="loading loading-spinner loading-lg"></div>
          <span className="text-sm text-gray-500 ml-2">Loading outstanding balances...</span>
        </div>
      ) : (
        <div className="page-container h-full overflow-x-auto">
          <table className="page table table-zebra table-pin-rows">
            <thead className="bg-accent">
              <tr>
                <th onClick={() => handleSort('last_updated')} className="cursor-pointer">
                  Last Updated {sortBy === 'last_updated' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th onClick={() => handleSort('customer')} className="cursor-pointer">
                  Customer {sortBy === 'customer' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th>Contact</th>
                <th onClick={() => handleSort('aging')} className="cursor-pointer">
                  Aging {sortBy === 'aging' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th onClick={() => handleSort('outstanding')} className="cursor-pointer">
                  Outstanding {sortBy === 'outstanding' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="controls">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedSales.length === 0 && !error ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">
                    {outstandingSales.length === 0
                      ? 'No outstanding balances found'
                      : searchTerm || filterBy !== 'all'
                        ? 'No results match your filters'
                        : 'No results available'}
                  </td>
                </tr>
              ) : (
                sortedSales.map((sale) => {
                  const agingInfo = getAgingInfo(sale.last_updated)
                  const isNearCreditLimit =
                    sale.Customer.creditLimit && sale.outstanding > sale.Customer.creditLimit * 0.8

                  return (
                    <tr key={sale.id}>
                      <td>{formatDate(sale.last_updated)}</td>
                      <td>
                        <button
                          className="link link-primary font-semibold"
                          onClick={() => handleCustomerDetail(sale)}
                        >
                          {sale.Customer.name}
                        </button>
                        {isNearCreditLimit && (
                          <div className="badge badge-warning badge-sm ml-2">Near Limit</div>
                        )}
                        {sale.outstanding_sales_count && (
                          <div className="badge badge-ghost badge-sm ml-2">
                            {sale.outstanding_sales_count} sale(s)
                          </div>
                        )}
                      </td>
                      <td>{sale.Customer.phone || 'N/A'}</td>
                      <td>
                        <div className={`badge ${agingInfo.class}`}>{agingInfo.label}</div>
                      </td>
                      <td className="font-semibold text-red-400">
                        {formatCurrency(sale.outstanding)}
                      </td>
                      <td>
                        <div className="flex gap-1 controls">
                          <button
                            className="btn btn-xs btn-primary"
                            onClick={() => {
                              const modal = document.getElementById(
                                'confirm'
                              ) as HTMLDialogElement | null
                              if (modal) modal.showModal()
                            }}
                          >
                            Pay Full
                          </button>
                          <button
                            className="btn btn-xs btn-outline btn-primary"
                            onClick={() => handlePaymentModal(sale)}
                          >
                            Partial
                          </button>
                          <ConfirmDialog
                            id="confirm"
                            title="Confirm Full Payment"
                            onConfirm={() => handlePayment(sale.id, sale.outstanding, false)}
                            message="Are you sure you want to pay the full outstanding amount?"
                          />
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Payment Modal */}
      <PaymentModal
        isOpen={paymentModal.isOpen}
        sale={paymentModal.sale}
        onClose={() => setPaymentModal({ isOpen: false, sale: null })}
        onPayment={handlePayment}
      />

      {/* Customer Detail Modal */}
      <CustomerDetailModal
        isOpen={detailModal.isOpen}
        sale={detailModal.sale}
        onClose={() => setDetailModal({ isOpen: false, sale: null })}
        onRefresh={fetchOutstandingData}
      />
    </div>
  )
}

export default Outstanding
