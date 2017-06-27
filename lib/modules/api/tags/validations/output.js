const Joi = require('joi')

// --------------------------------------------------
//    Schema - Output Validations
// --------------------------------------------------

const TagsOutputPayload = Joi.object().keys({
  tags: Joi.array().items(Joi.string())
})

// --------------------------------------------------
//    Config - Output Validations
// --------------------------------------------------

const TagListOutputValidationsConfig = {
  status: {
    200: TagsOutputPayload
  }
}

module.exports = {
  TagListOutputValidationsConfig
}
