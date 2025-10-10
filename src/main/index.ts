import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'
import { dbManager } from './database'
import { dbOperations } from './database-operations'
import { promises as fs } from 'fs' // Added for file system operations
import {
  CreateProductData,
  CreateSaleData,
  CreateCustomerData,
  ApiFilters,
  PaymentProcessData,
  CustomerCreditUpdate,
  OutstandingFilters
} from './api.types'
import icon from '../../resources/icon.png?asset'

let mainWindow: BrowserWindow

function createWindow(): void {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

const setupIpcHandlers = (): void => {
  // Product handlers
  ipcMain.handle('products:create', async (__event, productData: CreateProductData) => {
    return await dbOperations.createProduct(productData)
  })

  ipcMain.handle('products:getAll', async (__event, filters: ApiFilters = {}) => {
    return await dbOperations.getProducts(filters)
  })

  ipcMain.handle('products:getById', async (__event, id: number) => {
    return await dbOperations.getProductById(id)
  })

  ipcMain.handle(
    'products:update',
    async (_event, id: number, updates: Partial<CreateProductData>) => {
      return await dbOperations.updateProduct(id, updates)
    }
  )

  ipcMain.handle('products:delete', async (_event, id: number) => {
    return await dbOperations.deleteProduct(id)
  })

  ipcMain.handle(
    'products:search',
    async (_event, searchTerm: string, filters: ApiFilters = {}) => {
      return await dbOperations.searchProducts(searchTerm, filters)
    }
  )

  ipcMain.handle('products:bulkCreate', async (__event, products: CreateProductData[]) => {
    return await dbOperations.bulkCreateProducts(products)
  })

  ipcMain.handle(
    'products:bulkUpdate',
    async (__event, updates: Array<{ id: number; data: Partial<CreateProductData> }>) => {
      return await dbOperations.bulkUpdateProducts(updates)
    }
  )

  // Stock handlers
  ipcMain.handle('stock:getAll', async (__event, filters: ApiFilters = {}) => {
    return await dbOperations.getStock(filters)
  })

  ipcMain.handle(
    'stock:add',
    async (__event, productId: number, quantity: number, type: string = 'restock') => {
      return await dbOperations.addStock(productId, quantity, type)
    }
  )

  ipcMain.handle(
    'stock:adjust',
    async (__event, productId: number, newQuantity: number, reason: string = 'adjustment') => {
      return await dbOperations.adjustStock(productId, newQuantity, reason)
    }
  )

  // Customer handlers
  ipcMain.handle('customers:create', async (__event, customerData: CreateCustomerData) => {
    return await dbOperations.createCustomer(customerData)
  })

  ipcMain.handle('customers:getAll', async (__event, filters: ApiFilters = {}) => {
    return await dbOperations.getCustomers(filters)
  })

  ipcMain.handle(
    'customers:search',
    async (__event, searchTerm: string, filters: ApiFilters = {}) => {
      return await dbOperations.searchCustomers(searchTerm, filters)
    }
  )

  ipcMain.handle('customers:update', async (_event, { id, updates }) => {
    try {
      const updated = await dbManager.updateCustomer(id, updates)
      return { success: true, data: updated }
    } catch (err) {
      console.error('Error updating customer:', err)
      const errorMessage = err instanceof Error ? err.message : String(err)
      return { success: false, error: errorMessage }
    }
  })

  ipcMain.handle('customers:delete', async (__event, id: number) => {
    return await dbOperations.deleteCustomer(id)
  })

  // Sales handlers
  ipcMain.handle('sales:create', async (__event, saleData: CreateSaleData) => {
    return await dbOperations.createSale(saleData)
  })

  ipcMain.handle('sales:getAll', async (__event, filters: ApiFilters = {}) => {
    return await dbOperations.getSales(filters)
  })

  // Report handlers
  ipcMain.handle('reports:inventory', async () => {
    return await dbOperations.getInventoryReport()
  })

  ipcMain.handle('reports:sales', async (_event, startDate?: string, endDate?: string) => {
    return await dbOperations.getSalesReport(startDate, endDate)
  })

  ipcMain.handle('analytics:get', async (_event, startDate?: string, endDate?: string) => {
    return await dbOperations.getAnalytics(startDate, endDate)
  })

  // Utility handlers
  ipcMain.handle('db:backup', async (_event) => {
    return await dbOperations.backupDatabase()
  })

  // Error handling
  ipcMain.handle('app:showError', async (_event, title: string, message: string) => {
    dialog.showErrorBox(title, message)
  })

  ipcMain.handle('app:showMessage', async (_event, title: string, message: string) => {
    dialog.showMessageBox(mainWindow!, {
      type: 'info',
      title,
      message
    })
  })

  // Process payment
  ipcMain.handle('payments:process', async (_event, paymentData: PaymentProcessData) => {
    return await dbOperations.processPayment(paymentData)
  })

  // Get outstanding payments with filters
  ipcMain.handle('payments:getOutstanding', async (_event, filters: OutstandingFilters = {}) => {
    return await dbOperations.getOutstandingPayments(filters)
  })

  // Get detailed payment information for a customer
  ipcMain.handle('payments:getCustomerDetails', async (_event, customerId: number) => {
    return await dbOperations.getCustomerPaymentDetails(customerId)
  })

  // Get payment history
  ipcMain.handle('payments:getHistory', async (_event, customerId?: number, limit = 100) => {
    return await dbOperations.getPaymentHistory(customerId, limit)
  })

  // Get outstanding payments report
  ipcMain.handle('payments:getReport', async (_event, filters: OutstandingFilters = {}) => {
    return await dbOperations.getOutstandingPaymentsReport(filters)
  })

  // ===== CUSTOMER CREDIT HANDLERS =====

  // Update customer credit settings
  ipcMain.handle('customers:updateCredit', async (_event, creditData: CustomerCreditUpdate) => {
    return await dbOperations.updateCustomerCredit(creditData)
  })

  // Get customer with credit info (enhance existing getById handler or add new one)
  ipcMain.handle('customers:getById', async (_event, id: number) => {
    return await dbOperations.getCustomerById(id)
  })

  // ✨ NEW PDF HANDLER ADDED HERE
  ipcMain.handle('app:save-pdf', async (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (!win) return { success: false, error: 'Could not find the source window.' }

    try {
      // 1. Generate PDF data from the window's contents
      const pdfData = await win.webContents.printToPDF({
        pageSize: 'A4',
        printBackground: true,
        landscape: false
      })

      // 2. Show a "Save As" dialog to the user
      const { canceled, filePath } = await dialog.showSaveDialog(win, {
        title: 'Save Report as PDF',
        defaultPath: `report-${Date.now()}.pdf`,
        filters: [{ name: 'PDF Files', extensions: ['pdf'] }]
      })

      // 3. If the user didn't cancel, write the file to the chosen path
      if (!canceled && filePath) {
        await fs.writeFile(filePath, pdfData)
        return { success: true, path: filePath }
      }

      return { success: true, canceled: true } // User cancelled the save dialog
    } catch (error) {
      console.error('Failed to save PDF:', error)
      const message = error instanceof Error ? error.message : String(error)
      dialog.showErrorBox('PDF Error', `Failed to save the PDF. Reason: ${message}`)
      return { success: false, error: message }
    }
  })
}

const cleanup = async (): Promise<void> => {
  try {
    await dbManager.close()
    console.log('Database connection closed')
  } catch (error) {
    console.error('Error closing database:', error)
  }
  app.quit()
}

const initializeApp = async (): Promise<void> => {
  // Initialize database when app is ready
  app.whenReady().then(async () => {
    try {
      await dbManager.initialize()
      console.log('Database initialized successfully')

      await createWindow()
      setupIpcHandlers()
    } catch (error) {
      console.error('Failed to initialize database:', error)
      dialog.showErrorBox('Database Error', 'Failed to initialize database')
      app.quit()
    }
  })

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      cleanup()
    }
  })

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })

  app.on('before-quit', () => {
    cleanup()
  })
}

// Initialize the app
initializeApp()

// Handle any uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error)
  dialog.showErrorBox('Uncaught Exception', error.message)
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason)
  dialog.showErrorBox('Unhandled Rejection', String(reason))
})
