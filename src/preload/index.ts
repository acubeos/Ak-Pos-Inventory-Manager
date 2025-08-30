console.log('--- The Preload Script is Running! ---')
import { contextBridge, ipcRenderer } from 'electron'
import {
  CreateProductData,
  CreateSaleData,
  CreateCustomerData,
  ApiFilters
} from '../main/api.types'

// Expose all custom IPC handlers under 'api'
const api = {
  // Product APIs
  products: {
    create: (productData: CreateProductData): Promise<any> =>
      ipcRenderer.invoke('products:create', productData),
    getAll: (filters?: ApiFilters): Promise<any> => ipcRenderer.invoke('products:getAll', filters),
    getById: (id: number): Promise<any> => ipcRenderer.invoke('products:getById', id),
    update: (id: number, updates: Partial<CreateProductData>): Promise<any> =>
      ipcRenderer.invoke('products:update', id, updates),
    delete: (id: number): Promise<any> => ipcRenderer.invoke('products:delete', id),
    search: (searchTerm: string, filters?: ApiFilters): Promise<any> =>
      ipcRenderer.invoke('products:search', searchTerm, filters),
    bulkCreate: (products: CreateProductData[]): Promise<any> =>
      ipcRenderer.invoke('products:bulkCreate', products),
    bulkUpdate: (updates: Array<{ id: number; data: Partial<CreateProductData> }>): Promise<any> =>
      ipcRenderer.invoke('products:bulkUpdate', updates)
  },

  // Stock APIs
  stock: {
    getAll: (filters?: ApiFilters): Promise<any> => ipcRenderer.invoke('stock:getAll', filters),
    add: (productId: number, quantity: number, type?: string): Promise<any> =>
      ipcRenderer.invoke('stock:add', productId, quantity, type),
    adjust: (productId: number, newQuantity: number, reason?: string): Promise<any> =>
      ipcRenderer.invoke('stock:adjust', productId, newQuantity, reason)
  },

  // Customer APIs
  customers: {
    create: (customerData: CreateCustomerData): Promise<any> =>
      ipcRenderer.invoke('customers:create', customerData),
    getAll: (filters?: ApiFilters): Promise<any> => ipcRenderer.invoke('customers:getAll', filters),
    search: (searchTerm: string, filters?: ApiFilters): Promise<any> =>
      ipcRenderer.invoke('customers:search', searchTerm, filters),
    delete: (id: number): Promise<any> => ipcRenderer.invoke('customers:delete', id),
    update: (id: number, updates: Partial<CreateCustomerData>): Promise<any> =>
      ipcRenderer.invoke('customers:update', { id, updates })
  },

  // Sales APIs
  sales: {
    create: (saleData: CreateSaleData): Promise<any> =>
      ipcRenderer.invoke('sales:create', saleData),
    getAll: (filters?: ApiFilters): Promise<any> => ipcRenderer.invoke('sales:getAll', filters)
  },

  // Reports APIs
  reports: {
    inventory: (): Promise<any> => ipcRenderer.invoke('reports:inventory'),
    sales: (startDate?: string, endDate?: string): Promise<any> =>
      ipcRenderer.invoke('reports:sales', startDate, endDate)
  },

  // Analytics APIs
  analytics: {
    get: (startDate?: string, endDate?: string): Promise<any> =>
      ipcRenderer.invoke('analytics:get', startDate, endDate)
  },

  // Utility APIs
  utils: {
    backup: (): Promise<any> => ipcRenderer.invoke('db:backup'),
    showError: (title: string, message: string): Promise<any> =>
      ipcRenderer.invoke('app:showError', title, message),
    showMessage: (title: string, message: string): Promise<any> =>
      ipcRenderer.invoke('app:showMessage', title, message)
  }
}

// contextBridge.exposeInMainWorld('electronAPI', api)

// Expose APIs only if context isolation is enabled
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electronAPI', api)
  } catch (error) {
    console.error('Failed to expose APIs to renderer:', error)
  }
}
// else {
//   // Fallback for testing without contextIsolation
//   // @ts-ignore: Exposing electronAPI to window for non-contextIsolation mode
//   window.electron = electronAPI
//   // @ts-ignore: Exposing custom API to window for non-contextIsolation mode
//   window.api = api
// }
console.log('--- Preload Script Loaded Successfully! ---')
