'use strict'

const internals = {
  coverage: true,
  threshold: 90,
  colors: true,
  timeout: 10000,
  verbose: true,
  globals: 'Reflect,core,_babelPolyfill,regeneratorRuntime,__core-js_shared__'
}

internals.reporters = new Map([
  ['lcov', 'coverage/lcov.info'],
  ['console', 'stdout'],
  ['html', 'coverage/cov.html']
])

internals.reporter = Array.from(internals.reporters.keys())
internals.output = Array.from(internals.reporters.values())

module.exports = internals
