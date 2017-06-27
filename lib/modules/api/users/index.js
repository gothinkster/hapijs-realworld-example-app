const inputValidations = require('./validations/input')
const outputValidations = require('./validations/output')
const replyHelper = require('../helpers')

const register = (server, options, next) => {
  server.route([
    // Get current user
    {
      method: 'GET',
      path: '/user',
      config: {
        auth: 'jwt',
        response: outputValidations.AuthOutputValidationConfig
      },
      handler: (request, reply) => {
        return reply(constructUserResponse(request.auth.credentials.user))
      }
    },
    // Update user
    {
      method: 'PUT',
      path: '/user',
      config: {
        auth: 'jwt',
        validate: inputValidations.UpdatePayload,
        response: outputValidations.AuthOutputValidationConfig
      },
      handler: (request, reply) => {
        let payload = request.payload
        let user = request.auth.credentials.user

        server.methods.services.users.update(user, payload, (err, updatedUser) => {
          if (err) return reply(replyHelper.constructErrorResponse(err)).code(422)
          return reply(constructUserResponse(updatedUser))
        })
      }
    },
    // Register
    {
      method: 'POST',
      path: '/users',
      config: {
        validate: inputValidations.RegisterPayload,
        response: outputValidations.AuthOutputValidationConfig
      },
      handler: (request, reply) => {
        let payload = request.payload

        server.methods.services.users.create(payload, (err, user) => {
          // TODO: Better error response
          if (err) return reply(replyHelper.constructErrorResponse(err)).code(422)
          if (!user) return reply().code(422)

          return reply(constructUserResponse(user))
        })
      }
    },
    // Login
    {
      method: 'POST',
      path: '/users/login',
      config: {
        validate: inputValidations.LoginPayload,
        response: outputValidations.AuthOutputValidationConfig
      },
      handler: (request, reply) => {
        let payload = request.payload

        server.methods.services.users.getByEmail(payload.user.email, (err, user) => {
          if (err) return reply(replyHelper.constructErrorResponse(err)).code(422)

          if (!user) return reply().code(422)

          if (!user.validPassword(payload.user.password)) {
            return reply({
              errors: {
                'email or password': ['email or password missmatch !']
              }}).code(401)
          }

          return reply(constructUserResponse(user))
        })
      }
    }
  ])

  function constructUserResponse (user) {
    let authUser = { user: user.toAuthJSON() }
    authUser.user.bio = user.bio || null
    authUser.user.image = user.image || null
    return authUser
  }
  next()
}

register.attributes = {
  pkg: require('./package.json')
}

module.exports = register
