const config = require('../../config')
const mongoose = require('mongoose')

const register = async (server, options) => {
  const validate = async function (decoded, request, h) {
    const id = mongoose.Types.ObjectId(decoded.id)

    try {
      const user = await server.app.db.User.findById(id)

      if (!user) {
        return { isValid: false }
      }

      return { isValid: true, credentials: { user: user } }
    } catch (err) {
      return { isValid: false }
    }
  }

  server.auth.strategy('jwt', 'jwt', {
    key: config.auth.secret,
    validate: validate,
    verifyOptions: config.auth.verifyOptions
  })
}

const plugin = {
  register,
  pkg: require('./package.json')
}

module.exports = plugin
