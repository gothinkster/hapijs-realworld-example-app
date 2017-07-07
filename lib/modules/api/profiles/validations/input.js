const Joi = require('joi')
const {HeadersPayLoad} = require('../../validations')
// --------------------------------------------------
//    Config - Input Validations
// --------------------------------------------------

const ProfileParamsValidation = {
  headers: HeadersPayLoad.optionalKeys('Authorization'),
  params: {
    username: Joi
    .string()
    .regex(/^[a-zA-Z0-9]+$/, 'alphanumeric')
    .description('the user username')
    .example('johndoe')
  }
}

module.exports = {
  ProfileParamsValidation
}
