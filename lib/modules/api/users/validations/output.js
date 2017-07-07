const Joi = require('joi')
const {
  ErrorsOutputValidations,
  ErrorsWithAuthOutputValidations,
  ErrorsOnPutOutputValidations,
  ErrorsOnGetOutputValidations,
  ErrorsOnPostOutputValidations,
  NotFoundStatus,
  UnauthorizedStatus
} = require('../../validations')
const _ = require('lodash')

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

// --------------------------------------------------
//    Config - Output Validations
// --------------------------------------------------

const AuthOutputValidationConfig = _.merge({}, ErrorsOutputValidations, NotFoundStatus, UnauthorizedStatus, {
  status: {
    200: UserAuthOutputPayload
  }
})

const AuthOnPutOutputValidationConfig = _.merge({}, ErrorsOnPutOutputValidations, {
  status: {
    200: UserAuthOutputPayload
  }
})

const AuthOnLoginOutputValidationConfig = _.merge({}, ErrorsOutputValidations, NotFoundStatus, {
  status: {
    200: UserAuthOutputPayload
  }
})

const AuthOnRegisterOutputValidationConfig = _.merge({}, ErrorsOnPostOutputValidations, {
  status: {
    200: UserAuthOutputPayload
  }
})

const AuthOnGetOutputValidationConfig = _.merge({}, ErrorsWithAuthOutputValidations, ErrorsOnGetOutputValidations, {
  status: {
    200: UserAuthOutputPayload
  }
})

module.exports = {
  AuthOutputValidationConfig,
  AuthOnPutOutputValidationConfig,
  AuthOnGetOutputValidationConfig,
  AuthOnRegisterOutputValidationConfig,
  AuthOnLoginOutputValidationConfig
}
