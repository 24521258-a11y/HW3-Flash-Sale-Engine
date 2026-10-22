import { useCallback, useEffect, useReducer, useRef, useState } from 'react'
import AntiDriftTimer from './components/AntiDriftTimer'
import {
  createInitialState,
  inventoryReducer,
} from './inventoryMachine'
import type { Product, ReservationStatus } from './inventoryMachine'
import './App.css'
import './Inventory.css'

const SALE_DURATION_MS = 15 * 60 * 1000

function formatPrice(price: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(price)
}

function formatSeconds(ms: number) {
  return `${Math.max(0, Math.ceil(ms / 1000))}s`
}

function App() {
  const [state, dispatch] = useReducer(
    inventoryReducer,
    undefined,
    createInitialState
  )

  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [saleRound, setSaleRound] = useState(1)
  const [now, setNow] = useState(() => Date.now())

  const reservationCounter = useRef(0)

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      const currentTime = Date.now()
      setNow(currentTime)
      dispatch({ type: 'TICK', now: currentTime })
    }, 250)

    return () => window.clearInterval(intervalId)
  }, [])

  const handleExpire = useCallback(() => {
    dispatch({ type: 'END_SALE', now: Date.now() })
  }, [])

  function restartSale() {
    dispatch({ type: 'RESET' })
    setNow(Date.now())
    setSaleRound(previous => previous + 1)
  }

  function reserveProduct(product: Product) {
    const currentTime = Date.now()
    reservationCounter.current += 1

    dispatch({
      type: 'RESERVE',
      productId: product.id,
      reservationId: `${currentTime}-${reservationCounter.current}`,
      now: currentTime,
    })
  }

  function checkout(reservationId: string) {
    dispatch({
      type: 'CHECKOUT',
      reservationId,
      now: Date.now(),
    })
  }

  function cancelReservation(reservationId: string) {
    dispatch({
      type: 'CANCEL',
      reservationId,
      now: Date.now(),
    })
  }

  const categories = [
    'All',
    ...new Set(state.products.map(product => product.category)),
  ]

  const filteredProducts = state.products.filter(product => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(search.trim().toLowerCase())

    const matchesCategory =
      category === 'All' || product.category === category

    return matchesSearch && matchesCategory
  })

  const activeReservations = state.reservations.filter(
    reservation => reservation.status === 'reserved'
  )

  const checkedOutCount = state.reservations.filter(
    reservation => reservation.status === 'checked_out'
  ).length

  const statusLabels: Record<ReservationStatus, string> = {
    reserved: 'RESERVED',
    checked_out: 'CHECKED OUT',
    cancelled: 'CANCELLED',
    expired: 'EXPIRED',
  }

  return (
    <main className="app">
      <header className="topbar">
        <div className="brand">
          <span className="brand-icon">⚡</span>
          <span>
            FLASH<span className="brand-highlight">ZONE</span>
          </span>
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
            Zero-drift timer powered by Date.now()
            and requestAnimationFrame.
          </p>
        </div>

        <AntiDriftTimer
          key={saleRound}
          durationMs={SALE_DURATION_MS}
          onExpire={handleExpire}
          onRestart={restartSale}
        />
      </section>

      <section className="inventory-stats" aria-label="Inventory statistics">
        <article className="inventory-stat">
          <span>Available Units</span>
          <strong>
            {state.products.reduce(
              (total, product) => total + product.stock,
              0
            )}
          </strong>
        </article>

        <article className="inventory-stat">
          <span>Active Reservations</span>
          <strong>{activeReservations.length}</strong>
        </article>

        <article className="inventory-stat">
          <span>Demo Checkouts</span>
          <strong>{checkedOutCount}</strong>
        </article>
      </section>

      <section id="products" className="products-section">
        <div className="section-heading">
          <div>
            <span className="section-eyebrow">
              EXCLUSIVE OFFERS
            </span>
            <h2>Today's Flash Deals</h2>
            <p>Limited stock — first come, first served.</p>
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
                      aria-label={`Unavailable stock for ${product.name}`}
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
                      {Math.round(soldPercent)}% unavailable
                    </span>
                  </div>

                  <button
                    type="button"
                    className="buy-button"
                    disabled={product.stock <= 0 || !state.saleActive}
                    onClick={() => reserveProduct(product)}
                  >
                    {!state.saleActive
                      ? 'Sale Ended'
                      : product.stock === 0
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

      <section className="reservations-panel" aria-labelledby="orders-title">
        <div className="reservations-heading">
          <div>
            <span className="section-eyebrow">
              INVENTORY STATE MACHINE
            </span>
            <h2 id="orders-title">Reservation Management</h2>
            <p>
              Reserve for 30 seconds. Checkout or cancel
              before the reservation expires.
            </p>
          </div>

          <span className="reservation-count">
            {activeReservations.length} Active
          </span>
        </div>

        {state.reservations.length === 0 ? (
          <p className="reservation-empty">
            No reservations yet. Choose a product and press Reserve Now.
          </p>
        ) : (
          <div className="reservation-table-wrap">
            <table className="reservation-table">
              <thead>
                <tr>
                  <th scope="col">Product</th>
                  <th scope="col">Status</th>
                  <th scope="col">Time Left</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>

              <tbody>
                {state.reservations.map(reservation => {
                  const active = reservation.status === 'reserved'
                  const remaining = Math.max(
                    0,
                    reservation.expiresAt - now
                  )

                  return (
                    <tr key={reservation.id}>
                      <td>{reservation.productName}</td>
                      <td>
                        <span
                          className={`reservation-status status-${reservation.status}`}
                        >
                          {statusLabels[reservation.status]}
                        </span>
                      </td>

                      <td>
                        {active
                          ? formatSeconds(remaining)
                          : '—'}
                      </td>

                      <td>
                        {active ? (
                          <div className="reservation-actions">
                            <button
                              type="button"
                              className="checkout-button"
                              onClick={() => checkout(reservation.id)}
                            >
                              Checkout
                            </button>

                            <button
                              type="button"
                              className="cancel-button"
                              onClick={() => cancelReservation(reservation.id)}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <span className="finished-label">
                            Completed action
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="engine-panel">
        <div>
          <span className="section-eyebrow">
            SYSTEM ARCHITECTURE
          </span>

          <h2>Inventory State Machine</h2>

          <p>
            Available → Reserved → Checked Out.
            Cancelled or expired reservations restore available stock.
          </p>
        </div>

        <div className="engine-features">
          <span>⚡ Precision Timer</span>
          <span>🔒 Inventory Reservation</span>
          <span>🛒 Checkout Simulation</span>
        </div>
      </section>

      <p className="notification" role="status">
        {state.message}
      </p>

      <footer className="footer">
        <span>FLASHZONE © 2026</span>
        <span>React · TypeScript · State Machine</span>
      </footer>
    </main>
  )
}

export default App
