
export type Product = {
  id: number
  name: string
  category: string
  price: number
  originalPrice: number
  stock: number
  totalStock: number
  emoji: string
}

export type ReservationStatus =
  | 'reserved'
  | 'checked_out'
  | 'cancelled'
  | 'expired'

export type Reservation = {
  id: string
  productId: number
  productName: string
  status: ReservationStatus
  createdAt: number
  expiresAt: number
}

export type InventoryState = {
  products: Product[]
  reservations: Reservation[]
  saleActive: boolean
  message: string
}

export type InventoryAction =
  | {
      type: 'RESERVE'
      productId: number
      reservationId: string
      now: number
    }
  | { type: 'CHECKOUT'; reservationId: string; now: number }
  | { type: 'CANCEL'; reservationId: string; now: number }
  | { type: 'TICK'; now: number }
  | { type: 'END_SALE'; now: number }
  | { type: 'RESET' }

export const RESERVATION_DURATION_MS = 30_000

export const initialProducts: Product[] = [
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

export function createInitialState(): InventoryState {
  return {
    products: initialProducts.map(product => ({ ...product })),
    reservations: [],
    saleActive: true,
    message: 'Flash Sale demo is ready.',
  }
}

function updateStock(
  products: Product[],
  productId: number,
  change: number
): Product[] {
  return products.map(product => {
    if (product.id !== productId) return product

    return {
      ...product,
      stock: product.stock + change,
    }
  })
}

function expireReservations(
  state: InventoryState,
  now: number
): InventoryState {
  let products = state.products
  let expiredCount = 0

  const reservations = state.reservations.map(reservation => {
    if (
      reservation.status !== 'reserved' ||
      reservation.expiresAt > now
    ) {
      return reservation
    }

    products = updateStock(products, reservation.productId, 1)
    expiredCount++

    return {
      ...reservation,
      status: 'expired' as const,
    }
  })

  if (expiredCount === 0) return state

  return {
    ...state,
    products,
    reservations,
    message: `${expiredCount} reservation(s) expired. Stock restored.`,
  }
}

export function inventoryReducer(
  state: InventoryState,
  action: InventoryAction
): InventoryState {
  if (action.type === 'RESET') {
    return createInitialState()
  }

  // Before any inventory operation, release expired stock.
  const current = expireReservations(state, action.now)

  switch (action.type) {
    case 'TICK':
      return current

    case 'RESERVE': {
      if (!current.saleActive) {
        return {
          ...current,
          message: 'Sale ended. Reservations are closed.',
        }
      }

      const product = current.products.find(
        item => item.id === action.productId
      )

      if (!product || product.stock <= 0) {
        return {
          ...current,
          message: 'Sold out! No stock available.',
        }
      }

      const reservation: Reservation = {
        id: action.reservationId,
        productId: product.id,
        productName: product.name,
        status: 'reserved',
        createdAt: action.now,
        expiresAt: action.now + RESERVATION_DURATION_MS,
      }

      return {
        ...current,
        products: updateStock(current.products, product.id, -1),
        reservations: [reservation, ...current.reservations],
        message: `Reserved ${product.name} for 30 seconds.`,
      }
    }

    case 'CHECKOUT': {
      const reservation = current.reservations.find(
        item => item.id === action.reservationId
      )

      if (
        !reservation ||
        reservation.status !== 'reserved' ||
        !current.saleActive
      ) {
        return {
          ...current,
          message: 'Checkout unavailable for this reservation.',
        }
      }

      return {
        ...current,
        reservations: current.reservations.map(item =>
          item.id === reservation.id
            ? { ...item, status: 'checked_out' as const }
            : item
        ),
        message: `Checkout successful: ${reservation.productName}.`,
      }
    }

    case 'CANCEL': {
      const reservation = current.reservations.find(
        item => item.id === action.reservationId
      )

      if (!reservation || reservation.status !== 'reserved') {
        return current
      }

      return {
        ...current,
        products: updateStock(
          current.products,
          reservation.productId,
          1
        ),
        reservations: current.reservations.map(item =>
          item.id === reservation.id
            ? { ...item, status: 'cancelled' as const }
            : item
        ),
        message: `Cancelled ${reservation.productName}. Stock restored.`,
      }
    }

    case 'END_SALE': {
      let products = current.products

      const reservations = current.reservations.map(item => {
        if (item.status !== 'reserved') return item

        products = updateStock(products, item.productId, 1)

        return {
          ...item,
          status: 'expired' as const,
        }
      })

      return {
        ...current,
        saleActive: false,
        products,
        reservations,
        message: 'Flash Sale ended. Pending reservations released.',
      }
    }
  }
}
