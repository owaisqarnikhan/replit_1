import { storage } from './storage';
import { products, categories, users, orders, orderItems, cartItems, siteSettings } from '@shared/schema';
import fs from 'fs/promises';
import path from 'path';

export interface DatabaseExport {
  timestamp: string;
  version: string;
  data: {
    products: any[];
    categories: any[];
    users: any[];
    orders: any[];
    orderItems: any[];
    cartItems: any[];
    siteSettings: any[];
  };
}

export async function exportDatabase(): Promise<DatabaseExport> {
  try {
    const [
      productsData,
      categoriesData,
      usersData,
      ordersData,
      orderItemsData,
      cartItemsData,
      siteSettingsData
    ] = await Promise.all([
      storage.getProducts(),
      storage.getCategories(),
      storage.getUsers(),
      storage.getOrders(),
      storage.getOrderItems(),
      storage.getCartItems(),
      storage.getSiteSettings().then(settings => [settings])
    ]);

    const exportData: DatabaseExport = {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      data: {
        products: productsData,
        categories: categoriesData,
        users: usersData.map(user => ({ ...user, password: '[REDACTED]' })), // Remove sensitive data
        orders: ordersData,
        orderItems: orderItemsData,
        cartItems: cartItemsData,
        siteSettings: siteSettingsData.map(setting => ({ 
          ...setting, 
          smtpPassword: setting.smtpPassword ? '[REDACTED]' : null 
        }))
      }
    };

    return exportData;
  } catch (error) {
    console.error('Database export error:', error);
    throw new Error('Failed to export database');
  }
}

export async function saveExportToFile(exportData: DatabaseExport): Promise<string> {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `database-export-${timestamp}.json`;
    const filepath = path.join(process.cwd(), 'uploads', filename);
    
    await fs.writeFile(filepath, JSON.stringify(exportData, null, 2));
    return filename;
  } catch (error) {
    console.error('Export file save error:', error);
    throw new Error('Failed to save export file');
  }
}

export async function importDatabase(importData: DatabaseExport): Promise<void> {
  try {
    // Validate import data structure
    if (!importData.data || typeof importData.data !== 'object') {
      throw new Error('Invalid import data structure');
    }

    // Clear existing data (except users for security)
    await storage.clearProductsAndCategories();

    // Import categories first (as products depend on them)
    if (importData.data.categories && importData.data.categories.length > 0) {
      for (const category of importData.data.categories) {
        await storage.createCategory(category);
      }
    }

    // Import products
    if (importData.data.products && importData.data.products.length > 0) {
      for (const product of importData.data.products) {
        await storage.createProduct(product);
      }
    }

    // Import site settings (excluding sensitive data)
    if (importData.data.siteSettings && importData.data.siteSettings.length > 0) {
      const settings = importData.data.siteSettings[0];
      if (settings) {
        const sanitizedSettings = {
          ...settings,
          smtpPassword: null // Don't import passwords
        };
        await storage.updateSiteSettings(sanitizedSettings);
      }
    }

    console.log('Database import completed successfully');
  } catch (error) {
    console.error('Database import error:', error);
    throw new Error('Failed to import database: ' + (error as Error).message);
  }
}

export async function validateImportFile(filePath: string): Promise<DatabaseExport> {
  try {
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const importData = JSON.parse(fileContent);

    // Basic validation
    if (!importData.data || !importData.timestamp) {
      throw new Error('Invalid export file format');
    }

    return importData as DatabaseExport;
  } catch (error) {
    console.error('Import file validation error:', error);
    throw new Error('Invalid import file: ' + (error as Error).message);
  }
}