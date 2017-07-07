const Joi = require('joi')

const {
  ErrorsWithAuthOutputValidations,
  ErrorsOnPostOutputValidations,
  ErrorsOnGetOutputValidations,
  ErrorsOnPutOutputValidations,
  ErrorsOnDeleteOutputValidations
} = require('../../validations')

const _ = require('lodash')

// --------------------------------------------------
//    Schema - Output Validations
// --------------------------------------------------

const ArticleJSON = Joi.object().keys({
  slug: Joi.string().required().description('The article slug'),
  title: Joi.string().required().description('The article title'),
  description: Joi.string().allow(null, '').description('The article description'),
  body: Joi.string().allow(null, '').description('The article body'),
  tagList: Joi.array().allow([]).description('The article related tags'),
  createdAt: Joi.date().iso().description('The article created at date'),
  updatedAt: Joi.date().iso().description('The article updated at date'),
  favorited: Joi.boolean().description('Indicates if the logged user favorited the article'),
  favoritesCount: Joi.number().description('The number of user who favorite the article'),
  author: Joi.object().keys({
    username: Joi.string().description('The aurhor username'),
    bio: Joi.string().allow('undefined', '', null).default(null).description('The aurhor bio'),
    image: Joi.string().uri().allow(null, '').default(null).description('The aurhor image url'),
    following: Joi.boolean().description('indicates if the current logged user follow this user')
  })
})

const SingleArticleOutputPayload = Joi.object().keys({
  article: ArticleJSON
})

const ListArticleOutputPayload = Joi.object().keys({
  articles: Joi.array().items(ArticleJSON),
  articlesCount: Joi.number().required().description('The number of articles')
})

const CommentJSON = Joi.object().keys({
  id: Joi.any().description('The comment identifier'),
  body: Joi.string().description('The comment body'),
  createdAt: Joi.date().iso().description('The comment created date'),
  updatedAt: Joi.date().iso().description('The comment updated date'),
  author: Joi.object().keys({
    username: Joi.string().description('The aurhor username'),
    bio: Joi.string().allow('undefined', '', null).default(null).description('The aurhor bio'),
    image: Joi.string().uri().allow(null, '').default(null).description('The aurhor image url'),
    following: Joi
    .boolean()
    .description('indicates if the current logged user follow this user')
  })
})

const SingleCommentOutputPayload = Joi.object().keys({
  comment: CommentJSON
})

const ListCommentOutputPayload = Joi.object().keys({
  comments: Joi.array().items(CommentJSON)
})

const ErrorOutputValidation = Joi.object().keys({
  errors: Joi.object().keys({
    title: Joi.array().items(Joi.string()).optional(),
    description: Joi.array().items(Joi.string()).optional(),
    body: Joi.array().items(Joi.string()).optional()
  })
})

// --------------------------------------------------
//    Config - Output Validations
// --------------------------------------------------

const ListArticleOutputValidationsConfig = {
  status: {
    200: ListArticleOutputPayload
  }
}

const ListArticleWithAuthOutputValidationsConfig = _.merge({}, ErrorsWithAuthOutputValidations, ListArticleOutputValidationsConfig)

const ArticleFavoriteOutputValidationsConfig = _.merge({}, ErrorsWithAuthOutputValidations, {
  status: {
    200: SingleArticleOutputPayload
  }
})

const ArticleOnGetOutputValidationsConfig = _.merge({}, ErrorsOnGetOutputValidations, {
  status: {
    200: SingleArticleOutputPayload
  }
})

const ArticleOnPostOutputValidationsConfig = _.merge({}, ErrorsOnPostOutputValidations, {
  status: {
    200: SingleArticleOutputPayload,
    422: ErrorOutputValidation
  }
})

const ArticleOnPutOutputValidationsConfig = _.merge({}, ErrorsOnPutOutputValidations, {
  status: {
    200: SingleArticleOutputPayload,
    422: ErrorOutputValidation
  }
})

const ArticleOnDeleteOutputValidationsConfig = _.merge({}, ErrorsOnDeleteOutputValidations, {
  status: {
    204: false
  }
})

const ArticleDeleteOutputValidationsConfig = _.merge({}, ErrorsOnDeleteOutputValidations, {
  status: {
    204: false
  }
})

const ListCommentOutputValidationsConfig = _.merge({}, ErrorsOnGetOutputValidations, {
  status: {
    200: ListCommentOutputPayload
  }
})

const CommentsOnPostOutputValidationsConfig = _.merge({}, ErrorsOnPostOutputValidations, {
  status: {
    201: SingleCommentOutputPayload,
    422: ErrorOutputValidation
  }
})

const CommentOnDeleteOutputValidationsConfig = _.merge({}, ErrorsOnDeleteOutputValidations, {
  status: {
    204: false
  }
})

module.exports = {
  ArticleDeleteOutputValidationsConfig,
  ArticleFavoriteOutputValidationsConfig,
  ArticleOnGetOutputValidationsConfig,
  ArticleOnPostOutputValidationsConfig,
  ArticleOnPutOutputValidationsConfig,
  ArticleOnDeleteOutputValidationsConfig,
  ListArticleOutputValidationsConfig,
  ListArticleWithAuthOutputValidationsConfig,
  CommentsOnPostOutputValidationsConfig,
  CommentOnDeleteOutputValidationsConfig,
  ListCommentOutputValidationsConfig,
  SingleArticleOutputPayload,
  ListArticleOutputPayload,
  SingleCommentOutputPayload,
  ListCommentOutputPayload
}
