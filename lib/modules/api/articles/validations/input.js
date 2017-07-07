const Joi = require('joi')
const {validateOptions, HeadersPayLoad} = require('../../validations')
const _ = require('lodash')

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
    title: Joi.string().required().description('the article title').example('Learn HapiJS'),
    description: Joi.string().required().description('the article description').example('Learn how to write a REST Api with HapiJS'),
    body: Joi.string().required().description('the article body').example(`Proident do incididunt minim do nostrud qui qui enim enim consequat et consectetur incididunt officia. Magna tempor nostrud anim anim commodo non id amet cupidatat pariatur nulla. Cupidatat officia officia incididunt do deserunt laboris pariatur et minim non et ea Lorem ea. Ipsum cillum ullamco sunt dolor exercitation ipsum nostrud amet aute deserunt. Ullamco ex sunt laborum laboris nisi nisi proident do est laboris Lorem magna.`),
    tagList: Joi.array().allow([]).description('the article tags').optional().example(['HapiJS', 'Node', 'REST', 'API'])
  })
})

const CommentCreatePayload = Joi.object().keys({
  comment: Joi.object().keys({
    body: Joi.string().required().description('the comment body').example('Exercitation adipisicing ea veniam irure qui incididunt irure laboris nulla reprehenderit laboris dolore. In eu nostrud aliqua aliqua nostrud ullamco eiusmod irure enim eu minim et qui. Occaecat consequat dolore fugiat ullamco incididunt ipsum ad aute. Enim aliquip dolor sit cillum incididunt. Proident do ipsum nisi irure.')
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
  headers: HeadersPayLoad,
  params: {
    slug: Joi.string().required().description('the article slug'),
    commentId: Joi.string().required().description('the comment identifier')
  }
}

const ArticlesQueryValidations = {
  query: {
    tag: Joi.string().description('filter by tag name'),
    author: Joi.string().description('filter by author username'),
    favorited: Joi.string().description('filter by favoriter username'),
    limit: Joi.number().integer().default(20).description('limit result set'),
    offset: Joi.number().integer().default(0).description('number of record to skip')
  },
  options: validateOptions.options,
  failAction: validateOptions.failAction
}

const ArticlesFeedQueryValidations = {
  query: {
    limit: Joi.number().integer().default(20).description('limit result set'),
    offset: Joi.number().integer().default(0).description('number of record to skip')
  },
  headers: HeadersPayLoad,
  options: validateOptions.options,
  failAction: validateOptions.failAction
}

const ArticleCreatePayloadValidations = {
  payload: ArticleCreatePayload,
  headers: HeadersPayLoad,
  options: validateOptions.options,
  failAction: validateOptions.failAction
}

const ArticleUpdatePayloadValidations = Object.assign({
  payload: ArticleUpdatePayload,
  headers: HeadersPayLoad,
  options: validateOptions.options,
  failAction: validateOptions.failAction
}, ArticleParamsValidations)

const ArticleDeletePayloadValidations = Object.assign({
  headers: HeadersPayLoad,
  options: validateOptions.options,
  failAction: validateOptions.failAction
}, ArticleParamsValidations)

const ArticleFavoritePayloadValidations = Object.assign({
  headers: HeadersPayLoad,
  options: validateOptions.options,
  failAction: validateOptions.failAction
}, ArticleParamsValidations)

const CommentCreatePayloadValidations = {
  payload: CommentCreatePayload,
  headers: HeadersPayLoad,
  options: validateOptions.options,
  failAction: validateOptions.failAction
}

const CommentDeletePayloadValidations = _.merge({}, ArticleParamsValidations, CommentParamsValidations, {
  options: validateOptions.options,
  failAction: validateOptions.failAction
})

module.exports = {
  ArticleParamsValidations,
  ArticleCreatePayloadValidations,
  ArticlesQueryValidations,
  ArticlesFeedQueryValidations,
  ArticleUpdatePayloadValidations,
  ArticleDeletePayloadValidations,
  ArticleFavoritePayloadValidations,
  CommentCreatePayloadValidations,
  CommentParamsValidations,
  CommentDeletePayloadValidations
}
