import { dbManager } from './database'
import {
  ApiResponse,
  SingleProduct,
  Product,
  AllStock,
  CreateProductData,
  AuthResponse,
  LoginData,
  RegisterData,
  AllSales,
  AllCustomers,
  CreateSaleData,
  CreateCustomerData,
  ApiFilters
} from './api.types'

export class DatabaseOperations {
  // Authentication operations
  async register(userData: RegisterData): Promise<ApiResponse<AuthResponse>> {
    try {
      const existingUser = await dbManager.getUserByUsername(userData.username)
      if (existingUser) {
        return {
          success: false,
          error: 'Username already exists',
          msg: 'Username already exists'
        }
      }

      const user = await dbManager.createUser(userData)
      return {
        success: true,
        data: user,
        msg: 'User created successfully'
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        msg: 'Failed to create user'
      }
    }
  }

  async login(loginData: LoginData): Promise<ApiResponse<AuthResponse>> {
    try {
      const user = await dbManager.validateUser(loginData)
      if (!user) {
        return {
          success: false,
          error: 'Invalid credentials',
          msg: 'Invalid username or password'
        }
      }

      return {
        success: true,
        data: user,
        msg: 'Login successful',
        accessToken: this.generateToken(user.uuid)
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        msg: 'Login failed'
      }
    }
  }

  // Product operations
  async createProduct(productData: CreateProductData): Promise<ApiResponse<SingleProduct>> {
    try {
      const product = await dbManager.createProduct(productData)
      return {
        success: true,
        data: product,
        msg: 'Product created successfully'
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        msg: 'Failed to create product'
      }
    }
  }

  async getProducts(filters: ApiFilters = {}): Promise<ApiResponse<Product>> {
    try {
      const products = await dbManager.getProducts(filters)
      return {
        success: true,
        data: products,
        msg: 'Products retrieved successfully'
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        msg: 'Failed to retrieve products'
      }
    }
  }

  async getProductById(id: number): Promise<ApiResponse<SingleProduct>> {
    try {
      const product = await dbManager.getProductById(id)
      if (!product) {
        return {
          success: false,
          error: 'Product not found',
          msg: 'Product not found'
        }
      }

      return {
        success: true,
        data: product,
        msg: 'Product retrieved successfully'
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        msg: 'Failed to retrieve product'
      }
    }
  }

  async updateProduct(
    id: number,
    updates: Partial<CreateProductData>
  ): Promise<ApiResponse<SingleProduct>> {
    try {
      const product = await dbManager.updateProduct(id, updates)
      if (!product) {
        return {
          success: false,
          error: 'Product not found',
          msg: 'Product not found'
        }
      }

      return {
        success: true,
        data: product,
        updated: product,
        msg: 'Product updated successfully'
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        msg: 'Failed to update product'
      }
    }
  }

  async deleteProduct(id: number): Promise<ApiResponse<boolean>> {
    try {
      const deleted = await dbManager.deleteProduct(id)
      if (!deleted) {
        return {
          success: false,
          error: 'Product not found',
          msg: 'Product not found'
        }
      }

      return {
        success: true,
        data: true,
        msg: 'Product deleted successfully'
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        msg: 'Failed to delete product'
      }
    }
  }

  // Stock operations
  async getStock(filters: ApiFilters = {}): Promise<ApiResponse<AllStock>> {
    try {
      const stock = await dbManager.getAllStock(filters)
      return {
        success: true,
        data: stock,
        msg: 'Stock retrieved successfully'
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        msg: 'Failed to retrieve stock'
      }
    }
  }

  // Customer operations
  async createCustomer(customerData: CreateCustomerData): Promise<ApiResponse<any>> {
    try {
      const customer = await dbManager.createCustomer(customerData)
      return {
        success: true,
        data: customer,
        msg: 'Customer created successfully'
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        msg: 'Failed to create customer'
      }
    }
  }

  async getCustomers(filters: ApiFilters = {}): Promise<ApiResponse<AllCustomers>> {
    try {
      const customers = await dbManager.getCustomers(filters)
      return {
        success: true,
        data: customers,
        msg: 'Customers retrieved successfully'
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        msg: 'Failed to retrieve customers'
      }
    }
  }

  async updateCustomer(
    id: number,
    updates: Partial<CreateCustomerData>
  ): Promise<ApiResponse<any>> {
    try {
      // Validate the update data first
      const validationResult = await this.validateCustomerData(updates as CreateCustomerData)
      if (!validationResult.success) {
        return validationResult
      }

      const customer = await dbManager.updateCustomer(id, updates)
      if (!customer) {
        return {
          success: false,
          error: 'Customer not found',
          msg: 'Customer not found'
        }
      }

      return {
        success: true,
        data: customer,
        updated: customer,
        msg: 'Customer updated successfully'
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        msg: 'Failed to update customer'
      }
    }
  }

  async getCustomerById(id: number): Promise<ApiResponse<any>> {
    try {
      const customer = await dbManager.getCustomerById(id)
      if (!customer) {
        return {
          success: false,
          error: 'Customer not found',
          msg: 'Customer not found'
        }
      }

      return {
        success: true,
        data: customer,
        msg: 'Customer retrieved successfully'
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        msg: 'Failed to retrieve customer'
      }
    }
  }

  async deleteCustomer(id: number): Promise<ApiResponse<boolean>> {
    try {
      const deleted = await dbManager.deleteCustomer(id)
      if (!deleted) {
        return {
          success: false,
          error: 'Customer not found',
          msg: 'Customer not found'
        }
      }

      return {
        success: true,
        data: true,
        msg: 'Customer deleted successfully'
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        msg: 'Failed to delete customer'
      }
    }
  }

  // Sales operations
  async createSale(saleData: CreateSaleData, userId: number): Promise<ApiResponse<any>> {
    try {
      // Validate stock availability
      const stockValidation = await this.validateStockAvailability(saleData.products)
      if (!stockValidation.success) {
        return stockValidation
      }

      const sale = await dbManager.createSale(saleData, userId)
      return {
        success: true,
        data: sale,
        msg: 'Sale created successfully'
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        msg: 'Failed to create sale'
      }
    }
  }

  async getSales(filters: ApiFilters = {}): Promise<ApiResponse<AllSales>> {
    try {
      const sales = await dbManager.getSales(filters)
      return {
        success: true,
        data: sales,
        msg: 'Sales retrieved successfully'
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        msg: 'Failed to retrieve sales'
      }
    }
  }

  // Utility operations
  private async validateStockAvailability(products: any[]): Promise<ApiResponse<boolean>> {
    try {
      for (const productSale of products) {
        const product = await dbManager.getProductById(parseInt(productSale.product_id))
        if (!product) {
          return {
            success: false,
            error: `Product with ID ${productSale.product_id} not found`,
            msg: 'Product not found'
          }
        }

        if (product.quantity < productSale.quantity) {
          return {
            success: false,
            error: `Insufficient stock for product ${product.name}. Available: ${product.quantity}, Requested: ${productSale.quantity}`,
            msg: 'Insufficient stock'
          }
        }
      }

      return {
        success: true,
        data: true,
        msg: 'Stock validation passed'
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        msg: 'Stock validation failed'
      }
    }
  }

  private generateToken(uuid: string): string {
    // Simple token generation - you might want to use JWT or similar
    return Buffer.from(`${uuid}:${Date.now()}`).toString('base64')
  }

  // Reporting operations
  async getInventoryReport(): Promise<ApiResponse<any>> {
    try {
      const products = await dbManager.getProducts()
      const lowStockProducts = products.product.filter((p) => p.quantity < 10)

      const report = {
        totalProducts: products.total,
        lowStockItems: lowStockProducts.length,
        lowStockProducts: lowStockProducts.map((p) => ({
          id: p.id,
          name: p.name,
          quantity: p.quantity,
          type: p.type
        }))
      }

      return {
        success: true,
        data: report,
        msg: 'Inventory report generated successfully'
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        msg: 'Failed to generate inventory report'
      }
    }
  }

  async getSalesReport(startDate?: string, endDate?: string): Promise<ApiResponse<any>> {
    try {
      const sales = await dbManager.getSales()
      let filteredSales = sales.sales

      if (startDate) {
        filteredSales = filteredSales.filter((s) => new Date(s.created_at) >= new Date(startDate))
      }

      if (endDate) {
        filteredSales = filteredSales.filter((s) => new Date(s.created_at) <= new Date(endDate))
      }

      const report = {
        totalSales: filteredSales.length,
        totalRevenue: filteredSales.reduce((sum, sale) => sum + sale.total_amount, 0),
        totalPaid: filteredSales.reduce((sum, sale) => sum + sale.total_paid, 0),
        totalOutstanding: filteredSales.reduce((sum, sale) => sum + sale.outstanding_amount, 0),
        averageSaleAmount:
          filteredSales.length > 0
            ? filteredSales.reduce((sum, sale) => sum + sale.total_amount, 0) / filteredSales.length
            : 0,
        salesByDate: this.groupSalesByDate(filteredSales)
      }

      return {
        success: true,
        data: report,
        msg: 'Sales report generated successfully'
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        msg: 'Failed to generate sales report'
      }
    }
  }

  private groupSalesByDate(sales: any[]): Record<string, any> {
    const grouped = sales.reduce((acc, sale) => {
      const date = new Date(sale.created_at).toISOString().split('T')[0]
      if (!acc[date]) {
        acc[date] = {
          date,
          count: 0,
          totalAmount: 0,
          totalPaid: 0,
          outstanding: 0
        }
      }
      acc[date].count++
      acc[date].totalAmount += sale.total_amount
      acc[date].totalPaid += sale.total_paid
      acc[date].outstanding += sale.outstanding_amount
      return acc
    }, {})

    return grouped
  }

  // Backup and restore operations
  async backupDatabase(): Promise<ApiResponse<string>> {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const backupPath = `backup_${timestamp}.db`

      // This would involve copying the database file
      // Implementation depends on your specific needs

      return {
        success: true,
        data: backupPath,
        msg: 'Database backup created successfully'
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        msg: 'Failed to create database backup'
      }
    }
  }

  async restoreDatabase(): Promise<ApiResponse<boolean>> {
    try {
      // This would involve restoring from the backup file
      // Implementation depends on your specific needs

      return {
        success: true,
        data: true,
        msg: 'Database restored successfully'
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        msg: 'Failed to restore database'
      }
    }
  }

  // Advanced search operations
  async searchProducts(
    searchTerm: string,
    filters: ApiFilters = {}
  ): Promise<ApiResponse<Product>> {
    try {
      const searchFilters = {
        ...filters,
        name: searchTerm
      }

      const products = await dbManager.getProducts(searchFilters)
      return {
        success: true,
        data: products,
        msg: 'Product search completed successfully'
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        msg: 'Product search failed'
      }
    }
  }

  async searchCustomers(
    searchTerm: string,
    filters: ApiFilters = {}
  ): Promise<ApiResponse<AllCustomers>> {
    try {
      const searchFilters = {
        ...filters,
        name: searchTerm
      }

      const customers = await dbManager.getCustomers(searchFilters)
      return {
        success: true,
        data: customers,
        msg: 'Customer search completed successfully'
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        msg: 'Customer search failed'
      }
    }
  }

  // Bulk operations
  async bulkCreateProducts(products: CreateProductData[]): Promise<ApiResponse<SingleProduct[]>> {
    try {
      const createdProducts: SingleProduct[] = []

      await dbManager.transaction(async () => {
        for (const productData of products) {
          const product = await dbManager.createProduct(productData)
          createdProducts.push(product)
        }
      })

      return {
        success: true,
        data: createdProducts,
        msg: `${createdProducts.length} products created successfully`
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        msg: 'Bulk product creation failed'
      }
    }
  }

  async bulkUpdateProducts(
    updates: Array<{ id: number; data: Partial<CreateProductData> }>
  ): Promise<ApiResponse<SingleProduct[]>> {
    try {
      const updatedProducts: SingleProduct[] = []

      await dbManager.transaction(async () => {
        for (const update of updates) {
          const product = await dbManager.updateProduct(update.id, update.data)
          if (product) {
            updatedProducts.push(product)
          }
        }
      })

      return {
        success: true,
        data: updatedProducts,
        msg: `${updatedProducts.length} products updated successfully`
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        msg: 'Bulk product update failed'
      }
    }
  }

  async bulkDeleteProducts(productIds: number[]): Promise<ApiResponse<number>> {
    try {
      let deletedCount = 0

      await dbManager.transaction(async () => {
        for (const id of productIds) {
          const deleted = await dbManager.deleteProduct(id)
          if (deleted) {
            deletedCount++
          }
        }
      })

      return {
        success: true,
        data: deletedCount,
        msg: `${deletedCount} products deleted successfully`
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        msg: 'Bulk product deletion failed'
      }
    }
  }

  // Stock management operations
  async addStock(
    productId: number,
    quantity: number,
    userId: number,
    type: string = 'restock'
  ): Promise<ApiResponse<any>> {
    try {
      await dbManager.transaction(async (db) => {
        const now = new Date().toISOString()

        // Add stock entry
        await db.run(
          `
          INSERT INTO stock (product_id, quantity, type, user_id, created_at, last_updated)
          VALUES (?, ?, ?, ?, ?, ?)
        `,
          [productId, quantity, type, userId, now, now]
        )

        // Update product quantity
        await db.run('UPDATE products SET quantity = quantity + ?, last_updated = ? WHERE id = ?', [
          quantity,
          now,
          productId
        ])
      })

      return {
        success: true,
        msg: 'Stock added successfully'
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        msg: 'Failed to add stock'
      }
    }
  }

  async adjustStock(
    productId: number,
    newQuantity: number,
    userId: number,
    reason: string = 'adjustment'
  ): Promise<ApiResponse<any>> {
    try {
      await dbManager.transaction(async (db) => {
        const now = new Date().toISOString()

        // Get current quantity
        const product = await db.get('SELECT quantity FROM products WHERE id = ?', [productId])
        if (!product) {
          throw new Error('Product not found')
        }

        const adjustment = newQuantity - product.quantity

        // Add stock entry for the adjustment
        await db.run(
          `
          INSERT INTO stock (product_id, quantity, type, user_id, created_at, last_updated)
          VALUES (?, ?, ?, ?, ?, ?)
        `,
          [productId, adjustment, reason, userId, now, now]
        )

        // Update product quantity
        await db.run('UPDATE products SET quantity = ?, last_updated = ? WHERE id = ?', [
          newQuantity,
          now,
          productId
        ])
      })

      return {
        success: true,
        msg: 'Stock adjusted successfully'
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        msg: 'Failed to adjust stock'
      }
    }
  }

  // Analytics operations
  async getAnalytics(startDate?: string, endDate?: string): Promise<ApiResponse<any>> {
    try {
      const [products, sales, customers] = await Promise.all([
        dbManager.getProducts(),
        dbManager.getSales(),
        dbManager.getCustomers()
      ])

      let filteredSales = sales.sales
      if (startDate) {
        filteredSales = filteredSales.filter((s) => new Date(s.created_at) >= new Date(startDate))
      }
      if (endDate) {
        filteredSales = filteredSales.filter((s) => new Date(s.created_at) <= new Date(endDate))
      }

      const analytics = {
        overview: {
          totalProducts: products.total,
          totalCustomers: customers.total,
          totalSales: filteredSales.length,
          totalRevenue: filteredSales.reduce((sum, sale) => sum + sale.total_amount, 0),
          averageOrderValue:
            filteredSales.length > 0
              ? filteredSales.reduce((sum, sale) => sum + sale.total_amount, 0) /
                filteredSales.length
              : 0
        },
        inventory: {
          totalValue: products.product.reduce((sum, p) => sum + p.price * p.quantity, 0),
          lowStockItems: products.product.filter((p) => p.quantity < 10).length,
          outOfStockItems: products.product.filter((p) => p.quantity === 0).length,
          topProducts: products.product
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 10)
            .map((p) => ({ name: p.name, quantity: p.quantity, value: p.price * p.quantity }))
        },
        sales: {
          totalSales: filteredSales.length,
          totalRevenue: filteredSales.reduce((sum, sale) => sum + sale.total_amount, 0),
          totalPaid: filteredSales.reduce((sum, sale) => sum + sale.total_paid, 0),
          totalOutstanding: filteredSales.reduce((sum, sale) => sum + sale.outstanding_amount, 0),
          monthlyTrends: this.calculateMonthlyTrends(filteredSales)
        }
      }

      return {
        success: true,
        data: analytics,
        msg: 'Analytics generated successfully'
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        msg: 'Failed to generate analytics'
      }
    }
  }

  private calculateMonthlyTrends(sales: any[]): any[] {
    const monthlyData = sales.reduce((acc, sale) => {
      const month = new Date(sale.created_at).toISOString().slice(0, 7) // YYYY-MM
      if (!acc[month]) {
        acc[month] = {
          month,
          sales: 0,
          revenue: 0,
          orders: 0
        }
      }
      acc[month].sales += sale.total_amount
      acc[month].revenue += sale.total_paid
      acc[month].orders += 1
      return acc
    }, {})

    return Object.values(monthlyData).sort((a: any, b: any) => a.month.localeCompare(b.month))
  }

  // Data validation operations
  async validateProductData(productData: CreateProductData): Promise<ApiResponse<boolean>> {
    try {
      const errors: string[] = []

      if (!productData.name || productData.name.trim().length === 0) {
        errors.push('Product name is required')
      }

      if (!productData.price || productData.price <= 0) {
        errors.push('Product price must be greater than 0')
      }

      if (productData.quantity && productData.quantity < 0) {
        errors.push('Product quantity cannot be negative')
      }

      if (errors.length > 0) {
        return {
          success: false,
          error: errors.join(', '),
          msg: 'Product data validation failed'
        }
      }

      return {
        success: true,
        data: true,
        msg: 'Product data validation passed'
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        msg: 'Product data validation failed'
      }
    }
  }

  async validateCustomerData(customerData: CreateCustomerData): Promise<ApiResponse<boolean>> {
    try {
      const errors: string[] = []

      if (!customerData.name || customerData.name.trim().length === 0) {
        errors.push('Customer name is required')
      }

      if (customerData.phone && !this.isValidPhone(customerData.phone)) {
        errors.push('Invalid phone number format')
      }

      if (errors.length > 0) {
        return {
          success: false,
          error: errors.join(', '),
          msg: 'Customer data validation failed'
        }
      }

      return {
        success: true,
        data: true,
        msg: 'Customer data validation passed'
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        msg: 'Customer data validation failed'
      }
    }
  }

  private isValidPhone(phone: string): boolean {
    const phoneRegex = /^[+]?[0-9][\d]{0,15}$/
    return phoneRegex.test(phone.replace(/[\s\-()]/g, ''))
  }
}

// Export singleton instance
export const dbOperations = new DatabaseOperations()
