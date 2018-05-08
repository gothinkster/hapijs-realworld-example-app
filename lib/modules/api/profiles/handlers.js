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
     * @param {*} h
     */
    getProfile (request, h) {
      var username = request.params.username
      server.methods.services.users.getByUsername(username, (err, user) => {
        if (err) return h.response(replyHelper.constructErrorResponse(err)).code(422)

        if (!user) {
          return h.response({
            errors: {
              404: [`User with username "${username} not found !"`]
            }
          }).code(422)
        }

        if (request.auth.isAuthenticated) {
          return constructProfileResponse(user, request.auth.credentials.user)
        }

        return constructProfileResponse(user)
      })
    },
    /**
     * POST /api/profiles/{username}/follow
     * @param {*} request
     * @param {*} h
     */
    followProfile (request, h) {
      let username = request.params.username
      let currentUser = request.auth.credentials.user

      server.methods.services.users.getByUsername(username, (err, userToFollow) => {
        if (err) return h.response(replyHelper.constructErrorResponse(err)).code(422)

        if (!userToFollow) {
          return h.response({
            errors: {
              404: [`User with username "${username} not found !"`]
            }
          }).code(404)
        }

        server.methods.services.users.follow(currentUser, userToFollow._id, (err, me) => {
          if (err) return h.response(replyHelper.constructErrorResponse(err)).code(422)
          return constructProfileResponse(userToFollow, me)
        })
      })
    },
    /**
     * DELETE /api/profiles/{username}/follow
     * @param {*} request
     * @param {*} h
     */
    unfollowProfile (request, h) {
      let username = request.params.username
      let currentUser = request.auth.credentials.user

      server.methods.services.users.getByUsername(username, (err, userToFollow) => {
        if (err) return h.response(replyHelper.constructErrorResponse(err)).code(422)

        if (!userToFollow) {
          return h.response({
            errors: {
              404: [`User with username "${username} not found !"`]
            }
          }).code(404)
        }

        server.methods.services.users.unfollow(currentUser, userToFollow._id, (err, me) => {
          if (err) return h.response(replyHelper.constructErrorResponse(err)).code(422)
          return constructProfileResponse(userToFollow, me)
        })
      })
    }
  }
}
