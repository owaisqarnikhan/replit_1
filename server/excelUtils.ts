import * as XLSX from 'xlsx';
import { db } from './db';
import { products, categories, users, orders, orderItems, unitsOfMeasure, siteSettings, sliderImages } from '@shared/schema';
import type { Product, Category, User, Order, OrderItem, UnitOfMeasure, SiteSettings, SliderImage } from '@shared/schema';

export interface ExcelExportData {
  products: Product[];
  categories: Category[];
  users: User[];
  orders: Order[];
  orderItems: OrderItem[];
  unitsOfMeasure: UnitOfMeasure[];
  siteSettings: SiteSettings[];
  sliderImages: SliderImage[];
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
    'Unit of Measure': product.unitOfMeasure,
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

  // Create orders worksheet
  const ordersWS = XLSX.utils.json_to_sheet(data.orders.map(order => ({
    ID: order.id,
    'User ID': order.userId,
    Status: order.status,
    'Total Amount': order.totalAmount,
    'Shipping Address': order.shippingAddress,
    'Payment Method': order.paymentMethod,
    'Payment Status': order.paymentStatus,
    Notes: order.notes,
    'Created At': order.createdAt,
    'Updated At': order.updatedAt
  })));

  // Create order items worksheet
  const orderItemsWS = XLSX.utils.json_to_sheet(data.orderItems.map(item => ({
    ID: item.id,
    'Order ID': item.orderId,
    'Product ID': item.productId,
    Quantity: item.quantity,
    Price: item.price,
    'Created At': item.createdAt
  })));

  // Create units of measure worksheet
  const unitsWS = XLSX.utils.json_to_sheet(data.unitsOfMeasure.map(unit => ({
    ID: unit.id,
    Name: unit.name,
    Abbreviation: unit.abbreviation,
    'Is Active': unit.isActive,
    'Created At': unit.createdAt
  })));

  // Create site settings worksheet
  const settingsWS = XLSX.utils.json_to_sheet(data.siteSettings.map(setting => ({
    ID: setting.id,
    'Site Name': setting.siteName,
    'Header Logo': setting.headerLogo,
    'Footer Logo': setting.footerLogo,
    'Footer Description': setting.footerDescription,
    'Footer Copyright': setting.footerCopyright,
    'Footer Quick Links Title': setting.footerQuickLinksTitle,
    'Footer Quick Links': setting.footerQuickLinks,
    'Footer Services Title': setting.footerServicesTitle,
    'Footer Services': setting.footerServices,
    'Footer Social Facebook': setting.footerSocialFacebook,
    'Footer Social Twitter': setting.footerSocialTwitter,
    'Footer Social Instagram': setting.footerSocialInstagram,
    'Footer Social LinkedIn': setting.footerSocialLinkedin,
    'Footer Background Image': setting.footerBackgroundImage,
    'SMTP Host': setting.smtpHost,
    'SMTP Port': setting.smtpPort,
    'SMTP Username': setting.smtpUsername,
    'SMTP From Email': setting.smtpFromEmail,
    'SMTP From Name': setting.smtpFromName,
    'Updated At': setting.updatedAt
  })));

  // Create slider images worksheet
  const sliderWS = XLSX.utils.json_to_sheet(data.sliderImages.map(slide => ({
    ID: slide.id,
    Title: slide.title,
    'Image URL': slide.imageUrl,
    'Link URL': slide.linkUrl,
    'Is Active': slide.isActive,
    'Display Order': slide.displayOrder,
    'Created At': slide.createdAt
  })));

  XLSX.utils.book_append_sheet(workbook, productsWS, 'Products');
  XLSX.utils.book_append_sheet(workbook, categoriesWS, 'Categories');
  XLSX.utils.book_append_sheet(workbook, usersWS, 'Users');
  XLSX.utils.book_append_sheet(workbook, ordersWS, 'Orders');
  XLSX.utils.book_append_sheet(workbook, orderItemsWS, 'Order Items');
  XLSX.utils.book_append_sheet(workbook, unitsWS, 'Units of Measure');
  XLSX.utils.book_append_sheet(workbook, settingsWS, 'Site Settings');
  XLSX.utils.book_append_sheet(workbook, sliderWS, 'Slider Images');

  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
}

export function parseExcelFile(buffer: Buffer): {
  products: any[];
  categories: any[];
  users: any[];
  orders: any[];
  orderItems: any[];
  unitsOfMeasure: any[];
  siteSettings: any[];
  sliderImages: any[];
} {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  
  const result = {
    products: [] as any[],
    categories: [] as any[],
    users: [] as any[],
    orders: [] as any[],
    orderItems: [] as any[],
    unitsOfMeasure: [] as any[],
    siteSettings: [] as any[],
    sliderImages: [] as any[]
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
      unitOfMeasure: row['Unit of Measure'] || row.unitOfMeasure || 'piece',
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

  // Parse units of measure sheet
  if (workbook.SheetNames.includes('Units of Measure')) {
    const unitsSheet = workbook.Sheets['Units of Measure'];
    const unitsData = XLSX.utils.sheet_to_json(unitsSheet);
    result.unitsOfMeasure = unitsData.map((row: any) => ({
      id: row.ID || row.id,
      name: row.Name || row.name,
      abbreviation: row.Abbreviation || row.abbreviation,
      isActive: Boolean(row['Is Active'] !== undefined ? row['Is Active'] : row.isActive !== undefined ? row.isActive : true)
    }));
  }

  // Parse orders sheet
  if (workbook.SheetNames.includes('Orders')) {
    const ordersSheet = workbook.Sheets['Orders'];
    const ordersData = XLSX.utils.sheet_to_json(ordersSheet);
    result.orders = ordersData.map((row: any) => ({
      id: row.ID || row.id,
      userId: row['User ID'] || row.userId,
      status: row.Status || row.status || 'pending',
      totalAmount: parseFloat(row['Total Amount'] || row.totalAmount || '0'),
      shippingAddress: row['Shipping Address'] || row.shippingAddress,
      paymentMethod: row['Payment Method'] || row.paymentMethod,
      paymentStatus: row['Payment Status'] || row.paymentStatus || 'pending',
      notes: row.Notes || row.notes
    }));
  }

  // Parse order items sheet
  if (workbook.SheetNames.includes('Order Items')) {
    const orderItemsSheet = workbook.Sheets['Order Items'];
    const orderItemsData = XLSX.utils.sheet_to_json(orderItemsSheet);
    result.orderItems = orderItemsData.map((row: any) => ({
      id: row.ID || row.id,
      orderId: row['Order ID'] || row.orderId,
      productId: row['Product ID'] || row.productId,
      quantity: parseInt(row.Quantity || row.quantity || '1'),
      price: parseFloat(row.Price || row.price || '0')
    }));
  }

  // Parse slider images sheet
  if (workbook.SheetNames.includes('Slider Images')) {
    const sliderSheet = workbook.Sheets['Slider Images'];
    const sliderData = XLSX.utils.sheet_to_json(sliderSheet);
    result.sliderImages = sliderData.map((row: any) => ({
      id: row.ID || row.id,
      title: row.Title || row.title,
      imageUrl: row['Image URL'] || row.imageUrl,
      linkUrl: row['Link URL'] || row.linkUrl,
      isActive: Boolean(row['Is Active'] !== undefined ? row['Is Active'] : row.isActive !== undefined ? row.isActive : true),
      displayOrder: parseInt(row['Display Order'] || row.displayOrder || '0')
    }));
  }

  return result;
}

export async function exportDataToExcel(): Promise<Buffer> {
  const [
    productsData, 
    categoriesData, 
    usersData, 
    ordersData, 
    orderItemsData, 
    unitsData, 
    settingsData, 
    sliderData
  ] = await Promise.all([
    db.select().from(products),
    db.select().from(categories),
    db.select().from(users),
    db.select().from(orders),
    db.select().from(orderItems),
    db.select().from(unitsOfMeasure),
    db.select().from(siteSettings),
    db.select().from(sliderImages)
  ]);

  const exportData: ExcelExportData = {
    products: productsData,
    categories: categoriesData,
    users: usersData,
    orders: ordersData,
    orderItems: orderItemsData,
    unitsOfMeasure: unitsData,
    siteSettings: settingsData,
    sliderImages: sliderData
  };

  return createExcelFile(exportData);
}