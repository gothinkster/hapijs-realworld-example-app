const validationPayload = require('../validations')

const register = (server, options, next) => {
  // server.dependency('auth')
  server.route([
    // Get /profiles/{username}
    {
      method: 'GET',
      path: '/profiles/{username}',
      config: {auth: {mode: 'optional', strategy: 'jwt'}},
      handler: (request, reply) => {
        var username = request.params.username
        server.app.db.User.findOne({username}, (err, user) => {
          if (err) return reply(validationPayload.constructErrorResponse(err)).code(422)

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
      method: 'POST',
      path: '/profiles/{username}/follow',
      config: {auth: 'jwt'},
      handler: (request, reply) => {
        let username = request.params.username
        server.app.db.User.findOne({username}, (err, userToFollow) => {
          if (err) return reply(validationPayload.constructErrorResponse(err)).code(422)

          if (!userToFollow) {
            return reply({
              errors: {
                'username': [`User with username "${username} not found !"`]
              }
            }).code(404)
          }

          request.auth.credentials.user.follow(userToFollow._id).then((me) => {
            return reply(constructProfileResponse(userToFollow, me))
          })
        })
      }
    },
    // UnFollow profile
    {
      method: 'DELETE',
      path: '/profiles/{username}/follow',
      config: { auth: 'jwt' },
      handler: (request, reply) => {
        let username = request.params.username
        server.app.db.User.findOne({ username }, (err, userToFollow) => {
          if (err) return reply(validationPayload.constructErrorResponse(err)).code(422)

          if (!userToFollow) {
            return reply({
              errors: {
                'username': [`User with username "${username} not found !"`]
              }
            }).code(404)
          }

          request.auth.credentials.user.unfollow(userToFollow._id).then((me) => {
            return reply(constructProfileResponse(userToFollow, me))
          })
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
