const Joi = require('joi')
const constructErrorResponse = require('./helpers').constructErrorResponse

const errorHandler = (request, reply, source, error) => {
  return reply(constructErrorResponse(error.data)).code(422)
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

const ErrorsOutputValidations = {
  sample: 50,
  status: {
    404: schemaForStatusCode(404),
    403: schemaForStatusCode(403)
  }
}

module.exports = {
  errorHandler,
  validateOptions,
  schemaForStatusCode,
  ErrorsOutputValidations
}
