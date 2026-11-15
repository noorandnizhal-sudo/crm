import { useEffect, useMemo, useState } from 'react';

type Customer = {
  id: string;
  name: string;
  phone: string;
  address: string;
  notes: string;
  balance: number;
};

type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
};

type SaleItem = {
  productId: string;
  quantity: number;
  price: number;
};

type Sale = {
  id: string;
  customerId: string;
  date: string;
  items: SaleItem[];
  total: number;
  paid: number;
};

type Tab = 'dashboard' | 'customers' | 'products' | 'sales' | 'udhaar';

const STORAGE_KEY = 'grocery-crm-v1';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(value);

const generateId = (prefix: string) =>
  `${prefix}_${Math.random().toString(36).slice(2, 9)}`;

const emptyCustomerForm = {
  name: '',
  phone: '',
  address: '',
  notes: ''
};

const emptyProductForm = {
  name: '',
  category: '',
  price: '0',
  stock: '0'
};

const defaultCustomers: Customer[] = [
  { id: 'c1', name: 'Ravi Kumar', phone: '9876543210', address: 'Main Bazaar', notes: 'Regular customer', balance: 1200 },
  { id: 'c2', name: 'Meena Selvam', phone: '9123456780', address: 'Market Street', notes: 'Buys rice and groceries', balance: 450 },
  { id: 'c3', name: 'Karthick', phone: '9988776655', address: 'Old Town', notes: 'Paid on time', balance: 0 }
];

const defaultProducts: Product[] = [
  { id: 'p1', name: 'Rice 25kg', category: 'Staples', price: 1200, stock: 20 },
  { id: 'p2', name: 'Wheat Flour', category: 'Staples', price: 420, stock: 15 },
  { id: 'p3', name: 'Milk', category: 'Dairy', price: 60, stock: 40 },
  { id: 'p4', name: 'Sugar 5kg', category: 'Groceries', price: 280, stock: 18 },
  { id: 'p5', name: 'Toothpaste', category: 'Daily Needs', price: 90, stock: 25 }
];

const defaultSales: Sale[] = [
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
    items: [{ productId: 'p2', quantity: 2, price: 420 }],
    total: 840,
    paid: 390
  }
];

function App() {
  const [customers, setCustomers] = useState<Customer[]>(defaultCustomers);
  const [products, setProducts] = useState<Product[]>(defaultProducts);
  const [sales, setSales] = useState<Sale[]>(defaultSales);
  const [tab, setTab] = useState<Tab>('dashboard');

  const [customerForm, setCustomerForm] = useState(emptyCustomerForm);
  const [productForm, setProductForm] = useState(emptyProductForm);

  const [saleCustomerId, setSaleCustomerId] = useState(defaultCustomers[0].id);
  const [saleItems, setSaleItems] = useState<SaleItem[]>([
    { productId: defaultProducts[0].id, quantity: 1, price: defaultProducts[0].price }
  ]);
  const [paidAmount, setPaidAmount] = useState<number>(0);

  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ customers: defaultCustomers, products: defaultProducts, sales: defaultSales }));
      return;
    }

    try {
      const parsed = JSON.parse(raw);
      if (parsed.customers) setCustomers(parsed.customers);
      if (parsed.products) setProducts(parsed.products);
      if (parsed.sales) setSales(parsed.sales);
      if (parsed.customers?.[0]) setSaleCustomerId(parsed.customers[0].id);
    } catch {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ customers: defaultCustomers, products: defaultProducts, sales: defaultSales }));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ customers, products, sales }));
  }, [customers, products, sales]);

  const totalSales = useMemo(
    () => sales.reduce((sum, sale) => sum + sale.total, 0),
    [sales]
  );

  const totalOutstanding = useMemo(
    () => customers.reduce((sum, c) => sum + c.balance, 0),
    [customers]
  );

  const lowStockProducts = useMemo(
    () => products.filter((product) => product.stock <= 5),
    [products]
  );

  const addCustomer = () => {
    if (!customerForm.name.trim() || !customerForm.phone.trim()) {
      setMessage('Please enter customer name and phone.');
      return;
    }

    const newCustomer: Customer = {
      id: generateId('c'),
      name: customerForm.name.trim(),
      phone: customerForm.phone.trim(),
      address: customerForm.address.trim(),
      notes: customerForm.notes.trim(),
      balance: 0
    };

    setCustomers((prev) => [newCustomer, ...prev]);
    setCustomerForm(emptyCustomerForm);
    setMessage('Customer added successfully.');
  };

  const saveProduct = () => {
    if (!productForm.name.trim()) {
      setMessage('Product name is required.');
      return;
    }

    const newProduct: Product = {
      id: generateId('p'),
      name: productForm.name.trim(),
      category: productForm.category.trim() || 'General',
      price: Number(productForm.price) || 0,
      stock: Number(productForm.stock) || 0
    };

    setProducts((prev) => [newProduct, ...prev]);
    setProductForm(emptyProductForm);
    setMessage('Product added successfully.');
  };

  const updateCustomerBalance = (customerId: string, change: number) => {
    setCustomers((prev) =>
      prev.map((customer) =>
        customer.id === customerId ? { ...customer, balance: Number((customer.balance + change).toFixed(2)) } : customer
      )
    );
  };

  const addSaleItemRow = () => {
    const firstProduct = products[0];
    setSaleItems((prev) => [
      ...prev,
      {
        productId: firstProduct ? firstProduct.id : '',
        quantity: 1,
        price: firstProduct ? firstProduct.price : 0
      }
    ]);
  };

  const removeSaleItemRow = (index: number) => {
    setSaleItems((prev) => prev.filter((_, i) => i !== index));
  };

  const updateSaleItem = (
    index: number,
    field: 'productId' | 'quantity' | 'price',
    value: string | number
  ) => {
    setSaleItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;

        if (field === 'productId') {
          const selectedProduct = products.find((p) => p.id === value);
          return {
            ...item,
            productId: String(value),
            price: selectedProduct ? selectedProduct.price : item.price
          };
        }

        if (field === 'quantity') {
          return {
            ...item,
            quantity: Math.max(1, Number(value) || 1)
          };
        }

        if (field === 'price') {
          return {
            ...item,
            price: Math.max(0, Number(value) || 0)
          };
        }

        return item;
      })
    );
  };

  const saleTotal = saleItems.reduce((sum, item) => sum + item.quantity * item.price, 0);

  const saveSale = () => {
    if (!saleCustomerId) {
      setMessage('Please select a customer.');
      return;
    }

    if (saleItems.length === 0) {
      setMessage('Add at least one product item.');
      return;
    }

    const stockValidationErrors: string[] = [];

    saleItems.forEach((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) {
        stockValidationErrors.push('One of the selected products was not found.');
        return;
      }

      if (item.quantity > product.stock) {
        stockValidationErrors.push(`${product.name} has only ${product.stock} in stock.`);
      }
    });

    if (stockValidationErrors.length > 0) {
      setMessage(stockValidationErrors.join(' '));
      return;
    }

    const newSale: Sale = {
      id: generateId('s'),
      customerId: saleCustomerId,
      date: new Date().toISOString().slice(0, 10),
      items: saleItems,
      total: saleTotal,
      paid: Number(paidAmount) || 0
    };

    setSales((prev) => [newSale, ...prev]);

    setProducts((prev) =>
      prev.map((product) => {
        const matchingItem = saleItems.find((item) => item.productId === product.id);
        if (!matchingItem) return product;
        return {
          ...product,
          stock: Math.max(0, product.stock - matchingItem.quantity)
        };
      })
    );

    const customerBalanceDelta = newSale.total - newSale.paid;
    updateCustomerBalance(newSale.customerId, customerBalanceDelta);

    setSaleItems([
      {
        productId: products[0]?.id ?? '',
        quantity: 1,
        price: products[0]?.price ?? 0
      }
    ]);
    setPaidAmount(0);
    setMessage('Sale saved successfully.');
  };

  const recordPayment = (customerId: string, amount: number) => {
    if (!amount || amount <= 0) {
      setMessage('Payment amount must be greater than zero.');
      return;
    }

    setCustomers((prev) =>
      prev.map((customer) => {
        if (customer.id !== customerId) return customer;

        const newBalance = Math.max(0, customer.balance - amount);
        return { ...customer, balance: Number(newBalance.toFixed(2)) };
      })
    );

    setMessage('Payment recorded successfully.');
  };

  const selectedCustomer = customers.find((customer) => customer.id === saleCustomerId) || customers[0];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <h1>Grocery CRM</h1>
        </div>

        <nav className="nav">
          <button className={tab === 'dashboard' ? 'active' : ''} onClick={() => setTab('dashboard')}>
            Dashboard
          </button>
          <button className={tab === 'customers' ? 'active' : ''} onClick={() => setTab('customers')}>
            Customers
          </button>
          <button className={tab === 'products' ? 'active' : ''} onClick={() => setTab('products')}>
            Products
          </button>
          <button className={tab === 'sales' ? 'active' : ''} onClick={() => setTab('sales')}>
            Sales
          </button>
          <button className={tab === 'udhaar' ? 'active' : ''} onClick={() => setTab('udhaar')}>
            Udharr
          </button>
        </nav>
      </aside>

      <main className="content">
        {message && <div className="toast">{message}</div>}

        {tab === 'dashboard' && (
          <div className="page">
            <h2>Dashboard</h2>

            <div className="stats-grid">
              <div className="stat-card">
                <span>Total Sales</span>
                <strong>{formatCurrency(totalSales)}</strong>
              </div>
              <div className="stat-card">
                <span>Outstanding</span>
                <strong>{formatCurrency(totalOutstanding)}</strong>
              </div>
              <div className="stat-card">
                <span>Customers</span>
                <strong>{customers.length}</strong>
              </div>
              <div className="stat-card">
                <span>Low Stock Items</span>
                <strong>{lowStockProducts.length}</strong>
              </div>
            </div>

            <div className="panel">
              <h3>Low stock products</h3>
              {lowStockProducts.length === 0 ? (
                <p>No low stock items.</p>
              ) : (
                lowStockProducts.map((product) => (
                  <div key={product.id} className="list-item">
                    <div>
                      <strong>{product.name}</strong>
                      <small>{product.category}</small>
                    </div>
                    <span className="warning">{product.stock} left</span>
                  </div>
                ))
              )}
            </div>

            <div className="panel">
              <h3>Recent sales</h3>
              {sales.slice(0, 5).map((sale) => {
                const customer = customers.find((c) => c.id === sale.customerId);
                return (
                  <div key={sale.id} className="list-item">
                    <div>
                      <strong>{customer?.name || 'Unknown'}</strong>
                      <small>{sale.date}</small>
                    </div>
                    <span>{formatCurrency(sale.total)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {tab === 'customers' && (
          <div className="page">
            <h2>Customers</h2>

            <div className="two-col">
              <div className="panel">
                <h3>Add customer</h3>

                <div className="form-grid">
                  <input
                    value={customerForm.name}
                    onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
                    placeholder="Name"
                  />
                  <input
                    value={customerForm.phone}
                    onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                    placeholder="Phone"
                  />
                  <input
                    value={customerForm.address}
                    onChange={(e) => setCustomerForm({ ...customerForm, address: e.target.value })}
                    placeholder="Address"
                  />
                  <input
                    value={customerForm.notes}
                    onChange={(e) => setCustomerForm({ ...customerForm, notes: e.target.value })}
                    placeholder="Notes"
                  />
                  <button className="primary" onClick={addCustomer}>
                    Save Customer
                  </button>
                </div>
              </div>

              <div className="panel">
                <h3>Customer list</h3>

                <div className="customer-list">
                  {customers.map((customer) => (
                    <div key={customer.id} className="customer-card">
                      <div>
                        <strong>{customer.name}</strong>
                        <small>{customer.phone}</small>
                      </div>
                      <span className={customer.balance > 0 ? 'due' : 'paid'}>
                        {formatCurrency(customer.balance)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'products' && (
          <div className="page">
            <h2>Products</h2>

            <div className="two-col">
              <div className="panel">
                <h3>Add product</h3>

                <div className="form-grid">
                  <input
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    placeholder="Product name"
                  />
                  <input
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    placeholder="Category"
                  />
                  <input
                    type="number"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    placeholder="Price"
                  />
                  <input
                    type="number"
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                    placeholder="Stock"
                  />
                  <button className="primary" onClick={saveProduct}>
                    Add Product
                  </button>
                </div>
              </div>

              <div className="panel">
                <h3>Available products</h3>

                <div className="product-list">
                  {products.map((product) => (
                    <div key={product.id} className="product-card">
                      <div>
                        <strong>{product.name}</strong>
                        <small>{product.category}</small>
                      </div>
                      <div className="product-meta">
                        <span>{formatCurrency(product.price)}</span>
                        <span className={product.stock <= 5 ? 'warning' : 'ok'}>
                          Stock: {product.stock}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'sales' && (
          <div className="page">
            <h2>Sales</h2>

            <div className="panel">
              <div className="sale-top">
                <select value={saleCustomerId} onChange={(e) => setSaleCustomerId(e.target.value)}>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                    </option>
                  ))}
                </select>

                <div className="amount-box">
                  <label>Total</label>
                  <strong>{formatCurrency(saleTotal)}</strong>
                </div>
              </div>

              {saleItems.map((item, index) => (
                <div key={`${item.productId}-${index}`} className="sale-row">
                  <select
                    value={item.productId}
                    onChange={(e) => updateSaleItem(index, 'productId', e.target.value)}
                  >
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) => updateSaleItem(index, 'quantity', Number(e.target.value))}
                  />

                  <input
                    type="number"
                    value={item.price}
                    onChange={(e) => updateSaleItem(index, 'price', Number(e.target.value))}
                  />

                  <button className="danger" onClick={() => removeSaleItemRow(index)}>
                    Remove
                  </button>
                </div>
              ))}

              <div className="sale-actions">
                <button onClick={addSaleItemRow}>Add Item</button>

                <div className="paid-box">
                  <label>Received</label>
                  <input
                    type="number"
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(Number(e.target.value) || 0)}
                  />
                </div>
              </div>

              <button className="primary full" onClick={saveSale}>
                Save Sale
              </button>
            </div>

            {selectedCustomer && (
              <div className="panel">
                <h3>Selected customer</h3>
                <p>
                  <strong>Name:</strong> {selectedCustomer.name}
                </p>
                <p>
                  <strong>Phone:</strong> {selectedCustomer.phone}
                </p>
                <p>
                  <strong>Outstanding:</strong>{' '}
                  <span className={selectedCustomer.balance > 0 ? 'due' : 'paid'}>
                    {formatCurrency(selectedCustomer.balance)}
                  </span>
                </p>
              </div>
            )}
          </div>
        )}

        {tab === 'udhaar' && (
          <div className="page">
            <h2>Udharr / Outstanding</h2>

            <div className="panel">
              {customers
                .filter((customer) => customer.balance > 0)
                .map((customer) => (
                  <div key={customer.id} className="list-item">
                    <div>
                      <strong>{customer.name}</strong>
                      <small>{customer.phone}</small>
                    </div>

                    <div className="udhaar-actions">
                      <span className="due">{formatCurrency(customer.balance)}</span>
                      <button
                        className="small"
                        onClick={() => recordPayment(customer.id, Math.min(customer.balance, 250))}
                      >
                        +250
                      </button>
                      <button
                        className="small"
                        onClick={() => recordPayment(customer.id, Math.min(customer.balance, 500))}
                      >
                        +500
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;