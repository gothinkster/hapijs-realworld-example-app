const Joi = require('joi')
const validateOptions = require('../../validations').validateOptions

// --------------------------------------------------
//    Schema - Input Validations
// --------------------------------------------------

const ArticleUpdatePayload = Joi.object().keys({
  article: Joi.object().keys({
    title: Joi.string().optional(),
    description: Joi.string().optional(),
    body: Joi.string().optional(),
    tagList: Joi.array().optional()
  })
})

const ArticleCreatePayload = Joi.object().keys({
  article: Joi.object().keys({
    title: Joi.string().required(),
    description: Joi.string().required(),
    body: Joi.string().required(),
    tagList: Joi.array().allow([]).optional()
  })
})

const CommentCreatePayload = Joi.object().keys({
  comment: Joi.object().keys({
    body: Joi.string().required()
  })
})

// --------------------------------------------------
//    Config - Input Validations
// --------------------------------------------------

const ArticleParamsValidations = {
  params: {
    slug: Joi.string().required()
  }
}

const CommentParamsValidations = {
  params: {
    slug: Joi.string().required(),
    commentId: Joi.string().required()
  }
}

const ArticlesQueryValidations = {
  query: {
    tag: Joi.string(),
    author: Joi.string(),
    favorited: Joi.string(),
    limit: Joi.number().default(20),
    offset: Joi.number().default(0)
  },
  options: validateOptions.options,
  failAction: validateOptions.failAction
}

const ArticleCreatePayloadValidations = {
  payload: ArticleCreatePayload,
  options: validateOptions.options,
  failAction: validateOptions.failAction
}

const ArticleUpdatePayloadValidations = Object.assign({
  payload: ArticleUpdatePayload,
  options: validateOptions.options,
  failAction: validateOptions.failAction
}, ArticleParamsValidations)

const CommentCreatePayloadValidations = {
  payload: CommentCreatePayload,
  options: validateOptions.options,
  failAction: validateOptions.failAction
}

module.exports = {
  ArticleParamsValidations,
  ArticleCreatePayloadValidations,
  ArticlesQueryValidations,
  ArticleUpdatePayloadValidations,
  CommentCreatePayloadValidations,
  CommentParamsValidations
}
