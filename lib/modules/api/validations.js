const Joi = require('joi')
const constructErrorResponse = require('./helpers').constructErrorResponse
const _ = require('lodash')

const errorHandler = (request, h, error) => {
  return h.response(constructErrorResponse(error)).code(422).takeover()
}

const validateOptions = {
  options: { abortEarly: false },
  failAction: errorHandler
}

function schemaForStatusCode (statusCode) {
  let schema = {
    errors: {}
  }

  schema.errors[statusCode] = Joi.array().items(Joi.string())

  return Joi.object().keys(schema)
}

// --------------------------------------------------
//    Schemas
// --------------------------------------------------

const HeadersPayLoad = Joi.object().keys({
  'Authorization': Joi.string().required().description('A valid Json Web Token')
}).unknown().rename('authorization', 'Authorization')

const NotFoundStatus = {
  status: {
    404: schemaForStatusCode(404)
  }
}

const BadRequestStatus = {
  status: {
    400: schemaForStatusCode(400)
  }
}

const UnauthorizedStatus = {
  status: {
    401: schemaForStatusCode(401)
  }
}

const ForbiddenStatus = {
  status: {
    403: schemaForStatusCode(403)
  }
}

const ErrorsOutputValidations = {
  sample: 1,
  status: {
    500: schemaForStatusCode(500)
  }
}

const ErrorsWithAuthOutputValidations = _.merge({}, ErrorsOutputValidations, UnauthorizedStatus)

const ErrorsOnGetOutputValidations = _.merge({}, ErrorsOutputValidations, NotFoundStatus)

const ErrorsOnPostOutputValidations = _.merge({}, ErrorsOutputValidations, ErrorsWithAuthOutputValidations)

const ErrorsOnPutOutputValidations = _.merge({}, ErrorsOutputValidations, NotFoundStatus, UnauthorizedStatus, ForbiddenStatus)

const ErrorsOnDeleteOutputValidations = _.merge({}, ErrorsOutputValidations, NotFoundStatus, UnauthorizedStatus, ForbiddenStatus)

module.exports = {
  errorHandler,
  BadRequestStatus,
  ForbiddenStatus,
  NotFoundStatus,
  UnauthorizedStatus,
  validateOptions,
  schemaForStatusCode,
  ErrorsOutputValidations,
  ErrorsWithAuthOutputValidations,
  ErrorsOnGetOutputValidations,
  ErrorsOnPostOutputValidations,
  ErrorsOnPutOutputValidations,
  ErrorsOnDeleteOutputValidations,
  HeadersPayLoad
}
