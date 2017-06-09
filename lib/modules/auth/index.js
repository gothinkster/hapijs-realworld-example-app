const hapiJWT = require('hapi-auth-jwt2')
const config = require('../../config')

const register = function register (server, options, next) {
  server.register(hapiJWT)

  const validateFunc = (decoded, request, callback) => {
    server.app.db.User.findOne(decoded.id, (err, user) => {
      if (err) callback(err, false)

      if (!user) {
        callback(Error('user not found !'), false)
      }

      callback(null, true, {
        user
      })
    })
  }

  server.auth.strategy('jwt', 'jwt', {
    key: config.auth.secret,
    validateFunc: validateFunc,
    tokenType: config.auth.tokenType,
    verifyOptions: config.auth.verifyOptions
  })

  server.auth.default('jwt')

  next()
}

register.attributes = {
  pkg: require('./package.json')
}

module.exports = register
