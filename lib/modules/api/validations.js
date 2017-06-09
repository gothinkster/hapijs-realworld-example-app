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

module.exports = {
  loginPayload,
  registerPayload
}
