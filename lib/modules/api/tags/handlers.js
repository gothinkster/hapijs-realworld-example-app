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
        const tags = await server.methods.services.tags.getAll()
        return h.response(tags)
      } catch (err) {
        return h.response(replyHelper.constructErrorResponse(err)).code(422)
      }
    }
  }
}
