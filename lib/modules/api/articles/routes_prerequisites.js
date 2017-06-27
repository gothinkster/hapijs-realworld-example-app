const replyHelper = require('../helpers')

const fetchArticle = server => {
  return {
    method: (request, reply) => {
      if (!request.params.slug) {
        return reply.continue()
      }

      server.methods.services.articles.getBySlug(
      request.params.slug,
      (err, article) => {
        if (err) {
          return reply(replyHelper.constructErrorResponse(err)).takeover()
        }

        if (!article) {
          return reply({
            errors: {
              404: ['Article not found']
            }
          }).code(404).takeover()
        }

        return reply(article)
      })
    },
    assign: 'article'
  }
}

const fetchComment = server => {
  return {
    method: (request, reply) => {
      if (!request.params.commentId) {
        return reply.continue()
      }

      server.methods.services.comments.getById(
        request.params.commentId,
        (err, comment) => {
          if (err) {
            return reply(replyHelper.constructErrorResponse(err)).takeover()
          }

          if (!comment) {
            return reply(null, {
              errors: {
                404: ['Comment not found']
              }
            }).code(404).takeover()
          }

          return reply(comment)
        })
    },
    assign: 'comment'
  }
}

const authorizeArticle = server => {
  return {
    method: (request, reply) => {
      if (request.pre.article === 'undefined') {
        return reply.continue()
      }

      if (request.auth.credentials.user._id.toString() !== request.pre.article.author._id.toString()) {
        return reply({
          errors: {
            403: [`You cannot perform this action !`]
          }
        }).code(403).takeover()
      }

      return reply(true)
    },
    assign: 'authorized'
  }
}

const authorizeComment = server => {
  return {
    method: (request, reply) => {
      if (request.pre.comment === 'undefined') {
        return reply.continue()
      }

      if (request.auth.credentials.user._id.toString() !== request.pre.comment.author._id.toString()) {
        return reply(null, {
          errors: {
            403: [`You cannot perform this action !`]
          }
        }).code(403).takeover()
      }

      return reply(true)
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
