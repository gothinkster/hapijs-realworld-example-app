const replyHelper = require('../helpers')

module.exports = (server) => {
  return {
    /**
     * GET /api/tags
     * @param {*} request
     * @param {*} h
     */
    getTags (request, h) {
      server.methods.services.tags.getAll((err, tags) => {
        if (err) return h.response(replyHelper.constructErrorResponse(err)).code(422)
        return { tags }
      })
    }
  }
}
