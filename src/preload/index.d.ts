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
    showError: (title: string, message: string) => Promise<void>
    showMessage: (title: string, message: string) => Promise<void>
  }
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI
  }
}

export {}
