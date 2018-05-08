// const hapiJWT = require('hapi-auth-jwt2')
const config = require('../../config')
const mongoose = require('mongoose')

const register = async (server, options) => {
  var validate = async function (decoded, request) {
    var id = mongoose.Types.ObjectId(decoded.id)

    try {
      const user = await server.app.db.User.findById(id);

      if (!user) {
        return { isValid: false }
      }

      return { isValid: true }
    }
    catch (err) {
      return { isValid: false }
    }
  }

  server.auth.strategy('jwt', 'jwt', {
    key: config.auth.secret,
    validate: validate,
    tokenType: config.auth.tokenType,
    verifyOptions: config.auth.verifyOptions
  })
}

const plugin = {
  register,
  pkg: require('./package.json')
}

module.exports = plugin
