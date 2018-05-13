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
    async getProfile (request, h) {
      var username = request.params.username

      try {
        const user = await server.methods.services.users.getByUsername(username)

        if (!user) {
          return h.response({
            errors: {
              404: [`User with username "${username} not found !"`]
            }
          }).code(422)
        }

        if (request.auth.isAuthenticated) {
          return h.response(constructProfileResponse(user, request.auth.credentials.user))
        }

        return h.response(constructProfileResponse(user))
      } catch (err) {
        return h.response(replyHelper.constructErrorResponse(err)).code(422)
      }
    },
    /**
     * POST /api/profiles/{username}/follow
     * @param {*} request
     * @param {*} h
     */
    async followProfile (request, h) {
      let username = request.params.username
      let currentUser = request.auth.credentials.user

      try {
        const userToFollow = await server.methods.services.users.getByUsername(username)

        if (!userToFollow) {
          return h.response({
            errors: {
              404: [`User with username "${username} not found !"`]
            }
          }).code(404)
        }

        const me = await server.methods.services.users.follow(currentUser, userToFollow._id)
        return h.response(constructProfileResponse(userToFollow, me))
      } catch (err) {
        return h.response(replyHelper.constructErrorResponse(err)).code(422)
      }
    },
    /**
     * DELETE /api/profiles/{username}/follow
     * @param {*} request
     * @param {*} h
     */
    async unfollowProfile (request, h) {
      let username = request.params.username
      let currentUser = request.auth.credentials.user

      try {
        const userToFollow = await server.methods.services.users.getByUsername(username)

        if (!userToFollow) {
          return h.response({
            errors: {
              404: [`User with username "${username} not found !"`]
            }
          }).code(404)
        }

        const me = await server.methods.services.users.unfollow(currentUser, userToFollow._id)
        return h.response(constructProfileResponse(userToFollow, me))
      } catch (err) {
        return h.response(replyHelper.constructErrorResponse(err)).code(422)
      }
    }
  }
}
