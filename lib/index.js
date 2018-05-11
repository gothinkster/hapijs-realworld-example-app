'user strict'

require('dotenv').config({ path: process.cwd() + '/.secret' })

const Glue = require('glue')
const manifest = require('./config/manifest')

var options = {
  relativeTo: process.cwd() + '/lib/modules'
}

exports.deployment = async function () {
  try {
    const server = await Glue.compose(manifest, options)

    // Step 2.
    // Initialize your server
    await server.initialize()

    // Step 3.
    // Show the server to our instance of labbable
    if (process.env.NODE_ENV === 'test') {
      return server
    }

    await server.start()
    console.log('Server started')
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

if (module.parent) {
  exports.deployment().catch(console.error)
}
