const Joi = require('joi')
const {
  ErrorsWithAuthOutputValidations,
  ErrorsOnGetOutputValidations,
  ErrorsOnPutOutputValidations,
  NotFoundStatus
} = require('../../validations')
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

const ProfileOnGetOutputValidationConfig = _.merge({}, ErrorsWithAuthOutputValidations, ErrorsOnGetOutputValidations, {
  status: {
    200: ProfileOutputPayload
  }
})

const ProfileOnPutOutputValidationConfig = _.merge({}, ErrorsOnPutOutputValidations, {
  status: {
    200: ProfileOutputPayload
  }
})

const ProfileFollowOutputValidationConfig = _.merge({}, ErrorsWithAuthOutputValidations, NotFoundStatus, {
  status: {
    200: ProfileOutputPayload
  }
})

module.exports = {
  ProfileOutputPayload,
  ProfileOnGetOutputValidationConfig,
  ProfileOnPutOutputValidationConfig,
  ProfileFollowOutputValidationConfig
}
