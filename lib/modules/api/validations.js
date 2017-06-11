const Joi = require('joi')

const errorHandler = (request, reply, source, error) => {
  return reply(constructErrorResponse(error.data)).code(422)
}

let validateOptions = {
  options: { abortEarly: false },
  failAction: errorHandler
}

// --------------------------------------------------
//    Schemas
// --------------------------------------------------

const UserAuthOutputPayload = Joi.object().keys({
  user: Joi.object().keys({
    username: Joi.string().required(),
    email: Joi.string().email().required(),
    token: Joi.string().allow(null, ''),
    bio: Joi.string().allow(null, ''),
    image: Joi.string().uri().allow(null, '')
  })
})

const ProfileOutputPayload = Joi.object().keys({
  user: Joi.object().keys({
    username: Joi.string().required(),
    bio: Joi.string().allow(null, ''),
    image: Joi.string().uri().allow(null, ''),
    following: Joi.boolean()
  })
})

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

// --------------------------------------------------
//    Config
// --------------------------------------------------

// --------------------------------------------------
//    Config - Input Validations
// --------------------------------------------------

const ProfileParamsValidation = {
  params: {
    username: Joi.string().regex(/^[a-zA-Z0-9]+$/, 'alphanumeric')
  }
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

// --------------------------------------------------
//    Config - Output Validations
// --------------------------------------------------

const AuthOutputValidationConfig = {
  sample: 50,
  status: {
    200: UserAuthOutputPayload
  }
}

const ProfileOutputValidationConfig = {
  sample: 50,
  status: {
    200: ProfileOutputPayload
  }
}

// --------------------------------------------------
//    Helpers
// --------------------------------------------------

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
  constructErrorResponse,
  // Input validations
  LoginPayload,
  RegisterPayload,
  UpdatePayload,
  ProfileParamsValidation,
  // Output validation
  AuthOutputValidationConfig,
  ProfileOutputValidationConfig
}
