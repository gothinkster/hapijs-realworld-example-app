const Joi = require('Joi')
const ErrorsOutputValidations = require('../../validations').ErrorsOutputValidations
const _ = require('lodash')

// --------------------------------------------------
//    Schemas
// --------------------------------------------------

const ProfileOutputPayload = Joi.object().keys({
  user: Joi.object().keys({
    username: Joi.string().required(),
    bio: Joi.string().allow(null, ''),
    image: Joi.string().uri().allow(null, ''),
    following: Joi.boolean()
  })
})

// --------------------------------------------------
//    Config - Output Validations
// --------------------------------------------------

const ProfileOutputValidationConfig = _.merge({}, ErrorsOutputValidations, {
  status: {
    200: ProfileOutputPayload
  }
})

module.exports = {
  ProfileOutputPayload,
  ProfileOutputValidationConfig
}
