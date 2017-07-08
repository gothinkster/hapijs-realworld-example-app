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
     * @param {*} reply
     */
    getCurrentUser (request, reply) {
      return reply(constructUserResponse(request.auth.credentials.user))
    },
    updateUser (request, reply) {
      let payload = request.payload
      let user = request.auth.credentials.user

      server.methods.services.users.update(user, payload, (err, updatedUser) => {
        if (err) return reply(replyHelper.constructErrorResponse(err)).code(422)
        return reply(constructUserResponse(updatedUser))
      })
    },
    /**
     * POST /api/users
     * @param {*} request
     * @param {*} reply
     */
    registerUser (request, reply) {
      let payload = request.payload

      server.methods.services.users.create(payload, (err, user) => {
      // TODO: Better error response
        if (err) return reply(replyHelper.constructErrorResponse(err)).code(422)
        if (!user) return reply().code(422)

        return reply(constructUserResponse(user))
      })
    },
    /**
     * POST /api/users/login
     * @param {*} request
     * @param {*} reply
     */
    loginUser (request, reply) {
      let payload = request.payload

      server.methods.services.users.getByEmail(payload.user.email, (err, user) => {
        if (err) return reply(replyHelper.constructErrorResponse(err)).code(422)

        if (!user) {
          return reply({
            errors: {
              404: ['email/password is invalid !']
            }
          }).code(404)
        }

        if (!user.validPassword(payload.user.password)) {
          return reply({
            errors: {
              'email or password': ['email or password missmatch !']
            }
          }).code(401)
        }

        return reply(constructUserResponse(user))
      })
    }

  }
}
