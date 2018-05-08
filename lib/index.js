'user strict'

require('dotenv').config({ path: process.cwd() + '/.secret' })

const Glue = require('glue')
const Labbable = require('labbable')

const labbable = module.exports = new Labbable()
const manifest = require('./config/manifest')

var options = {
  relativeTo: process.cwd() + '/lib/modules'
}

const startServer = async function () {
  try {
    const server = await Glue.compose(manifest, options)

    // Step 2.
    // Show the server to our instance of labbable
    if (process.env.NODE_ENV === 'test') {
      labbable.using(server)
    }

    // Step 3.
    // Initialize your server
    await server.initialize()

    // Don't continue to start server if module
    // is being require()'d (likely in a test)
    if (process.env.NODE_ENV === 'test') {
      if (module.parent) {
        return
      }
    }

    await server.start()
    console.log('Server started')
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

startServer()
