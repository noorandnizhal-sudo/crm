export type Customer = {
  id: string;
  name: string;
  phone: string;
  address: string;
  balance: number;
  notes: string;
};

export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
};

export type SaleItem = {
  productId: string;
  quantity: number;
  price: number;
};

export type Sale = {
  id: string;
  customerId: string;
  date: string;
  items: SaleItem[];
  total: number;
  paid: number;
};