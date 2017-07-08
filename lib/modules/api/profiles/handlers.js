module.exports = (server) => {
  const replyHelper = require('../helpers')

  function constructProfileResponse (user, authenticatedUser = null) {
    let profile = { user: user.toProfileJSONFor(authenticatedUser) }
    return profile
  }

  return {
    /**
     * GET /api/profiles/{username}
     * @param {*} request
     * @param {*} reply
     */
    getProfile (request, reply) {
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
    },
    /**
     * POST /api/profiles/{username}/follow
     * @param {*} request
     * @param {*} reply
     */
    followProfile (request, reply) {
      let username = request.params.username
      let currentUser = request.auth.credentials.user

      server.methods.services.users.getByUsername(username, (err, userToFollow) => {
        if (err) return reply(replyHelper.constructErrorResponse(err)).code(422)

        if (!userToFollow) {
          return reply({
            errors: {
              404: [`User with username "${username} not found !"`]
            }
          }).code(404)
        }

        server.methods.services.users.follow(currentUser, userToFollow._id, (err, me) => {
          if (err) return reply(replyHelper.constructErrorResponse(err)).code(422)
          return reply(constructProfileResponse(userToFollow, me))
        })
      })
    },
    /**
     * DELETE /api/profiles/{username}/follow
     * @param {*} request
     * @param {*} reply
     */
    unfollowProfile (request, reply) {
      let username = request.params.username
      let currentUser = request.auth.credentials.user

      server.methods.services.users.getByUsername(username, (err, userToFollow) => {
        if (err) return reply(replyHelper.constructErrorResponse(err)).code(422)

        if (!userToFollow) {
          return reply({
            errors: {
              404: [`User with username "${username} not found !"`]
            }
          }).code(404)
        }

        server.methods.services.users.unfollow(currentUser, userToFollow._id, (err, me) => {
          if (err) return reply(replyHelper.constructErrorResponse(err)).code(422)
          return reply(constructProfileResponse(userToFollow, me))
        })
      })
    }
  }
}
