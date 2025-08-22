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
  AuthResponse,
  LoginData,
  RegisterData,
  Sale,
  AllSales,
  Customer,
  AllCustomers,
  CreateSaleData,
  CreateCustomerData,
  ApiFilters
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
  }

  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized')

    // Enable foreign keys
    await this.db.exec('PRAGMA foreign_keys = ON')

    // Users table
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        uuid TEXT UNIQUE NOT NULL,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

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
        user_id INTEGER NOT NULL,
        products TEXT NOT NULL, -- JSON string
        status BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES customers(id),
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `)

    // Stock table
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS stock (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        type TEXT NOT NULL,
        user_id INTEGER NOT NULL,
        sales_id INTEGER,
        status INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id),
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (sales_id) REFERENCES sales(id)
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
      CREATE INDEX IF NOT EXISTS idx_users_uuid ON users(uuid);
      CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
    `)
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

  // User operations
  async createUser(userData: RegisterData): Promise<AuthResponse> {
    if (!this.db) throw new Error('Database not initialized')

    const uuid = this.generateUUID()

    await this.db.run('INSERT INTO users (uuid, username, password, name) VALUES (?, ?, ?, ?)', [
      uuid,
      userData.username,
      userData.password,
      userData.name
    ])

    return {
      username: userData.username,
      uuid,
      role: 'user'
    }
  }

  async getUserByUsername(username: string): Promise<AuthResponse | null> {
    if (!this.db) throw new Error('Database not initialized')

    const user = await this.db.get('SELECT uuid, username, role FROM users WHERE username = ?', [
      username
    ])

    return user || null
  }

  async validateUser(loginData: LoginData): Promise<AuthResponse | null> {
    if (!this.db) throw new Error('Database not initialized')

    const user = await this.db.get(
      'SELECT uuid, username, role FROM users WHERE username = ? AND password = ?',
      [loginData.username, loginData.password]
    )

    return user || null
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

    // Add stock info to each product
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
      SELECT s.*, p.*, u.username, u.uuid as user_uuid, u.role
      FROM stock s
      LEFT JOIN products p ON s.product_id = p.id
      LEFT JOIN users u ON s.user_id = u.id
      WHERE s.product_id = ?
    `,
      [productId]
    )

    return stocks.map((stock) => ({
      id: stock.id,
      product_id: stock.product_id,
      quantity: stock.quantity,
      type: stock.type,
      user_id: stock.user_id,
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
      },
      User: stock.username
        ? {
            username: stock.username,
            uuid: stock.user_uuid,
            role: stock.role
          }
        : undefined
    }))
  }

  async getAllStock(filters: ApiFilters = {}): Promise<AllStock> {
    if (!this.db) throw new Error('Database not initialized')

    let query = `
      SELECT s.*, p.*, u.username, u.uuid as user_uuid, u.role
      FROM stock s
      LEFT JOIN products p ON s.product_id = p.id
      LEFT JOIN users u ON s.user_id = u.id
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
      user_id: stock.user_id,
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
      },
      User: stock.username
        ? {
            username: stock.username,
            uuid: stock.user_uuid,
            role: stock.role
          }
        : undefined
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

  async getCustomerById(id: number): Promise<any | null> {
    try {
      const customer = await this.db?.get(
        `SELECT
        id,
        name,
        phone,
        email,
        address,
        created_at,
        last_updated,
        is_deleted,
        deleted_at,
        deleted_by
      FROM customers
      WHERE id = ? AND (is_deleted = 0 OR is_deleted IS NULL)`,
        [id]
      )

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
  async createSale(saleData: CreateSaleData, userId: number): Promise<Sale> {
    if (!this.db) throw new Error('Database not initialized')

    return this.transaction(async (db) => {
      const now = new Date().toISOString()

      // Create the sale
      const result = await db.run(
        `
        INSERT INTO sales (
          customer_id, customer_name, total, outstanding, outstanding_amount,
          total_amount, total_paid, user_id, products, created_at, last_updated
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
          userId,
          JSON.stringify(saleData.products),
          now,
          now
        ]
      )

      // Update product quantities and create stock entries
      for (const product of saleData.products) {
        // Update product quantity
        await db.run('UPDATE products SET quantity = quantity - ? WHERE id = ?', [
          product.quantity,
          product.product_id
        ])

        // Create stock entry for the sale
        await db.run(
          `
          INSERT INTO stock (
            product_id, quantity, type, user_id, sales_id, created_at, last_updated
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
          [
            product.product_id,
            -product.quantity, // Negative for sale
            'sale',
            userId,
            result.lastID,
            now,
            now
          ]
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
      user_id: sale.user_id,
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
