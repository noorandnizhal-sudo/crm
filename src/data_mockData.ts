import { Customer, Product, Sale } from './types';

export const mockCustomers: Customer[] = [
  {
    id: 'c1',
    name: 'Ravi Kumar',
    phone: '9876543210',
    address: 'Main Bazaar',
    balance: 1200,
    notes: 'Regular customer'
  },
  {
    id: 'c2',
    name: 'Meena Selvam',
    phone: '9123456780',
    address: 'Market Street',
    balance: 450,
    notes: 'Buys rice and groceries'
  },
  {
    id: 'c3',
    name: 'Karthick',
    phone: '9988776655',
    address: 'Old Town',
    balance: 0,
    notes: 'Paid on time'
  }
];

export const mockProducts: Product[] = [
  { id: 'p1', name: 'Rice 25kg', category: 'Staples', price: 1200, stock: 20 },
  { id: 'p2', name: 'Wheat Flour', category: 'Staples', price: 420, stock: 15 },
  { id: 'p3', name: 'Milk', category: 'Dairy', price: 60, stock: 40 },
  { id: 'p4', name: 'Sugar 5kg', category: 'Groceries', price: 280, stock: 18 },
  { id: 'p5', name: 'Toothpaste', category: 'Daily Needs', price: 90, stock: 25 }
];

export const mockSales: Sale[] = [
  {
    id: 's1',
    customerId: 'c1',
    date: '2026-11-10',
    items: [
      { productId: 'p1', quantity: 1, price: 1200 },
      { productId: 'p3', quantity: 2, price: 60 }
    ],
    total: 1320,
    paid: 120
  },
  {
    id: 's2',
    customerId: 'c2',
    date: '2026-11-11',
    items: [
      { productId: 'p2', quantity: 2, price: 420 }
    ],
    total: 840,
    paid: 390
  }
];