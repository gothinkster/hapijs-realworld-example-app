'user strict'

require('dotenv').config({path: process.cwd() + '/.secret'})

const Glue = require('glue')
const Labbable = require('labbable')

const labbable = module.exports = new Labbable()
const manifest = require('./config/manifest')

var options = {
  relativeTo: process.cwd() + '/lib/modules'
}

Glue.compose(manifest, options, (err, server) => {
  if (err) {
    throw err
  }

  // Step 2.
  // Show the server to our instance of labbable
  if (process.env.NODE_ENV === 'test') {
    labbable.using(server)
  }

  // Step 3.
  // Initialize your server
  server.initialize((err) => {
    if (err) {
      throw err
    }

    // Don't continue to start server if module
    // is being require()'d (likely in a test)
    if (process.env.NODE_ENV === 'test') {
      if (module.parent) {
        return
      }
    }

    server.start((err) => {
      if (err) {
        throw err
      }

      console.log('Server started')
    })
  })
})
