const loginPayload = require('../validations').loginPayload
const registerPayload = require('../validations').registerPayload

const register = (server, options, next) => {
  server.route([
    // Register
    {
      method: 'POST',
      path: '/users',
      config: { auth: false },
      handler: (request, reply) => {
        const {error, _} = registerPayload.validate(request.payload, {abortEarly: false})

        if (error != null) {
          const response = {
            errors: {}
          }

          error.details.forEach((error) => {
            response.errors[error.context.key] = [error.message]
          })

          return reply(response).code(422)
        }

        let user = new server.app.db.User()

        user.email = request.payload.user.email
        user.username = request.payload.user.username
        user.setPassword(request.payload.user.password)

        user.save((err, user) => {
          if (err) return reply(err).code(422)
          if (!user) return reply().code(422)
          return reply({user: user.toAuthJSON()})
        })
      }
    },
    // Login
    {
      method: 'POST',
      path: '/users/login',
      config: {
        auth: false
      },
      handler: (request, reply) => {
        const { error, _ } = loginPayload.validate(request.payload, {abortEarly: false})

        if (error != null) {
          const response = {
            errors: {}
          }

          error.details.forEach((error) => {
            response.errors[error.context.key] = [error.message]
          })

          return reply(response).code(422)
        }

        server.app.db.User.findOne({
          email: request.payload.user.email
        }, (err, user) => {
          if (err) return reply(err).code(422)

          if (!user) return reply().code(422)

          if (!user.validPassword(request.payload.user.password)) {
            return reply().code(401)
          }

          return reply({
            user: user.toAuthJSON()
          })
        })
      }
    }
  ])
  next()
}

register.attributes = {
  pkg: require('./package.json')
}

module.exports = register
