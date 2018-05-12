const replyHelper = require('../helpers')

const fetchArticle = server => {
  return {
    method: async (request, h) => {
      console.log(request.params.slug)

      if (!request.params.slug) {
        return h.continue
      }

      try {
        const article = await server.methods.services.articles.getBySlug(request.params.slug)

        if (!article) {
          return h.response({
            errors: {
              404: ['Article not found']
            }
          }).code(404).takeover()
        }

        return article
      } catch (err) {
        return h.response(replyHelper.constructErrorResponse(err)).takeover()
      }
    },
    assign: 'article'
  }
}

const fetchComment = server => {
  return {
    method: async (request, h) => {
      if (!request.params.commentId) {
        return h.continue
      }

      try {
        const comment = await server.methods.services.comments.getById(request.params.commentId)

        if (!comment) {
          return h.response(null, {
            errors: {
              404: ['Comment not found']
            }
          }).code(404).takeover()
        }

        return comment
      } catch (err) {
        return h.response(replyHelper.constructErrorResponse(err)).takeover()
      }
    },
    assign: 'comment'
  }
}

const authorizeArticle = server => {
  return {
    method: (request, h) => {
      if (request.pre.article === 'undefined') {
        return h.continue
      }

      if (request.auth.credentials.user._id.toString() !== request.pre.article.author._id.toString()) {
        return h.response({
          errors: {
            403: [`You cannot perform this action !`]
          }
        }).code(403).takeover()
      }

      return true
    },
    assign: 'authorized'
  }
}

const authorizeComment = server => {
  return {
    method: (request, h) => {
      if (request.pre.comment === 'undefined') {
        return h.continue
      }

      if (request.auth.credentials.user._id.toString() !== request.pre.comment.author._id.toString()) {
        return h.response(null, {
          errors: {
            403: [`You cannot perform this action !`]
          }
        }).code(403).takeover()
      }

      return true
    },
    assign: 'authorized'
  }
}

module.exports = {
  fetchArticle,
  fetchComment,
  authorizeArticle,
  authorizeComment
}
