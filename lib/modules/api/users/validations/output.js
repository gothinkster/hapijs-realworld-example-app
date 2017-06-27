const Joi = require('joi')
const ErrorsOutputValidations = require('../../validations').ErrorsOutputValidations
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

const AuthOutputValidationConfig = _.merge({}, ErrorsOutputValidations, {
  status: {
    200: UserAuthOutputPayload
  }
})

module.exports = {
  AuthOutputValidationConfig
}
