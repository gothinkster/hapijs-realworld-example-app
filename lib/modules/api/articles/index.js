const inputValidations = require('./validations/input')
const outputValidations = require('./validations/output')
const replyHelper = require('../helpers')

const register = (server, options, next) => {
  const fetchArticle = require('./routes_prerequisites').fetchArticle(server)
  const fetchComment = require('./routes_prerequisites').fetchComment(server)
  const authorizeArticle = require('./routes_prerequisites').authorizeArticle(server)
  const authorizeComment = require('./routes_prerequisites').authorizeComment(server)

  server.route([
    // GET /api/articles
    {
      method: 'GET',
      path: '/articles',
      config: {
        response: outputValidations.ListArticleOutputValidationsConfig,
        validate: inputValidations.ArticlesQueryValidations
      },
      handler: (request, reply) => {
        let user = request.auth.isAuthenticated ? request.auth.credentials.user : null
        let query = request.query

        server.methods.services.articles.list(user, query, (err, articles) => {
          if (err) return reply(replyHelper.constructErrorResponse(err)).code(422)
          return reply(articles)
        })
      }
    },
    // GET /api/articles/feed
    {
      method: 'GET',
      path: '/articles/feed',
      config: {
        auth: 'jwt',
        response: outputValidations.ListArticleOutputValidationsConfig,
        validate: inputValidations.ArticlesQueryValidations
      },
      handler: (request, reply) => {
        let user = request.auth.credentials.user
        let query = request.query

        server.methods.services.articles.feedFor(user, query, (err, articles) => {
          if (err) return reply(replyHelper.constructErrorResponse(err)).code(422)
          return reply(articles)
        })
      }
    },
    // POST /api/articles
    {
      method: 'POST',
      path: '/articles',
      config: {
        auth: 'jwt',
        response: outputValidations.SingleArticleOutputValidationsConfig,
        validate: inputValidations.ArticleCreatePayloadValidations
      },
      handler: (request, reply) => {
        server.methods.services.articles.create(
          request.auth.credentials.user,
          request.payload.article,
          (err, article) => {
            if (err) return reply(replyHelper.constructErrorResponse(err)).code(422)
            return reply({ article: article.toJSONFor(request.auth.credentials.user) }).code(201)
          })
      }
    },
    // GET /api/articles/{slug}
    {
      method: 'GET',
      path: '/articles/{slug}',
      config: {
        auth: { mode: 'try', strategy: 'jwt' },
        pre: [
          fetchArticle
        ],
        response: outputValidations.SingleArticleOutputValidationsConfig,
        validate: inputValidations.ArticleParamsValidations
      },
      handler: (request, reply) => {
        var article = request.pre.article.toJSONFor(null)
        if (request.auth.isAuthenticated) {
          article = request.pre.article.toJSONFor(request.auth.credentials.user)
        }
        return reply({article})
      }
    },
    // PUT /api/articles/{slug}
    {
      method: 'PUT',
      path: '/articles/{slug}',
      config: {
        auth: 'jwt',
        pre: [
          fetchArticle,
          authorizeArticle
        ],
        response: outputValidations.SingleArticleOutputValidationsConfig,
        validate: inputValidations.ArticleUpdatePayloadValidations
      },
      handler: (request, reply) => {
        server.methods.services.articles.update(
          request.pre.article,
          request.payload.article,
          (err, article) => {
            if (err) return reply(replyHelper.constructErrorResponse(err)).code(422)
            return reply({ article: article.toJSONFor(request.auth.credentials.user) })
          })
      }
    },
    // DELETE /api/articles/{slug}
    {
      method: 'DELETE',
      path: '/articles/{slug}',
      config: {
        auth: 'jwt',
        pre: [
          fetchArticle,
          authorizeArticle
        ],
        response: outputValidations.SingleArticleOutputValidationsConfig,
        validate: inputValidations.ArticleParamsValidations
      },
      handler: (request, reply) => {
        server.methods.services.articles.delete(
          request.pre.article,
          (err, article) => {
            if (err) return reply(replyHelper.constructErrorResponse(err)).code(422)
            return reply().code(204)
          })
      }
    },
    // DELETE/POST /api/articles/{slug}/favorite
    {
      method: ['DELETE', 'POST'],
      path: '/articles/{slug}/favorite',
      config: {
        auth: 'jwt',
        pre: [
          fetchArticle
        ],
        response: outputValidations.SingleArticleOutputValidationsConfig,
        validate: inputValidations.ArticleParamsValidations
      },
      handler: (request, reply) => {
        var action = server.methods.services.users.favoriteArticle

        if (request.method === 'delete') {
          action = server.methods.services.users.unfavoriteArticle
        }

        action(
          request.auth.credentials.user,
          request.pre.article,
          (err, article) => {
            if (err) return reply(replyHelper.constructErrorResponse(err)).code(422)
            return reply({article: article.toJSONFor(request.auth.credentials.user)})
          })
      }
    },
    // GET /api/articles/{slug}/comments
    {
      method: 'GET',
      path: '/articles/{slug}/comments',
      config: {
        auth: { mode: 'try', strategy: 'jwt' },
        pre: [
          fetchArticle
        ],
        response: outputValidations.ListCommentOutputValidationsConfig,
        validate: inputValidations.ArticleParamsValidations
      },
      handler: (request, reply) => {
        server.methods.services.comments.getCommentsFor(request.pre.article, (err, comments) => {
          if (err) return reply(replyHelper.constructErrorResponse(err).code(422))
          if (request.auth.isAuthenticated) {
            return reply({ comments: comments.map(c => c.toJSONFor(request.auth.credentials.user)) })
          }
          return reply({ comments: comments.map(c => c.toJSONFor(null)) })
        })
      }
    },
    // POST /api/articles/{slug}/comments
    {
      method: 'POST',
      path: '/articles/{slug}/comments',
      config: {
        auth: 'jwt',
        pre: [
          fetchArticle,
          fetchComment
        ],
        response: outputValidations.SingleCommentOutputValidationsConfig,
        validate: inputValidations.CommentCreatePayloadValidations
      },
      handler: (request, reply) => {
        server.methods.services.articles.addComment(
          request.pre.article,
          request.auth.credentials.user,
          request.payload.comment,
          (err, comment) => {
            if (err) return reply(replyHelper.constructErrorResponse(err)).code(422)
            return reply({ comment: comment.toJSONFor(request.auth.credentials.user) }).code(201)
          })
      }
    },
    // DELETE /api/articles/{slug}/comments/{commentId}
    {
      method: 'DELETE',
      path: '/articles/{slug}/comments/{commentId}',
      config: {
        auth: 'jwt',
        pre: [
          fetchArticle,
          fetchComment,
          authorizeComment
        ],
        validate: inputValidations.CommentParamsValidations
      },
      handler: (request, reply) => {
        server.methods.services.articles.deleteComment(
          request.pre.article,
          request.pre.comment._id,
          (err, _) => {
            if (err) return reply(replyHelper.constructErrorResponse(err)).code(422)
            return reply().code(204)
          })
      }
    }
  ])
  return next()
}

register.attributes = {
  pkg: require('./package.json')
}

module.exports = register
