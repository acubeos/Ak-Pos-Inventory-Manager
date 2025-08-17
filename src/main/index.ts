import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'
// import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { dbManager } from './database'
import { dbOperations } from './database-operations'
import {
  CreateProductData,
  LoginData,
  RegisterData,
  CreateSaleData,
  CreateCustomerData,
  ApiFilters
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
  // Authentication handlers
  ipcMain.handle('auth:login', async (__event, loginData: LoginData) => {
    return await dbOperations.login(loginData)
  })

  ipcMain.handle('auth:register', async (__event, registerData: RegisterData) => {
    return await dbOperations.register(registerData)
  })

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
    async (
      __event,
      productId: number,
      quantity: number,
      userId: number,
      type: string = 'restock'
    ) => {
      return await dbOperations.addStock(productId, quantity, userId, type)
    }
  )

  ipcMain.handle(
    'stock:adjust',
    async (
      __event,
      productId: number,
      newQuantity: number,
      userId: number,
      reason: string = 'adjustment'
    ) => {
      return await dbOperations.adjustStock(productId, newQuantity, userId, reason)
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
  ipcMain.handle('sales:create', async (__event, saleData: CreateSaleData, userId: number) => {
    return await dbOperations.createSale(saleData, userId)
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

// // This method will be called when Electron has finished
// // initialization and is ready to create browser windows.
// // Some APIs can only be used after this _event occurs.
// app.whenReady().then(() => {
//   // Set app user model id for windows
//   electronApp.setAppUserModelId('com.electron')

//   // Default open or close DevTools by F12 in development
//   // and ignore CommandOrControl + R in production.
//   // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
//   app.on('browser-window-created', (_, window) => {
//     optimizer.watchWindowShortcuts(window)
//   })

//   // IPC test
//   ipcMain.on('ping', () => console.log('pong'))

//   createWindow()

//   app.on('activate', function () {
//     // On macOS it's common to re-create a window in the app when the
//     // dock icon is clicked and there are no other windows open.
//     if (BrowserWindow.getAllWindows().length === 0) createWindow()
//   })
// })

// // Quit when all windows are closed, except on macOS. There, it's common
// // for applications and their menu bar to stay active until the user quits
// // explicitly with Cmd + Q.
// app.on('window-all-closed', () => {
//   if (process.platform !== 'darwin') {
//     app.quit()
//   }
// })

// // In this file you can include the rest of your app's specific main process
// // code. You can also put them in separate files and require them here.
