const inputValidations = require('./validations/input')
const outputValidations = require('./validations/output')
const replyHelper = require('../helpers')

const register = (server, options, next) => {
  // server.dependency('auth')
  server.route([
    // Get /profiles/{username}
    {
      method: 'GET',
      path: '/profiles/{username}',
      config: {
        auth: {mode: 'optional', strategy: 'jwt'},
        response: outputValidations.ProfileOutputValidationConfig,
        validate: inputValidations.ProfileParamsValidation
      },
      handler: (request, reply) => {
        var username = request.params.username
        server.methods.services.users.getByUsername(username, (err, user) => {
          if (err) return reply(replyHelper.constructErrorResponse(err)).code(422)

          if (!user) {
            return reply({
              errors: {
                404: [`User with username "${username} not found !"`]
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
        response: outputValidations.ProfileOutputValidationConfig,
        validate: inputValidations.ProfileParamsValidation
      },
      handler: (request, reply) => {
        let username = request.params.username
        let currentUser = request.auth.credentials.user
        var action = server.methods.services.users.follow

        if (request.method === 'delete') {
          action = server.methods.services.users.unfollow
        }

        server.methods.services.users.getByUsername(username, (err, userToFollow) => {
          if (err) return reply(replyHelper.constructErrorResponse(err)).code(422)

          if (!userToFollow) {
            return reply({
              errors: {
                404: [`User with username "${username} not found !"`]
              }
            }).code(404)
          }

          action(currentUser, userToFollow._id, (err, me) => {
            if (err) return reply(replyHelper.constructErrorResponse(err)).code(422)
            return reply(constructProfileResponse(userToFollow, me))
          })
        })
      }
    }
  ])

  function constructProfileResponse (user, authenticatedUser = null) {
    let profile = { user: user.toProfileJSONFor(authenticatedUser) }
    return profile
  }

  return next()
}

register.attributes = {
  pkg: require('./package.json')
}

module.exports = register
