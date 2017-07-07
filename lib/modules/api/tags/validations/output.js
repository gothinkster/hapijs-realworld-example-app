const Joi = require('joi')
const {ErrorsValidationsOutput} = require('../../validations')
const _ = require('lodash')

// --------------------------------------------------
//    Schema - Output Validations
// --------------------------------------------------

const TagsOutputPayload = Joi.object().keys({
  tags: Joi.array().items(Joi.string()).example(['HapiJS', 'Node', 'REST', 'API'])
})

// --------------------------------------------------
//    Config - Output Validations
// --------------------------------------------------

const TagListOutputValidationsConfig = _.merge({}, ErrorsValidationsOutput, {
  status: {
    200: TagsOutputPayload
  }
})

module.exports = {
  TagListOutputValidationsConfig
}
