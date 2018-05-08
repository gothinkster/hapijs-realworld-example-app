const replyHelper = require('../helpers')

module.exports = (server) => {
  return {
    /**
     * GET /api/tags
     * @param {*} request
     * @param {*} h
     */
    async getTags (request, h) {
      try {
        return await server.methods.services.tags.getAll()
      }
      catch (err) {
        return h.response(replyHelper.constructErrorResponse(err)).code(422)
      }
    }
  }
}
