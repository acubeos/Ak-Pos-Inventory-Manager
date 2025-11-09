// API Response Types
export interface ApiResponse<T> {
  success?: boolean
  data?: T
  msg?: string
  err?: boolean | string
  error?: boolean | string
  updated?: T
}

export interface CreateProductData {
  name: string
  price: number
  quantity: number
  type: string
}

export interface SingleProduct {
  id: number
  uuid: string
  name: string
  price: number
  featured: boolean
  rating: number
  type: string
  quantity: number
  status: number
  last_updated: string
  created_at: string
  stock: any
}
export interface Product {
  product: SingleProduct[]
  total: number
}
export interface SingleStock {
  Product: SingleProduct
  created_at: string
  id: number
  last_updated: string
  product_id: number
  quantity: number
  status: number | boolean
  type: string
}
export interface AllStock {
  stock: SingleStock[]
  total: number
}

export interface Sale {
  id: number
  customer_id: number
  customer_name: string
  total: number
  outstanding: number
  products: any
  Customer: any
  status: boolean
  outstanding_amount: number
  total_amount: number
  created_at: string
  last_updated: string
  total_paid: number
}
export interface AllSales {
  sales: Sale[]
  total: number
}
export interface Customer {
  id: number
  uuid: string
  name: string
  phone: string
  address: string
  created_at: string
  updated_at: string
}
export interface AllCustomers {
  customers: Customer[]
  total: number
}
export interface SingleProductSale {
  product_id: string
  uuid?: string
  name: string
  quantity: number
  price?: number
  total?: number
}
export interface CreateSaleData {
  customer_id: number
  products: SingleProductSale[]
  outstanding: number
  total_paid: number
  customer_name: string
}

export interface CreateCustomerData {
  id?: number
  uuid?: number
  name: string
  phone: string
  address: string
}
export interface ApiFilters {
  featured?: boolean
  company?: string
  name?: string
  sort?: string
  fields?: string
  numericFilters?: string
  page?: number
  limit?: number
}
export interface PaymentHistoryRecord {
  id: number
  customer_id: number
  sale_id: number | null
  payment_amount: number
  payment_method: string
  payment_date: string
  payment_type: string
  reference_number: string | null
  notes: string | null
  created_by: number | null
  created_at: string
}

export interface OutstandingPayment {
  customer_id: number
  customer_name: string
  customer_phone: string | null
  customer_address: string | null
  credit_limit: number | null
  payment_terms: string
  is_credit_enabled: boolean
  total_outstanding: number
  last_updated: string
  outstanding_sales_count: number
  days_outstanding: number
  sale_ids: string
}

export interface PaymentProcessData {
  customerId: number
  amount: number
  paymentMethod?: string
  notes?: string
  saleIds?: number[]
}

export interface CustomerCreditUpdate {
  customerId: number
  creditLimit: number | null
  paymentTerms: string
  isCreditEnabled: boolean
}

export interface OutstandingFilters extends ApiFilters {
  agingFilter?: 'all' | 'current' | 'overdue' | '31-60' | '61-90' | '90+'
  searchTerm?: string
}

// Update existing Customer interface to include credit fields
export interface Customer {
  id: number
  uuid: string
  name: string
  phone: string
  address: string
  credit_limit?: number
  credit_balance?: number
  payment_terms?: string
  is_credit_enabled?: boolean
  created_at: string
  updated_at: string
}

// ===== ADD THESE INTERFACES TO YOUR EXISTING api.types.ts FILE =====

// Payment-related interfaces
export interface PaymentHistoryRecord {
  id: number
  customer_id: number
  sale_id: number | null
  payment_amount: number
  payment_method: string
  payment_date: string
  payment_type: string
  reference_number: string | null
  notes: string | null
  created_by: number | null
  created_at: string
  customer_name?: string
  sale_total?: number
}

export interface OutstandingPayment {
  customer_id: number
  customer_name: string
  customer_phone: string | null
  customer_address: string | null
  credit_limit: number | null
  payment_terms: string
  is_credit_enabled: boolean
  total_outstanding: number
  last_updated: string
  outstanding_sales_count: number
  days_outstanding: number
  sale_ids: string
}

export interface PaymentProcessData {
  customerId: number
  amount: number
  paymentMethod?: string
  notes?: string
  saleIds?: number[]
}

export interface CustomerCreditUpdate {
  customerId: number
  creditLimit: number | null
  paymentTerms: string
  isCreditEnabled: boolean
}

export interface OutstandingFilters extends ApiFilters {
  agingFilter?: 'all' | 'current' | 'overdue' | '31-60' | '61-90' | '90+'
  searchTerm?: string
  customerId?: number
}

// Update existing Customer interface to include credit fields
export interface Customer {
  id: number
  uuid: string
  name: string
  phone: string
  address: string
  credit_limit?: number
  credit_balance?: number
  payment_terms?: string
  is_credit_enabled?: boolean
  created_at: string
  updated_at: string
}

// Extend Sale interface to include payment_status
export interface Sale {
  id: number
  customer_id: number
  customer_name: string
  total: number
  outstanding: number
  outstanding_amount: number
  total_amount: number
  total_paid: number
  payment_status?: string // 'pending' | 'partial' | 'paid'
  products: any[]
  status: number
  created_at: string
  last_updated: string
  Customer: {
    id: number
    name: string
    phone?: string
    address?: string
  }
}
