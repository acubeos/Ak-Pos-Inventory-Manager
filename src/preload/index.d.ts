/* eslint-disable @typescript-eslint/no-explicit-any */
interface ElectronAPI {
  products: {
    create: (productData: CreateProductData) => Promise<any>
    getAll: (filters?: ApiFilters) => Promise<any>
    getById: (id: number) => Promise<any>
    update: (id: number, updates: Partial<CreateProductData>) => Promise<any>
    delete: (id: number) => Promise<any>
    search: (searchTerm: string, filters?: ApiFilters) => Promise<any>
    bulkCreate: (products: CreateProductData[]) => Promise<any>
    bulkUpdate: (updates: Array<{ id: number; data: Partial<CreateProductData> }>) => Promise<any>
  }
  stock: {
    getAll: (filters?: ApiFilters) => Promise<any>
    add: (productId: number, quantity: number, type?: string) => Promise<any>
    adjust: (productId: number, newQuantity: number, reason?: string) => Promise<any>
  }
  customers: {
    updateCredit: (creditData: CustomerCreditUpdate) => Promise<any>
    create: (customerData: CreateCustomerData) => Promise<any>
    getAll: (filters?: ApiFilters) => Promise<any>
    search: (searchTerm: string, filters?: ApiFilters) => Promise<any>
    delete: (id: number) => Promise<any>
    update: (id: number, updates: Partial<CreateCustomerData>) => Promise<any>
  }
  sales: {
    create: (saleData: CreateSaleData) => Promise<any>
    getAll: (filters?: ApiFilters) => Promise<any>
  }
  reports: {
    inventory: () => Promise<any>
    sales: (startDate?: string, endDate?: string) => Promise<any>
  }
  analytics: {
    get: (startDate?: string, endDate?: string) => Promise<any>
  }
  utils: {
    backup: () => Promise<any>
    exportDatabase: () => Promise<any>
    importDatabase: () => Promise<any>
    showError: (title: string, message: string) => Promise<void>
    showMessage: (title: string, message: string) => Promise<void>
    savePdf: () => Promise<any>
  }
  payments: {
    process: (paymentData: PaymentProcessData) => Promise<any>
    getOutstanding: (filters?: OutstandingFilters) => Promise<any>
    getCustomerDetails: (customerId: number) => Promise<any>
    getHistory: (customerId?: number, limit?: number) => Promise<any>
    getReport: (filters?: OutstandingFilters) => Promise<any>
  }
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI
  }
}

export {}
