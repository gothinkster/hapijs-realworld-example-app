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
    async getCurrentUser (request, h) {
      try {
        return constructUserResponse(request.auth.credentials.user)
      } catch (err) {
        return h.response(replyHelper.constructErrorResponse(err)).code(422)
      }
    },
    /**
     * PUT /api/user
     * @param {*} request
     * @param {*} h
     */
    async updateUser (request, h) {
      let payload = request.payload
      let user = request.auth.credentials.user

      try {
        const updatedUser = await server.methods.services.users.update(user, payload)
        return constructUserResponse(updatedUser)
      } catch (err) {
        return h.response(replyHelper.constructErrorResponse(err)).code(422)
      }
    },
    /**
     * POST /api/users
     * @param {*} request
     * @param {*} h
     */
    async registerUser (request, h) {
      let payload = request.payload

      try {
        const user = await server.methods.services.users.create(payload)

        if (!user) {
          return h.response({
            errors: {
              422: ["can't create new user !"]
            }
          }).code(422)
        }

        return constructUserResponse(user)
      } catch (err) {
        return h.response(replyHelper.constructErrorResponse(err)).code(422)
      }
    },
    /**
     * POST /api/users/login
     * @param {*} request
     * @param {*} h
     */
    async loginUser (request, h) {
      let payload = request.payload

      try {
        const user = await server.methods.services.users.getByEmail(payload.user.email)

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
              401: ['email or password missmatch !']
            }
          }).code(401)
        }

        return constructUserResponse(user)
      } catch (err) {
        return h.response(replyHelper.constructErrorResponse(err)).code(422)
      }
    }
  }
}
