import sqlite3 from 'sqlite3'
import { Database, open } from 'sqlite'
import path from 'path'
import { app } from 'electron'
import {
  SingleProduct,
  Product,
  SingleStock,
  AllStock,
  CreateProductData,
  Sale,
  AllSales,
  Customer,
  AllCustomers,
  CreateSaleData,
  CreateCustomerData,
  ApiFilters,
  PaymentHistoryRecord,
  OutstandingPayment,
  PaymentProcessData,
  CustomerCreditUpdate,
  OutstandingFilters
} from './api.types'

export class DatabaseManager {
  private db: Database<sqlite3.Database, sqlite3.Statement> | null = null

  async initialize(): Promise<void> {
    const dbPath = path.join(app.getPath('userData'), 'inventory.db')

    this.db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    })

    await this.createTables()
    await this.runMigrations()
  }

  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized')

    // Enable foreign keys
    await this.db.exec('PRAGMA foreign_keys = ON')

    // Products table
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        uuid TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        price REAL NOT NULL,
        featured BOOLEAN DEFAULT 0,
        rating REAL DEFAULT 0,
        type TEXT NOT NULL,
        quantity INTEGER DEFAULT 0,
        status INTEGER DEFAULT 1,
        last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Customers table
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS customers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        uuid TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        phone TEXT,
        address TEXT,
        credit_limit REAL DEFAULT NULL,
        credit_balance REAL DEFAULT 0.00,
        payment_terms TEXT DEFAULT 'Net 30',
        is_credit_enabled BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Sales table
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS sales (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_id INTEGER NOT NULL,
        customer_name TEXT NOT NULL,
        total REAL NOT NULL,
        outstanding REAL DEFAULT 0,
        outstanding_amount REAL DEFAULT 0,
        total_amount REAL NOT NULL,
        total_paid REAL NOT NULL,
        payment_status TEXT DEFAULT 'pending',
        products TEXT NOT NULL,
        status BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES customers(id)
      )
    `)

    // Stock table
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS stock (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        type TEXT NOT NULL,
        sales_id INTEGER,
        status INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id),
        FOREIGN KEY (sales_id) REFERENCES sales(id)
      )
    `)

    // Payment history table
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS payment_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_id INTEGER NOT NULL,
        sale_id INTEGER NULL,
        payment_amount REAL NOT NULL,
        payment_method TEXT DEFAULT 'cash',
        payment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        payment_type TEXT DEFAULT 'payment',
        reference_number TEXT NULL,
        notes TEXT NULL,
        created_by INTEGER NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES customers(id),
        FOREIGN KEY (sale_id) REFERENCES sales(id)
      )
    `)

    // Create indexes for better performance
    await this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_products_uuid ON products(uuid);
      CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
      CREATE INDEX IF NOT EXISTS idx_products_type ON products(type);
      CREATE INDEX IF NOT EXISTS idx_customers_uuid ON customers(uuid);
      CREATE INDEX IF NOT EXISTS idx_stock_product_id ON stock(product_id);
      CREATE INDEX IF NOT EXISTS idx_sales_customer_id ON sales(customer_id);
      CREATE INDEX IF NOT EXISTS idx_sales_payment_status ON sales(payment_status);
      CREATE INDEX IF NOT EXISTS idx_payment_history_customer_id ON payment_history(customer_id);
      CREATE INDEX IF NOT EXISTS idx_payment_history_sale_id ON payment_history(sale_id);
      CREATE INDEX IF NOT EXISTS idx_payment_history_payment_date ON payment_history(payment_date);
    `)

    // Create view for outstanding payments
    await this.db.exec(`
      CREATE VIEW IF NOT EXISTS outstanding_payments_view AS
      SELECT
        c.id as customer_id,
        c.name as customer_name,
        c.phone as customer_phone,
        c.address as customer_address,
        c.credit_limit,
        c.payment_terms,
        c.is_credit_enabled,
        SUM(s.outstanding_amount) as total_outstanding,
        MAX(s.last_updated) as last_updated,
        COUNT(s.id) as outstanding_sales_count,
        MIN(julianday('now') - julianday(s.created_at)) as days_outstanding,
        GROUP_CONCAT(s.id) as sale_ids
      FROM customers c
      INNER JOIN sales s ON c.id = s.customer_id
      WHERE s.outstanding_amount > 0
      GROUP BY c.id, c.name, c.phone, c.address, c.credit_limit, c.payment_terms, c.is_credit_enabled
    `)
  }

  private async runMigrations(): Promise<void> {
    if (!this.db) return

    try {
      // Check if credit_limit column exists in customers table
      const customerColumns = await this.db.all(`PRAGMA table_info(customers)`)
      const hasCreditLimit = customerColumns.some((col) => col.name === 'credit_limit')

      if (!hasCreditLimit) {
        await this.db.exec(`
          ALTER TABLE customers ADD COLUMN credit_limit REAL DEFAULT NULL;
        `)
      }

      const hasCreditBalance = customerColumns.some((col) => col.name === 'credit_balance')
      if (!hasCreditBalance) {
        await this.db.exec(`
          ALTER TABLE customers ADD COLUMN credit_balance REAL DEFAULT 0.00;
        `)
      }

      const hasPaymentTerms = customerColumns.some((col) => col.name === 'payment_terms')
      if (!hasPaymentTerms) {
        await this.db.exec(`
          ALTER TABLE customers ADD COLUMN payment_terms TEXT DEFAULT 'Net 30';
        `)
      }

      const hasCreditEnabled = customerColumns.some((col) => col.name === 'is_credit_enabled')
      if (!hasCreditEnabled) {
        await this.db.exec(`
          ALTER TABLE customers ADD COLUMN is_credit_enabled BOOLEAN DEFAULT 0;
        `)
      }

      // Check if payment_status column exists in sales table
      const salesColumns = await this.db.all(`PRAGMA table_info(sales)`)
      const hasPaymentStatus = salesColumns.some((col) => col.name === 'payment_status')

      if (!hasPaymentStatus) {
        await this.db.exec(`
          ALTER TABLE sales ADD COLUMN payment_status TEXT DEFAULT 'pending';
        `)

        // Update existing sales with payment status based on outstanding amount
        await this.db.exec(`
          UPDATE sales
          SET payment_status = CASE
            WHEN outstanding_amount = 0 THEN 'paid'
            WHEN outstanding_amount > 0 AND outstanding_amount < total_amount THEN 'partial'
            ELSE 'pending'
          END
        `)
      }
    } catch (error) {
      console.error('Migration error:', error)
      // Continue even if migrations fail - tables might already exist
    }
  }

  // Transaction wrapper
  async transaction<T>(callback: (db: Database) => Promise<T>): Promise<T> {
    if (!this.db) throw new Error('Database not initialized')

    await this.db.exec('BEGIN TRANSACTION')
    try {
      const result = await callback(this.db)
      await this.db.exec('COMMIT')
      return result
    } catch (error) {
      await this.db.exec('ROLLBACK')
      throw error
    }
  }

  // Product operations
  async createProduct(productData: CreateProductData): Promise<SingleProduct> {
    if (!this.db) throw new Error('Database not initialized')

    const uuid = this.generateUUID()
    const now = new Date().toISOString()

    const result = await this.db.run(
      'INSERT INTO products (uuid, name, price, quantity, type, created_at, last_updated) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [uuid, productData.name, productData.price, productData.quantity, productData.type, now, now]
    )

    const product = await this.db.get('SELECT * FROM products WHERE id = ?', [result.lastID])

    return {
      ...product,
      stock: await this.getProductStock(product.id)
    }
  }

  async getProducts(filters: ApiFilters = {}): Promise<Product> {
    if (!this.db) throw new Error('Database not initialized')

    let query = 'SELECT * FROM products WHERE 1=1'
    const params: any[] = []

    if (filters.featured !== undefined) {
      query += ' AND featured = ?'
      params.push(filters.featured ? 1 : 0)
    }

    if (filters.name) {
      query += ' AND name LIKE ?'
      params.push(`%${filters.name}%`)
    }

    if (filters.sort) {
      const [field, order] = filters.sort.split('-')
      query += ` ORDER BY ${field} ${order?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC'}`
    }

    if (filters.limit) {
      query += ' LIMIT ?'
      params.push(filters.limit)

      if (filters.page) {
        query += ' OFFSET ?'
        params.push((filters.page - 1) * filters.limit)
      }
    }

    const products = await this.db.all(query, params)
    const total = await this.db.get('SELECT COUNT(*) as count FROM products')

    const productsWithStock = await Promise.all(
      products.map(async (product) => ({
        ...product,
        stock: await this.getProductStock(product.id)
      }))
    )

    return {
      product: productsWithStock,
      total: total.count
    }
  }

  async getProductById(id: number): Promise<SingleProduct | null> {
    if (!this.db) throw new Error('Database not initialized')

    const product = await this.db.get('SELECT * FROM products WHERE id = ?', [id])

    if (!product) return null

    return {
      ...product,
      stock: await this.getProductStock(id)
    }
  }

  async updateProduct(
    id: number,
    updates: Partial<CreateProductData>
  ): Promise<SingleProduct | null> {
    if (!this.db) throw new Error('Database not initialized')

    const fields = Object.keys(updates)
    const values = Object.values(updates)

    if (fields.length === 0) return this.getProductById(id)

    const setClause = fields.map((field) => `${field} = ?`).join(', ')
    values.push(new Date().toISOString(), id)

    await this.db.run(`UPDATE products SET ${setClause}, last_updated = ? WHERE id = ?`, values)

    return this.getProductById(id)
  }

  async deleteProduct(id: number): Promise<boolean> {
    if (!this.db) throw new Error('Database not initialized')

    const result = await this.db.run('DELETE FROM products WHERE id = ?', [id])
    return (result.changes ?? 0) > 0
  }

  // Stock operations
  async getProductStock(productId: number): Promise<SingleStock[]> {
    if (!this.db) throw new Error('Database not initialized')

    const stocks = await this.db.all(
      `
      SELECT s.*, p.*
      FROM stock s
      LEFT JOIN products p ON s.product_id = p.id
      WHERE s.product_id = ?
    `,
      [productId]
    )

    return stocks.map((stock) => ({
      id: stock.id,
      product_id: stock.product_id,
      quantity: stock.quantity,
      type: stock.type,
      sales_id: stock.sales_id,
      status: stock.status,
      created_at: stock.created_at,
      last_updated: stock.last_updated,
      Product: {
        id: stock.product_id,
        uuid: stock.uuid,
        name: stock.name,
        price: stock.price,
        featured: stock.featured,
        rating: stock.rating,
        type: stock.type,
        quantity: stock.quantity,
        status: stock.status,
        last_updated: stock.last_updated,
        created_at: stock.created_at,
        stock: null
      }
    }))
  }

  async getAllStock(filters: ApiFilters = {}): Promise<AllStock> {
    if (!this.db) throw new Error('Database not initialized')

    let query = `
      SELECT s.*, p.*
      FROM stock s
      LEFT JOIN products p ON s.product_id = p.id
      WHERE 1=1
    `
    const params: any[] = []

    if (filters.limit) {
      query += ' LIMIT ?'
      params.push(filters.limit)

      if (filters.page) {
        query += ' OFFSET ?'
        params.push((filters.page - 1) * filters.limit)
      }
    }

    const stocks = await this.db.all(query, params)
    const total = await this.db.get('SELECT COUNT(*) as count FROM stock')

    const formattedStocks: SingleStock[] = stocks.map((stock) => ({
      id: stock.id,
      product_id: stock.product_id,
      quantity: stock.quantity,
      type: stock.type,
      sales_id: stock.sales_id,
      status: stock.status,
      created_at: stock.created_at,
      last_updated: stock.last_updated,
      Product: {
        id: stock.product_id,
        uuid: stock.uuid,
        name: stock.name,
        price: stock.price,
        featured: stock.featured,
        rating: stock.rating,
        type: stock.type,
        quantity: stock.quantity,
        status: stock.status,
        last_updated: stock.last_updated,
        created_at: stock.created_at,
        stock: null
      }
    }))

    return {
      stock: formattedStocks,
      total: total.count
    }
  }

  // Customer operations
  async createCustomer(customerData: CreateCustomerData): Promise<Customer> {
    if (!this.db) throw new Error('Database not initialized')

    const uuid = this.generateUUID()
    const now = new Date().toISOString()

    const result = await this.db.run(
      'INSERT INTO customers (uuid, name, phone, address, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
      [uuid, customerData.name, customerData.phone, customerData.address, now, now]
    )

    const customer = await this.db.get('SELECT * FROM customers WHERE id = ?', [result.lastID])

    return customer
  }

  async getCustomerById(id: number): Promise<Customer | null> {
    if (!this.db) throw new Error('Database not initialized')

    try {
      const customer = await this.db.get(`SELECT * FROM customers WHERE id = ?`, [id])

      return customer || null
    } catch (error) {
      console.error('Error getting customer by ID:', error)
      throw error
    }
  }

  async getCustomers(filters: ApiFilters = {}): Promise<AllCustomers> {
    if (!this.db) throw new Error('Database not initialized')

    let query = 'SELECT * FROM customers WHERE 1=1'
    const params: any[] = []

    if (filters.name) {
      query += ' AND name LIKE ?'
      params.push(`%${filters.name}%`)
    }

    if (filters.limit) {
      query += ' LIMIT ?'
      params.push(filters.limit)

      if (filters.page) {
        query += ' OFFSET ?'
        params.push((filters.page - 1) * filters.limit)
      }
    }

    const customers = await this.db.all(query, params)
    const total = await this.db.get('SELECT COUNT(*) as count FROM customers')

    return {
      customers,
      total: total.count
    }
  }

  async updateCustomer(id: number, updates: Partial<CreateCustomerData>): Promise<Customer | null> {
    if (!this.db) throw new Error('Database not initialized')

    const fields = Object.keys(updates)
    const values = Object.values(updates)

    if (fields.length === 0) {
      const customer = await this.db.get('SELECT * FROM customers WHERE id = ?', [id])
      return customer ?? null
    }

    const setClause = fields.map((field) => `${field} = ?`).join(', ')
    values.push(new Date().toISOString(), id)

    await this.db.run(`UPDATE customers SET ${setClause}, updated_at = ? WHERE id = ?`, values)

    const customer = await this.db.get('SELECT * FROM customers WHERE id = ?', [id])
    return customer ?? null
  }

  async deleteCustomer(id: number): Promise<boolean> {
    if (!this.db) throw new Error('Database not initialized')

    const result = await this.db.run('DELETE FROM customers WHERE id = ?', [id])
    return (result.changes ?? 0) > 0
  }

  // Sales operations
  async createSale(saleData: CreateSaleData): Promise<Sale> {
    if (!this.db) throw new Error('Database not initialized')

    return this.transaction(async (db) => {
      const now = new Date().toISOString()

      // Determine payment status
      let paymentStatus = 'pending'
      if (saleData.outstanding === 0) {
        paymentStatus = 'paid'
      } else if (saleData.total_paid > 0) {
        paymentStatus = 'partial'
      }

      // Create the sale
      const result = await db.run(
        `
        INSERT INTO sales (
          customer_id, customer_name, total, outstanding, outstanding_amount,
          total_amount, total_paid, payment_status, products, created_at, last_updated
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
        [
          saleData.customer_id,
          saleData.customer_name,
          saleData.total_paid,
          saleData.outstanding,
          saleData.outstanding,
          saleData.total_paid + saleData.outstanding,
          saleData.total_paid,
          paymentStatus,
          JSON.stringify(saleData.products),
          now,
          now
        ]
      )

      // Update product quantities and create stock entries
      for (const product of saleData.products) {
        await db.run('UPDATE products SET quantity = quantity - ? WHERE id = ?', [
          product.quantity,
          product.product_id
        ])

        await db.run(
          `
          INSERT INTO stock (
            product_id, quantity, type, sales_id, created_at, last_updated
          ) VALUES (?, ?, ?, ?, ?, ?)
        `,
          [product.product_id, -product.quantity, 'sale', result.lastID, now, now]
        )
      }

      // Update customer credit balance if there's outstanding amount
      if (saleData.outstanding > 0) {
        await db.run(
          `
          UPDATE customers
          SET credit_balance = credit_balance + ?
          WHERE id = ?
        `,
          [saleData.outstanding, saleData.customer_id]
        )
      }

      // Get the created sale with customer info
      const sale = await db.get(
        `
        SELECT s.*, c.name as customer_name, c.phone, c.address
        FROM sales s
        LEFT JOIN customers c ON s.customer_id = c.id
        WHERE s.id = ?
      `,
        [result.lastID]
      )

      return {
        ...sale,
        products: JSON.parse(sale.products),
        Customer: {
          id: sale.customer_id,
          name: sale.customer_name,
          phone: sale.phone,
          address: sale.address
        }
      }
    })
  }

  async getSales(filters: ApiFilters = {}): Promise<AllSales> {
    if (!this.db) throw new Error('Database not initialized')

    let query = `
      SELECT s.*, c.name as customer_name, c.phone, c.address
      FROM sales s
      LEFT JOIN customers c ON s.customer_id = c.id
      WHERE 1=1
    `
    const params: any[] = []

    if (filters.limit) {
      query += ' LIMIT ?'
      params.push(filters.limit)

      if (filters.page) {
        query += ' OFFSET ?'
        params.push((filters.page - 1) * filters.limit)
      }
    }

    const sales = await this.db.all(query, params)
    const total = await this.db.get('SELECT COUNT(*) as count FROM sales')

    const formattedSales: Sale[] = sales.map((sale) => ({
      id: sale.id,
      customer_id: sale.customer_id,
      customer_name: sale.customer_name,
      total: sale.total,
      outstanding: sale.outstanding,
      outstanding_amount: sale.outstanding_amount,
      total_amount: sale.total_amount,
      total_paid: sale.total_paid,
      products: JSON.parse(sale.products),
      status: sale.status,
      created_at: sale.created_at,
      last_updated: sale.last_updated,
      Customer: {
        id: sale.customer_id,
        name: sale.customer_name,
        phone: sale.phone,
        address: sale.address
      }
    }))

    return {
      sales: formattedSales,
      total: total.count
    }
  }

  // ===== PAYMENT OPERATIONS =====

  /**
   * Process a payment and apply it to outstanding sales
   */
  async processPayment(paymentData: PaymentProcessData): Promise<any> {
    if (!this.db) throw new Error('Database not initialized')

    return this.transaction(async (db) => {
      const now = new Date().toISOString()

      // Record the main payment
      const paymentResult = await db.run(
        `
        INSERT INTO payment_history
        (customer_id, payment_amount, payment_method, notes, payment_type, created_at)
        VALUES (?, ?, ?, ?, 'payment', ?)
      `,
        [
          paymentData.customerId,
          paymentData.amount,
          paymentData.paymentMethod || 'cash',
          paymentData.notes || '',
          now
        ]
      )

      // Apply payment to outstanding sales (oldest first)
      let remainingAmount = paymentData.amount

      const outstandingSales = await db.all(
        `
        SELECT id, outstanding_amount, total_amount
        FROM sales
        WHERE customer_id = ? AND outstanding_amount > 0
        ORDER BY created_at ASC
      `,
        [paymentData.customerId]
      )

      const updatedSales = []

      for (const sale of outstandingSales) {
        if (remainingAmount <= 0) break

        const paymentForThisSale = Math.min(remainingAmount, sale.outstanding_amount)
        const newOutstanding = sale.outstanding_amount - paymentForThisSale

        // Determine new payment status
        let paymentStatus = 'pending'
        if (newOutstanding === 0) {
          paymentStatus = 'paid'
        } else if (newOutstanding < sale.total_amount) {
          paymentStatus = 'partial'
        }

        // Update sale outstanding amount and payment status
        await db.run(
          `
          UPDATE sales
          SET outstanding_amount = ?,
              payment_status = ?,
              total_paid = total_paid + ?,
              last_updated = ?
          WHERE id = ?
        `,
          [newOutstanding, paymentStatus, paymentForThisSale, now, sale.id]
        )

        // Record specific payment for this sale
        await db.run(
          `
          INSERT INTO payment_history
          (customer_id, sale_id, payment_amount, payment_method, notes, payment_type, created_at)
          VALUES (?, ?, ?, ?, ?, 'payment', ?)
        `,
          [
            paymentData.customerId,
            sale.id,
            paymentForThisSale,
            paymentData.paymentMethod || 'cash',
            `Payment applied to sale #${sale.id}`,
            now
          ]
        )

        remainingAmount -= paymentForThisSale
        updatedSales.push({
          saleId: sale.id,
          amountPaid: paymentForThisSale,
          newOutstanding,
          paymentStatus
        })
      }

      // Update customer credit balance
      const amountApplied = paymentData.amount - remainingAmount
      await db.run(
        `
        UPDATE customers
        SET credit_balance = credit_balance - ?,
            updated_at = ?
        WHERE id = ?
      `,
        [amountApplied, now, paymentData.customerId]
      )

      return {
        paymentId: paymentResult.lastID,
        amountApplied,
        remainingCredit: remainingAmount,
        updatedSales,
        totalSalesUpdated: updatedSales.length
      }
    })
  }

  /**
   * Get outstanding payments with filtering
   */
  async getOutstandingPayments(
    filters: OutstandingFilters = {}
  ): Promise<{ outstandingPayments: OutstandingPayment[]; totalAmount: number }> {
    if (!this.db) throw new Error('Database not initialized')

    let query = `SELECT * FROM outstanding_payments_view WHERE 1=1`
    const params: any[] = []

    if (filters.searchTerm) {
      query += ` AND (customer_name LIKE ? OR customer_phone LIKE ?)`
      params.push(`%${filters.searchTerm}%`, `%${filters.searchTerm}%`)
    }

    // Apply aging filter
    if (filters.agingFilter && filters.agingFilter !== 'all') {
      switch (filters.agingFilter) {
        case 'current':
          query += ` AND days_outstanding <= 30`
          break
        case 'overdue':
          query += ` AND days_outstanding > 30`
          break
        case '31-60':
          query += ` AND days_outstanding > 30 AND days_outstanding <= 60`
          break
        case '61-90':
          query += ` AND days_outstanding > 60 AND days_outstanding <= 90`
          break
        case '90+':
          query += ` AND days_outstanding > 90`
          break
      }
    }

    query += ` ORDER BY total_outstanding DESC`

    if (filters.limit) {
      query += ` LIMIT ?`
      params.push(filters.limit)

      if (filters.page) {
        query += ` OFFSET ?`
        params.push((filters.page - 1) * filters.limit)
      }
    }

    const outstandingPayments = await this.db.all(query, params)
    const totalAmount = outstandingPayments.reduce(
      (sum, payment) => sum + payment.total_outstanding,
      0
    )

    return { outstandingPayments, totalAmount }
  }

  /**
   * Get detailed payment information for a customer
   */
  async getCustomerPaymentDetails(customerId: number): Promise<any> {
    if (!this.db) throw new Error('Database not initialized')

    // Get customer info
    const customer = await this.db.get(
      `
      SELECT * FROM customers WHERE id = ?
    `,
      [customerId]
    )

    if (!customer) throw new Error('Customer not found')

    // Get outstanding sales
    const outstandingSales = await this.db.all(
      `
      SELECT
        id,
        total_amount,
        outstanding_amount,
        payment_status,
        created_at,
        last_updated
      FROM sales
      WHERE customer_id = ? AND outstanding_amount > 0
      ORDER BY created_at ASC
    `,
      [customerId]
    )

    // Get payment history
    const paymentHistory = await this.db.all(
      `
      SELECT
        ph.*,
        s.total_amount as sale_total
      FROM payment_history ph
      LEFT JOIN sales s ON ph.sale_id = s.id
      WHERE ph.customer_id = ?
      ORDER BY ph.payment_date DESC
      LIMIT 50
    `,
      [customerId]
    )

    return {
      customer,
      outstandingSales,
      paymentHistory,
      totalOutstanding: outstandingSales.reduce((sum, sale) => sum + sale.outstanding_amount, 0)
    }
  }

  /**
   * Update customer credit settings
   */
  async updateCustomerCredit(creditData: CustomerCreditUpdate): Promise<Customer | null> {
    if (!this.db) throw new Error('Database not initialized')

    const now = new Date().toISOString()

    await this.db.run(
      `
      UPDATE customers
      SET credit_limit = ?,
          payment_terms = ?,
          is_credit_enabled = ?,
          updated_at = ?
      WHERE id = ?
    `,
      [
        creditData.creditLimit,
        creditData.paymentTerms,
        creditData.isCreditEnabled ? 1 : 0,
        now,
        creditData.customerId
      ]
    )

    return this.getCustomerById(creditData.customerId)
  }

  /**
   * Get payment history
   */
  async getPaymentHistory(customerId?: number, limit = 100): Promise<PaymentHistoryRecord[]> {
    if (!this.db) throw new Error('Database not initialized')

    let query = `
      SELECT ph.*, c.name as customer_name, s.total_amount as sale_total
      FROM payment_history ph
      LEFT JOIN customers c ON ph.customer_id = c.id
      LEFT JOIN sales s ON ph.sale_id = s.id
      WHERE 1=1
    `
    const params: any[] = []

    if (customerId) {
      query += ` AND ph.customer_id = ?`
      params.push(customerId)
    }

    query += ` ORDER BY ph.payment_date DESC LIMIT ?`
    params.push(limit)

    return await this.db.all(query, params)
  }

  // Utility methods
  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0
      const v = c === 'x' ? r : (r & 0x3) | 0x8
      return v.toString(16)
    })
  }

  async close(): Promise<void> {
    if (this.db) {
      await this.db.close()
      this.db = null
    }
  }
}

// Export singleton instance
export const dbManager = new DatabaseManager()
