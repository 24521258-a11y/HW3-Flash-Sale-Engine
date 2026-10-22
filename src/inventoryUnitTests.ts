
import {
  createInitialState,
  inventoryReducer,
  RESERVATION_DURATION_MS,
} from './inventoryMachine'
import type { InventoryState } from './inventoryMachine'

export type TestResult = {
  name: string
  passed: boolean
  expected: string
  actual: string
}

const BASE_TIME = 1_800_000_000_000
const PRODUCT_ID = 4

function getStock(state: InventoryState): number {
  return state.products.find(
    product => product.id === PRODUCT_ID
  )?.stock ?? -1
}

function reserve(
  state: InventoryState,
  id: string,
  now = BASE_TIME
): InventoryState {
  return inventoryReducer(state, {
    type: 'RESERVE',
    productId: PRODUCT_ID,
    reservationId: id,
    now,
  })
}

function test(
  name: string,
  condition: boolean,
  expected: string,
  actual: unknown
): TestResult {
  return {
    name,
    passed: condition,
    expected,
    actual: String(actual),
  }
}

export function runInventoryUnitTests(): TestResult[] {
  const results: TestResult[] = []

  // TEST 1: Reserve decreases stock.
  const original = createInitialState()
  const reserved = reserve(original, 'unit-1')

  results.push(test(
    'Reserve decreases available stock',
    getStock(reserved) === 4 &&
      reserved.reservations.length === 1,
    'Stock = 4, reservations = 1',
    `Stock = ${getStock(reserved)}, reservations = ${reserved.reservations.length}`
  ))

  // TEST 2: Cannot reserve beyond available stock.
  let exhausted = createInitialState()

  for (let i = 0; i < 100; i++) {
    exhausted = reserve(exhausted, `bulk-${i}`)
  }

  const accepted = exhausted.reservations.filter(
    item => item.status === 'reserved'
  ).length

  results.push(test(
    'Prevent overselling with 100 requests',
    getStock(exhausted) === 0 && accepted === 5,
    'Stock = 0, accepted = 5',
    `Stock = ${getStock(exhausted)}, accepted = ${accepted}`
  ))

  // TEST 3: Cancel restores exactly one unit.
  const cancelled = inventoryReducer(reserved, {
    type: 'CANCEL',
    reservationId: 'unit-1',
    now: BASE_TIME + 1000,
  })

  results.push(test(
    'Cancel restores inventory',
    getStock(cancelled) === 5 &&
      cancelled.reservations[0]?.status === 'cancelled',
    'Stock = 5, status = cancelled',
    `Stock = ${getStock(cancelled)}, status = ${cancelled.reservations[0]?.status}`
  ))

  // TEST 4: Checkout does not restore stock.
  const checkedOut = inventoryReducer(reserved, {
    type: 'CHECKOUT',
    reservationId: 'unit-1',
    now: BASE_TIME + 1000,
  })

  results.push(test(
    'Checkout preserves committed stock',
    getStock(checkedOut) === 4 &&
      checkedOut.reservations[0]?.status === 'checked_out',
    'Stock = 4, status = checked_out',
    `Stock = ${getStock(checkedOut)}, status = ${checkedOut.reservations[0]?.status}`
  ))

  // TEST 5: Expired reservation restores stock.
  const expired = inventoryReducer(reserved, {
    type: 'TICK',
    now: BASE_TIME + RESERVATION_DURATION_MS + 1,
  })

  results.push(test(
    'Reservation expiry restores stock',
    getStock(expired) === 5 &&
      expired.reservations[0]?.status === 'expired',
    'Stock = 5, status = expired',
    `Stock = ${getStock(expired)}, status = ${expired.reservations[0]?.status}`
  ))

  // TEST 6: Checkout after expiry must fail.
  const lateCheckout = inventoryReducer(reserved, {
    type: 'CHECKOUT',
    reservationId: 'unit-1',
    now: BASE_TIME + RESERVATION_DURATION_MS + 1,
  })

  results.push(test(
    'Reject checkout after expiration',
    getStock(lateCheckout) === 5 &&
      lateCheckout.reservations[0]?.status === 'expired',
    'Stock = 5, status = expired',
    `Stock = ${getStock(lateCheckout)}, status = ${lateCheckout.reservations[0]?.status}`
  ))

  // TEST 7: Sale expiry releases pending holds.
  const ended = inventoryReducer(reserved, {
    type: 'END_SALE',
    now: BASE_TIME + 1000,
  })

  results.push(test(
    'Ending sale releases pending reservations',
    !ended.saleActive &&
      getStock(ended) === 5 &&
      ended.reservations[0]?.status === 'expired',
    'Sale inactive, stock = 5, status = expired',
    `Active = ${ended.saleActive}, stock = ${getStock(ended)}, status = ${ended.reservations[0]?.status}`
  ))

  // TEST 8: Reset restores initial inventory.
  const reset = inventoryReducer(exhausted, {
    type: 'RESET',
  })

  results.push(test(
    'Reset restores initial state',
    getStock(reset) === 5 &&
      reset.reservations.length === 0 &&
      reset.saleActive,
    'Stock = 5, reservations = 0, sale active',
    `Stock = ${getStock(reset)}, reservations = ${reset.reservations.length}, active = ${reset.saleActive}`
  ))

  // TEST 9: Cancelling twice must not duplicate stock.
  const cancelledTwice = inventoryReducer(cancelled, {
    type: 'CANCEL',
    reservationId: 'unit-1',
    now: BASE_TIME + 2000,
  })

  results.push(test(
    'Prevent double inventory restoration',
    getStock(cancelledTwice) === 5,
    'Stock = 5',
    `Stock = ${getStock(cancelledTwice)}`
  ))

  return results
}
