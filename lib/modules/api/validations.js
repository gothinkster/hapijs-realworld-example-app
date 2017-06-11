const Joi = require('joi')

const errorHandler = (request, reply, source, error) => {
  return reply(constructErrorResponse(error.data)).code(422)
}

let validateOptions = {
  options: { abortEarly: false },
  failAction: errorHandler
}

const LoginPayload = {
  payload: Joi.object().keys({
    user: Joi.object().keys({
      email: Joi.string().email().required(),
      password: Joi.string().required()
    })
  }),
  options: validateOptions.options,
  failAction: validateOptions.failAction
}

const RegisterPayload = {
  payload: Joi.object().keys({
    user: Joi.object().keys({
      username: Joi.string().required(),
      email: Joi.string().email().required(),
      password: Joi.string().required()
    })
  }),
  options: validateOptions.options,
  failAction: validateOptions.failAction
}

const UpdatePayload = {
  payload: Joi.object().keys({
    user: Joi.object().keys({
      username: Joi.string(),
      email: Joi.string().email(),
      password: Joi.string().allow(''),
      bio: Joi.string().allow(''),
      image: Joi.string().uri().allow('')
    })
  }),
  options: validateOptions.options,
  failAction: validateOptions.failAction
}

function joiResponseErrorHandler (err) {
  if (err.isJoi) {
    let response = {
      errors: {}
    }

    err.details.forEach((error) => {
      response.errors[error.context.key] = [error.message]
    })

    return response
  }

  return null
}

function mongooseResponseErrorHandler (err) {
  if (err.name && err.name === 'ValidationError') {
    let response = {
      errors: {}
    }

    var keys = Object.keys(err.errors)
    for (var index in keys) {
      var key = keys[index]
      if (err.errors[key].hasOwnProperty('message')) {
        response.errors[key] = [`"${err.errors[key].value}" ${err.errors[key].message}`]
      }
    }

    return response
  }

  return null
}

const errorHandlers = [joiResponseErrorHandler, mongooseResponseErrorHandler]

const constructErrorResponse = (err) => {
  var response
  for (var handler in errorHandlers) {
    let handlerFn = errorHandlers[handler]
    if (typeof (handlerFn) === 'function') {
      response = handlerFn(err)
      if (response === null) continue
      break
    }
  }
  return response
}

module.exports = {
  errorHandler,
  validateOptions,
  LoginPayload,
  RegisterPayload,
  UpdatePayload,
  constructErrorResponse
}
