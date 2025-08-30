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
