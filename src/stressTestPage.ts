
import { runInventoryStressTest } from './inventoryStressTest'

const button = document.querySelector<HTMLButtonElement>('#run-test')
const result = document.querySelector<HTMLElement>('#test-result')

if (!button || !result) {
  throw new Error('Stress test interface not found')
}

const runButton = button
const resultElement = result

runButton.addEventListener('click', () => {
  const test = runInventoryStressTest(4, 100)

  resultElement.replaceChildren()

  const heading = document.createElement('h2')
  heading.textContent = test.passed
    ? 'PASS - Inventory consistency verified'
    : 'FAIL - Inventory consistency error'

  const details = [
    ['Requested', test.requested],
    ['Initial Stock', test.initialStock],
    ['Accepted', test.accepted],
    ['Rejected', test.rejected],
    ['Final Stock', test.finalStock],
  ]

  const list = document.createElement('dl')

  for (const [label, value] of details) {
    const term = document.createElement('dt')
    term.textContent = String(label)

    const description = document.createElement('dd')
    description.textContent = String(value)

    list.append(term, description)
  }

  const message = document.createElement('p')
  message.textContent = test.message

  resultElement.append(heading, list, message)
  resultElement.className = test.passed ? 'pass' : 'fail'
})

