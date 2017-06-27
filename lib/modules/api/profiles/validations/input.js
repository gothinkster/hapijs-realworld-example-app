const Joi = require('joi')

// --------------------------------------------------
//    Config - Input Validations
// --------------------------------------------------

const ProfileParamsValidation = {
  params: {
    username: Joi.string().regex(/^[a-zA-Z0-9]+$/, 'alphanumeric')
  }
}

module.exports = {
  ProfileParamsValidation
}
