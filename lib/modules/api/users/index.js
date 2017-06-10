const validationPayload = require('../validations')

const register = (server, options, next) => {
  server.route([
    // Get current user
    {
      method: 'GET',
      path: '/user',
      handler: (request, reply) => {
        return reply(constructUserResponse(request.auth.credentials.user))
      }
    },
    // Update user
    {
      method: 'PUT',
      path: '/user',
      handler: (request, reply) => {
        const {error, value} = validationPayload.updatePayload.validate(request.payload, {abortEarly: false})

        if (error != null) {
          return reply(validationPayload.constructErrorResponse(error)).code(422)
        }

        let credentials = request.auth.credentials

        server.app.db.User.findOne({username: credentials.user.username}, (err, user) => {
          if (err) return reply(validationPayload.constructErrorResponse(err)).code(422)
          if (!user) {
            return reply({
              errors: {
                username: [`User with username "${credentials.user.username}" not found`]
              }
            }).code(422)
          }

          if (credentials.user.username !== value.user.username) {
            user.username = value.user.username
          }

          if (credentials.user.email !== value.user.email) {
            user.email = value.user.email
          }

          user.bio = value.user.bio
          user.image = value.user.image

          if (value.user.password !== '') {
            user.setPassword(value.user.password)
          }

          user.save((err, updatedUser) => {
            if (err) return reply(validationPayload.constructErrorResponse(err)).code(422)
            return reply(constructUserResponse(updatedUser))
          })
        })
      }
    },
    // Register
    {
      method: 'POST',
      path: '/users',
      config: { auth: false },
      handler: (request, reply) => {
        const {error, value} = validationPayload.registerPayload.validate(request.payload, {abortEarly: false})

        if (error != null) {
          return reply(validationPayload.constructErrorResponse(error)).code(422)
        }

        let user = new server.app.db.User()

        user.email = value.user.email
        user.username = value.user.username
        user.setPassword(value.user.password)

        user.save((err, user) => {
          // TODO: Better error response
          if (err) return reply(validationPayload.constructErrorResponse(err)).code(422)
          if (!user) return reply().code(422)

          return reply(constructUserResponse(user))
        })
      }
    },
    // Login
    {
      method: 'POST',
      path: '/users/login',
      config: { auth: false },
      handler: (request, reply) => {
        const { error, value } = validationPayload.loginPayload.validate(request.payload, {abortEarly: false})

        if (error != null) {
          return reply(validationPayload.constructErrorResponse(error)).code(422)
        }

        server.app.db.User.findOne({
          email: value.user.email
        }, (err, user) => {
          if (err) return reply(validationPayload.constructErrorResponse(err)).code(422)

          if (!user) return reply().code(422)

          if (!user.validPassword(value.user.password)) {
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
