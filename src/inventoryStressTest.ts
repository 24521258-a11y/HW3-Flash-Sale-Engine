
import {
  createInitialState,
  inventoryReducer,
} from './inventoryMachine'

export type StressTestResult = {
  passed: boolean
  requested: number
  accepted: number
  rejected: number
  initialStock: number
  finalStock: number
  message: string
}

export function runInventoryStressTest(
  productId = 4,
  requested = 100
): StressTestResult {
  let state = createInitialState()
  const product = state.products.find(p => p.id === productId)

  if (!product) {
    return {
      passed: false,
      requested,
      accepted: 0,
      rejected: requested,
      initialStock: 0,
      finalStock: 0,
      message: 'Product not found',
    }
  }

  const initialStock = product.stock
  const now = Date.now()

  for (let i = 0; i < requested; i++) {
    state = inventoryReducer(state, {
      type: 'RESERVE',
      productId,
      reservationId: `stress-${i}`,
      now,
    })
  }

  const accepted = state.reservations.filter(
    reservation =>
      reservation.productId === productId &&
      reservation.status === 'reserved'
  ).length

  const finalStock =
    state.products.find(p => p.id === productId)?.stock ?? -1

  const rejected = requested - accepted

  const passed =
    accepted === Math.min(requested, initialStock) &&
    rejected === Math.max(0, requested - initialStock) &&
    finalStock === Math.max(0, initialStock - requested) &&
    finalStock >= 0

  return {
    passed,
    requested,
    accepted,
    rejected,
    initialStock,
    finalStock,
    message: passed
      ? 'PASS: No overselling detected in reducer simulation.'
      : 'FAIL: Inventory consistency check failed.',
  }
}
