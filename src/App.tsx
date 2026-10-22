
import { useState } from 'react'
import './App.css'

type Product = {
  id: number
  name: string
  category: string
  price: number
  originalPrice: number
  stock: number
  totalStock: number
  emoji: string
}

const products: Product[] = [
  {
    id: 1,
    name: 'Wireless Headphones Pro',
    category: 'Electronics',
    price: 590000,
    originalPrice: 1290000,
    stock: 12,
    totalStock: 50,
    emoji: '🎧',
  },
  {
    id: 2,
    name: 'Smart Watch Series X',
    category: 'Wearables',
    price: 890000,
    originalPrice: 2190000,
    stock: 8,
    totalStock: 40,
    emoji: '⌚',
  },
  {
    id: 3,
    name: 'Bluetooth Speaker Mini',
    category: 'Audio',
    price: 350000,
    originalPrice: 790000,
    stock: 25,
    totalStock: 60,
    emoji: '🔊',
  },
  {
    id: 4,
    name: 'Mechanical Keyboard RGB',
    category: 'Accessories',
    price: 690000,
    originalPrice: 1490000,
    stock: 5,
    totalStock: 30,
    emoji: '⌨️',
  },
  {
    id: 5,
    name: 'Gaming Mouse Ultra',
    category: 'Gaming',
    price: 290000,
    originalPrice: 690000,
    stock: 17,
    totalStock: 50,
    emoji: '🖱️',
  },
  {
    id: 6,
    name: 'Portable Power Bank',
    category: 'Mobile Accessories',
    price: 390000,
    originalPrice: 890000,
    stock: 0,
    totalStock: 35,
    emoji: '🔋',
  },
]

function formatPrice(price: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(price)
}

function App() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [notice, setNotice] = useState(
    'Flash Sale demo is ready.'
  )

  const categories = [
    'All',
    ...new Set(products.map(product => product.category)),
  ]

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(search.toLowerCase())

    const matchesCategory =
      category === 'All' || product.category === category

    return matchesSearch && matchesCategory
  })

  function handleReserve(product: Product) {
    setNotice(
      `Selected ${product.name}. Inventory reservation will be implemented in Step 4.`
    )
  }

  return (
    <main className="app">
      <header className="topbar">
        <div className="brand">
          <span className="brand-icon">⚡</span>
          <span>FLASH<span className="brand-highlight">ZONE</span></span>
        </div>

        <span className="topbar-tag">
          HIGH-CONCURRENCY ENGINE
        </span>
      </header>

      <section className="hero">
        <div className="hero-content">
          <span className="hero-label">
            VIETNAM MEGA SALE EVENT
          </span>

          <h1>
            FLASH SALE
            <span>11.11 MEGA DEALS</span>
          </h1>

          <p>
            Unbeatable prices. Limited inventory.
            Experience our high-performance shopping engine.
          </p>

          <div className="hero-actions">
            <a href="#products" className="primary-link">
              Explore Deals →
            </a>
            <span className="hero-badge">
              Up to 70% OFF
            </span>
          </div>
        </div>

        <div className="hero-graphic" aria-hidden="true">
          <span>11</span>
          <strong>.11</strong>
          <small>MEGA SALE</small>
        </div>
      </section>

      <section className="countdown-panel" aria-label="Sale countdown">
        <div>
          <span className="section-eyebrow">
            LIMITED TIME EVENT
          </span>
          <h2>Flash Sale Countdown</h2>
          <p>
            Precise countdown engine coming in Step 3.
          </p>
        </div>

        <div className="countdown">
          <div className="time-box">
            <strong>00</strong>
            <span>HOURS</span>
          </div>
          <span className="separator">:</span>
          <div className="time-box">
            <strong>00</strong>
            <span>MINUTES</span>
          </div>
          <span className="separator">:</span>
          <div className="time-box">
            <strong>00</strong>
            <span>SECONDS</span>
          </div>
        </div>
      </section>

      <section id="products" className="products-section">
        <div className="section-heading">
          <div>
            <span className="section-eyebrow">
              EXCLUSIVE OFFERS
            </span>
            <h2>Today's Flash Deals</h2>
            <p>
              Limited stock — first come, first served.
            </p>
          </div>

          <span className="product-count">
            {filteredProducts.length} Products
          </span>
        </div>

        <div className="filters">
          <label className="search-field">
            <span>Search products</span>
            <input
              type="search"
              placeholder="Search for a product..."
              value={search}
              onChange={event => setSearch(event.target.value)}
            />
          </label>

          <label className="category-field">
            <span>Category</span>
            <select
              value={category}
              onChange={event => setCategory(event.target.value)}
            >
              {categories.map(item => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="product-grid">
          {filteredProducts.map(product => {
            const discount = Math.round(
              (1 - product.price / product.originalPrice) * 100
            )

            const soldPercent =
              ((product.totalStock - product.stock) /
                product.totalStock) * 100

            return (
              <article className="product-card" key={product.id}>
                <div className="product-image">
                  <span className="discount-badge">
                    -{discount}%
                  </span>

                  <span className="product-emoji" aria-hidden="true">
                    {product.emoji}
                  </span>

                  {product.stock === 0 && (
                    <span className="soldout-overlay">
                      SOLD OUT
                    </span>
                  )}
                </div>

                <div className="product-info">
                  <span className="product-category">
                    {product.category}
                  </span>

                  <h3>{product.name}</h3>

                  <div className="prices">
                    <strong>{formatPrice(product.price)}</strong>
                    <del>{formatPrice(product.originalPrice)}</del>
                  </div>

                  <div className="inventory">
                    <div className="inventory-label">
                      <span>Inventory remaining</span>
                      <strong>{product.stock}</strong>
                    </div>

                    <div
                      className="progress-track"
                      role="progressbar"
                      aria-label={`Stock sold for ${product.name}`}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={Math.round(soldPercent)}
                    >
                      <div
                        className="progress-fill"
                        style={{ width: `${soldPercent}%` }}
                      />
                    </div>

                    <span className="sold-label">
                      {Math.round(soldPercent)}% sold
                    </span>
                  </div>

                  <button
                    type="button"
                    className="buy-button"
                    disabled={product.stock === 0}
                    onClick={() => handleReserve(product)}
                  >
                    {product.stock === 0
                      ? 'Sold Out'
                      : 'Reserve Now →'}
                  </button>
                </div>
              </article>
            )
          })}
        </div>

        {filteredProducts.length === 0 && (
          <p className="empty-state">
            No products match your search.
          </p>
        )}
      </section>

      <section className="engine-panel">
        <div>
          <span className="section-eyebrow">
            SYSTEM ARCHITECTURE
          </span>
          <h2>High-Concurrency Engine</h2>
          <p>
            Powered by a precision countdown and an
            inventory reservation state machine.
          </p>
        </div>

        <div className="engine-features">
          <span>⚡ Precision Timer</span>
          <span>🔒 Inventory Reservation</span>
          <span>🛒 Checkout Simulation</span>
        </div>
      </section>

      <p className="notification" role="status">
        {notice}
      </p>

      <footer className="footer">
        <span>FLASHZONE © 2026</span>
        <span>React · TypeScript · State Machine</span>
      </footer>
    </main>
  )
}

export default App
