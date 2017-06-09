'use strict'

const internals = {
  coverage: true,
  threshold: 80,
  colors: true,
  timeout: 2000,
  debug: true,
  verbose: true
}

internals.reporters = new Map([
  ['lcov', 'coverage/lcov.info'],
  ['console', 'stdout']
])

internals.reporter = Array.from(internals.reporters.keys())
internals.output = Array.from(internals.reporters.values())

module.exports = internals
