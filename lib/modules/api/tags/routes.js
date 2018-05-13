const outputValidations = require('./validations/output')

module.exports = (server) => {
  const handlers = require('./handlers')(server)
  return [
    // GET /api/tags
    {
      method: 'GET',
      path: '/tags',
      config: {
        response: outputValidations.TagListOutputValidationsConfig,
        description: 'Get all tags',
        tags: ['api', 'tags']
      },
      handler: handlers.getTags
    }
  ]
}
