
import { runInventoryUnitTests } from './inventoryUnitTests'

const button = document.querySelector<HTMLButtonElement>(
  '#run-unit-tests'
)

const output = document.querySelector<HTMLElement>(
  '#unit-test-results'
)

if (!button || !output) {
  throw new Error('Unit test page elements not found')
}

button.addEventListener('click', () => {
  const tests = runInventoryUnitTests()
  const passed = tests.filter(test => test.passed).length

  const heading = document.createElement('h2')
  heading.textContent = `${passed}/${tests.length} tests passed`

  const table = document.createElement('table')
  const header = document.createElement('thead')
  const headerRow = document.createElement('tr')

  for (const text of ['Test', 'Result', 'Expected', 'Actual']) {
    const th = document.createElement('th')
    th.scope = 'col'
    th.textContent = text
    headerRow.append(th)
  }

  header.append(headerRow)

  const body = document.createElement('tbody')

  for (const result of tests) {
    const row = document.createElement('tr')

    const values = [
      result.name,
      result.passed ? 'PASS' : 'FAIL',
      result.expected,
      result.actual,
    ]

    for (const value of values) {
      const td = document.createElement('td')
      td.textContent = value
      row.append(td)
    }

    body.append(row)
  }

  table.append(header, body)
  output?.replaceChildren(heading, table)
})
