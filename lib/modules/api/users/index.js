const validations = require('../validations')

const register = (server, options, next) => {
  server.route([
    // Get current user
    {
      method: 'GET',
      path: '/user',
      config: {
        auth: 'jwt',
        response: validations.AuthOutputValidationConfig
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
        validate: validations.UpdatePayload,
        response: validations.AuthOutputValidationConfig
      },
      handler: (request, reply) => {
        let payload = request.payload
        let credentials = request.auth.credentials

        server.app.db.User.findOne({username: credentials.user.username}, (err, user) => {
          if (err) return reply(validations.constructErrorResponse(err)).code(422)
          if (!user) {
            return reply({
              errors: {
                username: [`User with username "${credentials.user.username}" not found`]
              }
            }).code(422)
          }

          if (credentials.user.username !== payload.user.username) {
            user.username = payload.user.username
          }

          if (credentials.user.email !== payload.user.email) {
            user.email = payload.user.email
          }

          user.bio = payload.user.bio
          user.image = payload.user.image

          if (payload.user.password !== '') {
            user.setPassword(payload.user.password)
          }

          user.save((err, updatedUser) => {
            if (err) return reply(validations.constructErrorResponse(err)).code(422)
            return reply(constructUserResponse(updatedUser))
          })
        })
      }
    },
    // Register
    {
      method: 'POST',
      path: '/users',
      config: {
        validate: validations.RegisterPayload,
        response: validations.AuthOutputValidationConfig
      },
      handler: (request, reply) => {
        let payload = request.payload
        let user = new server.app.db.User()

        user.email = payload.user.email
        user.username = payload.user.username
        user.setPassword(payload.user.password)

        user.save((err, user) => {
          // TODO: Better error response
          if (err) return reply(validations.constructErrorResponse(err)).code(422)
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
        validate: validations.LoginPayload,
        response: validations.AuthOutputValidationConfig
      },
      handler: (request, reply) => {
        let payload = request.payload

        server.app.db.User.findOne({
          email: payload.user.email
        }, (err, user) => {
          if (err) return reply(validations.constructErrorResponse(err)).code(422)

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
