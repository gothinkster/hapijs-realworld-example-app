const Joi = require('joi')
const ErrorsOutputValidations = require('../../validations').ErrorsOutputValidations
const _ = require('lodash')

// --------------------------------------------------
//    Schema - Output Validations
// --------------------------------------------------

const ArticleJSON = Joi.object().keys({
  slug: Joi.string().required(),
  title: Joi.string().required(),
  description: Joi.string().allow(null, ''),
  body: Joi.string().allow(null, ''),
  tagList: Joi.array().allow([]),
  createdAt: Joi.date().iso(),
  updatedAt: Joi.date().iso(),
  favorited: Joi.boolean(),
  favoritesCount: Joi.number(),
  author: Joi.object().keys({
    username: Joi.string(),
    bio: Joi.string().allow('undefined', '', null).default(null),
    image: Joi.string().uri().allow(null, '').default(null),
    following: Joi.boolean()
  })
})

const SingleArticleOutputPayload = Joi.object().keys({
  article: ArticleJSON
})

const ListArticleOutputPayload = Joi.object().keys({
  articles: Joi.array().items(ArticleJSON),
  articlesCount: Joi.number().required()
})

const CommentJSON = Joi.object().keys({
  id: Joi.any(),
  body: Joi.string(),
  createdAt: Joi.date().iso(),
  updatedAt: Joi.date().iso(),
  author: Joi.object().keys({
    username: Joi.string(),
    bio: Joi.string().allow('undefined', '', null).default(null),
    image: Joi.string().uri().allow(null, '').default(null),
    following: Joi.boolean()
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

const ListArticleOutputValidationsConfig = _.merge({}, ErrorsOutputValidations, {
  status: {
    200: ListArticleOutputPayload,
    422: ErrorOutputValidation
  }
})

const SingleArticleOutputValidationsConfig = _.merge({}, ErrorsOutputValidations, {
  status: {
    200: SingleArticleOutputPayload,
    422: ErrorOutputValidation
  }
})

const ListCommentOutputValidationsConfig = _.merge({}, ErrorsOutputValidations, {
  status: {
    200: ListCommentOutputPayload,
    422: ErrorOutputValidation
  }
})

const SingleCommentOutputValidationsConfig = _.merge({}, ErrorsOutputValidations, {
  status: {
    200: SingleCommentOutputPayload,
    422: ErrorOutputValidation
  }
})

module.exports = {
  SingleArticleOutputPayload,
  SingleArticleOutputValidationsConfig,
  ListArticleOutputPayload,
  ListArticleOutputValidationsConfig,
  SingleCommentOutputPayload,
  SingleCommentOutputValidationsConfig,
  ListCommentOutputPayload,
  ListCommentOutputValidationsConfig
}
