const outputValidations = require('./validations/output')
const replyHelper = require('../helpers')

const register = (server, options, next) => {
  server.route([
    // GET /api/tags
    {
      method: 'GET',
      path: '/tags',
      config: {
        response: outputValidations.TagListOutputValidationsConfig
      },
      handler: (request, reply) => {
        server.methods.services.tags.getAll((err, tags) => {
          if (err) return reply(replyHelper.constructErrorResponse(err)).code(422)
          return reply({tags})
        })
      }
    }
  ])

  return next()
}

register.attributes = {
  pkg: require('./package.json')
}

module.exports = register
