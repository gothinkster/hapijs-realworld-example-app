const validations = require('../validations')

const register = (server, options, next) => {
  // server.dependency('auth')
  server.route([
    // Get /profiles/{username}
    {
      method: 'GET',
      path: '/profiles/{username}',
      config: {
        auth: {mode: 'optional', strategy: 'jwt'},
        response: validations.ProfileOutputValidationConfig,
        validate: validations.ProfileParamsValidation
      },
      handler: (request, reply) => {
        var username = request.params.username
        server.app.db.User.findOne({username}, (err, user) => {
          if (err) return reply(validations.constructErrorResponse(err)).code(422)

          if (!user) {
            return reply({
              errors: {
                username: [`User with username "${username} not found !"`]
              }
            }).code(422)
          }

          if (request.auth.isAuthenticated) {
            return reply(constructProfileResponse(user, request.auth.credentials.user))
          }

          return reply(constructProfileResponse(user))
        })
      }
    },
    // Follow profile
    {
      method: ['POST', 'DELETE'],
      path: '/profiles/{username}/follow',
      config: {
        auth: 'jwt',
        response: validations.ProfileOutputValidationConfig,
        validate: validations.ProfileParamsValidation
      },
      handler: (request, reply) => {
        let username = request.params.username
        server.app.db.User.findOne({username}, (err, userToFollow) => {
          if (err) return reply(validations.constructErrorResponse(err)).code(422)

          if (!userToFollow) {
            return reply({
              errors: {
                'username': [`User with username "${username} not found !"`]
              }
            }).code(404)
          }

          switch (request.method) {
            case 'post':
              request.auth.credentials.user.follow(userToFollow._id).then((me) => {
                return reply(constructProfileResponse(userToFollow, me))
              })
              break
            case 'delete':
              request.auth.credentials.user.unfollow(userToFollow._id).then((me) => {
                return reply(constructProfileResponse(userToFollow, me))
              })
              break
          }
        })
      }
    }
  ])

  function constructProfileResponse (user, authenticatedUser = null) {
    let profile = { user: user.toProfileJSONFor(authenticatedUser) }
    // console.log('profile: ', profile)
    return profile
  }

  return next()
}

register.attributes = {
  pkg: require('./package.json')
}

module.exports = register
