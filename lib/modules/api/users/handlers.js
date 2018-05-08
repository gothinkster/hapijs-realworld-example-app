const replyHelper = require('../helpers')

module.exports = (server) => {
  function constructUserResponse (user) {
    let authUser = { user: user.toAuthJSON() }
    authUser.user.bio = user.bio || null
    authUser.user.image = user.image || null
    return authUser
  }

  return {
    /**
     * GET /api/user
     * @param {*} request
     * @param {*} h
     */
    getCurrentUser (request, h) {
      return constructUserResponse(request.auth.credentials.user)
    },
    updateUser (request, h) {
      let payload = request.payload
      let user = request.auth.credentials.user

      server.methods.services.users.update(user, payload, (err, updatedUser) => {
        if (err) return h.response(replyHelper.constructErrorResponse(err)).code(422)
        return constructUserResponse(updatedUser)
      })
    },
    /**
     * POST /api/users
     * @param {*} request
     * @param {*} h
     */
    registerUser (request, h) {
      let payload = request.payload

      server.methods.services.users.create(payload, (err, user) => {
        // TODO: Better error response
        if (err) return h.response(replyHelper.constructErrorResponse(err)).code(422)
        if (!user) return h.response().code(422)

        return constructUserResponse(user)
      })
    },
    /**
     * POST /api/users/login
     * @param {*} request
     * @param {*} h
     */
    loginUser (request, h) {
      let payload = request.payload

      server.methods.services.users.getByEmail(payload.user.email, (err, user) => {
        if (err) return h.response(replyHelper.constructErrorResponse(err)).code(422)

        if (!user) {
          return h.response({
            errors: {
              404: ['email/password is invalid !']
            }
          }).code(404)
        }

        if (!user.validPassword(payload.user.password)) {
          return h.response({
            errors: {
              'email or password': ['email or password missmatch !']
            }
          }).code(401)
        }

        return constructUserResponse(user)
      })
    }

  }
}
