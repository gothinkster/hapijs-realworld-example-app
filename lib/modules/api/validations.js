const Joi = require('joi')

const loginPayload = Joi.object().keys({
  user: Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  })
})

const registerPayload = Joi.object().keys({
  user: Joi.object().keys({
    username: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().required()
  })
})

const updatePayload = Joi.object().keys({
  user: Joi.object().keys({
    username: Joi.string(),
    email: Joi.string().email(),
    password: Joi.string().allow(''),
    bio: Joi.string(),
    image: Joi.string().uri()
  })
})

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
    response = errorHandlers[handler](err)
    if (response == null) continue
    break
  }
  return response
}

module.exports = {
  loginPayload,
  registerPayload,
  updatePayload,
  constructErrorResponse
}
