const replyHelper = require('../helpers')

module.exports = (server) => {
  return {
    /**
     * GET /api/articles
     */
    async getArticles (request, h) {
      let user = request.auth.isAuthenticated ? request.auth.credentials.user : null
      let query = request.query

      try {
        const articles = await server.methods.services.articles.list(user, query)

        return articles
      } catch (err) {
        return h.response(replyHelper.constructErrorResponse(err)).code(422)
      }
    },
    /**
     * GET /api/articles/feed
     */
    async getArticlesFeed (request, h) {
      let user = request.auth.credentials.user
      let query = request.query

      try {
        const articles = await server.methods.services.articles.feedFor(user, query)

        return articles
      } catch (err) {
        return h.response(replyHelper.constructErrorResponse(err)).code(422)
      }
    },
    /**
     * GET /api/articles/{slug}
     * @param {*} request
     * @param {*} h
     */
    getArticle (request, h) {
      var article = request.pre.article.toJSONFor(null)
      if (request.auth.isAuthenticated) {
        article = request.pre.article.toJSONFor(request.auth.credentials.user)
      }
      return { article }
    },
    /**
     * POST /api/articles
     * @param {*} request
     * @param {*} h
     */
    async createArticle (request, h) {
      try {
        const article = await server.methods.services.articles.create(request.auth.credentials.user, request.payload.article)

        return h.response({
          article: article.toJSONFor(request.auth.credentials.user)
        }).code(201)
      } catch (err) {
        return h.response(replyHelper.constructErrorResponse(err)).code(422)
      }
    },
    /**
     * PUT /api/articles/{slug}
     * @param {*} request
     * @param {*} h
     */
    async updateArticle (request, h) {
      try {
        const article = await server.methods.services.articles.update(request.pre.article, request.payload.article)

        return {
          article: article.toJSONFor(request.auth.credentials.user)
        }
      } catch (err) {
        return h.response(replyHelper.constructErrorResponse(err)).code(422)
      }
    },
    /**
     * DELETE /api/articles/{slug}
     * @param {*} request
     * @param {*} h
     */
    async deleteArticle (request, h) {
      try {
        const article = await server.methods.services.articles.delete(request.pre.article)

        return h.response().code(204)
      } catch (err) {
        return h.response(replyHelper.constructErrorResponse(err)).code(422)
      }
    },
    /**
     * POST /api/articles/{slug}/favorite
     * @param {*} request
     * @param {*} h
     */
    async favoriteArticle (request, h) {
      try {
        const article = await server.methods.services.users.favoriteArticle(request.auth.credentials.user, request.pre.article)

        return {
          article: article.toJSONFor(request.auth.credentials.user)
        }
      } catch (err) {
        return h.response(replyHelper.constructErrorResponse(err)).code(422)
      }
    },
    /**
     * DELETE /api/articles/{slug}/favorite
     * @param {*} request
     * @param {*} h
     */
    async unfavoriteArticle (request, h) {
      try {
        const article = await server.methods.services.users.unfavoriteArticle(request.auth.credentials.user, request.pre.article)

        return {
          article: article.toJSONFor(request.auth.credentials.user)
        }
      } catch (err) {
        return h.response(replyHelper.constructErrorResponse(err)).code(422)
      }
    },
    /**
     * GET /api/articles/{slug}/comments
     * @param {*} request
     * @param {*} h
     */
    async getComments (request, h) {
      try {
        const comments = await server.methods.services.comments.getCommentsFor(request.pre.article)

        if (request.auth.isAuthenticated) {
          return {
            comments: comments.map(c => c.toJSONFor(request.auth.credentials.user))
          }
        }

        return {
          comments: comments.map(c => c.toJSONFor(null))
        }
      } catch (err) {
        return h.response(replyHelper.constructErrorResponse(err)).code(422)
      }
    },
    /**
     * POST /api/articles/{slug}/comments
     * @param {*} request
     * @param {*} h
     */
    async addComment (request, h) {
      try {
        const comment = await server.methods.services.articles.addComment(
          request.pre.article,
          request.auth.credentials.user,
          request.payload.comment
        )

        return h.response({
          comment: comment.toJSONFor(request.auth.credentials.user)
        }).code(201)
      } catch (err) {
        return h.response(replyHelper.constructErrorResponse(err)).code(422)
      }
    },
    /**
     * DELETE /api/articles/{slug}/comments/{commentID}
     * @param {*} request
     * @param {*} h
     */
    async deleteComment (request, h) {
      try {
        await server.methods.services.articles.deleteComment(request.pre.article, request.pre.comment._id)

        return h.response().code(204)
      } catch (err) {
        return h.response(replyHelper.constructErrorResponse(err)).code(422)
      }
    }
  }
}
