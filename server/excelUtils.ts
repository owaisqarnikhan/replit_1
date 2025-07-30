import * as XLSX from 'xlsx';
import { db } from './db';
import { products, categories, users } from '@shared/schema';
import type { Product, Category, User } from '@shared/schema';

export interface ExcelExportData {
  products: Product[];
  categories: Category[];
  users: User[];
}

export function createExcelFile(data: ExcelExportData): Buffer {
  const workbook = XLSX.utils.book_new();

  // Create products worksheet
  const productsWS = XLSX.utils.json_to_sheet(data.products.map(product => ({
    ID: product.id,
    Name: product.name,
    Description: product.description,
    Price: product.price,
    Stock: product.stock,
    SKU: product.sku,
    'Category ID': product.categoryId,
    'Image URL': product.imageUrl,
    'Is Active': product.isActive,
    'Is Featured': product.isFeatured,
    Rating: product.rating,
    'Review Count': product.reviewCount,
    'Product Type': product.productType,
    'Rental Period': product.rentalPeriod,
    'Rental Price': product.rentalPrice,
    'Created At': product.createdAt
  })));

  // Create categories worksheet
  const categoriesWS = XLSX.utils.json_to_sheet(data.categories.map(category => ({
    ID: category.id,
    Name: category.name,
    Description: category.description,
    'Image URL': category.imageUrl,
    'Created At': category.createdAt
  })));

  // Create users worksheet (excluding sensitive data)
  const usersWS = XLSX.utils.json_to_sheet(data.users.map(user => ({
    ID: user.id,
    Username: user.username,
    Email: user.email,
    'First Name': user.firstName,
    'Last Name': user.lastName,
    'Is Admin': user.isAdmin,
    'Created At': user.createdAt
  })));

  XLSX.utils.book_append_sheet(workbook, productsWS, 'Products');
  XLSX.utils.book_append_sheet(workbook, categoriesWS, 'Categories');
  XLSX.utils.book_append_sheet(workbook, usersWS, 'Users');

  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
}

export function parseExcelFile(buffer: Buffer): {
  products: any[];
  categories: any[];
  users: any[];
} {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  
  const result = {
    products: [] as any[],
    categories: [] as any[],
    users: [] as any[]
  };

  // Parse products sheet
  if (workbook.SheetNames.includes('Products')) {
    const productsSheet = workbook.Sheets['Products'];
    const productsData = XLSX.utils.sheet_to_json(productsSheet);
    result.products = productsData.map((row: any) => ({
      id: row.ID || row.id,
      name: row.Name || row.name,
      description: row.Description || row.description,
      price: parseFloat(row.Price || row.price || '0'),
      stock: parseInt(row.Stock || row.stock || '0'),
      sku: row.SKU || row.sku,
      categoryId: row['Category ID'] || row.categoryId,
      imageUrl: row['Image URL'] || row.imageUrl,
      isActive: Boolean(row['Is Active'] !== undefined ? row['Is Active'] : row.isActive !== undefined ? row.isActive : true),
      isFeatured: Boolean(row['Is Featured'] !== undefined ? row['Is Featured'] : row.isFeatured !== undefined ? row.isFeatured : false),
      rating: parseFloat(row.Rating || row.rating || '0'),
      reviewCount: parseInt(row['Review Count'] || row.reviewCount || '0'),
      productType: row['Product Type'] || row.productType || 'purchase',
      rentalPeriod: row['Rental Period'] || row.rentalPeriod,
      rentalPrice: row['Rental Price'] ? parseFloat(row['Rental Price']) : row.rentalPrice ? parseFloat(row.rentalPrice) : null
    }));
  }

  // Parse categories sheet
  if (workbook.SheetNames.includes('Categories')) {
    const categoriesSheet = workbook.Sheets['Categories'];
    const categoriesData = XLSX.utils.sheet_to_json(categoriesSheet);
    result.categories = categoriesData.map((row: any) => ({
      id: row.ID || row.id,
      name: row.Name || row.name,
      description: row.Description || row.description,
      imageUrl: row['Image URL'] || row.imageUrl
    }));
  }

  // Parse users sheet
  if (workbook.SheetNames.includes('Users')) {
    const usersSheet = workbook.Sheets['Users'];
    const usersData = XLSX.utils.sheet_to_json(usersSheet);
    result.users = usersData.map((row: any) => ({
      id: row.ID || row.id,
      username: row.Username || row.username,
      email: row.Email || row.email,
      firstName: row['First Name'] || row.firstName,
      lastName: row['Last Name'] || row.lastName,
      isAdmin: Boolean(row['Is Admin'] !== undefined ? row['Is Admin'] : row.isAdmin !== undefined ? row.isAdmin : false)
    }));
  }

  return result;
}

export async function exportDataToExcel(): Promise<Buffer> {
  const [productsData, categoriesData, usersData] = await Promise.all([
    db.select().from(products),
    db.select().from(categories),
    db.select().from(users)
  ]);

  const exportData: ExcelExportData = {
    products: productsData,
    categories: categoriesData,
    users: usersData
  };

  return createExcelFile(exportData);
}