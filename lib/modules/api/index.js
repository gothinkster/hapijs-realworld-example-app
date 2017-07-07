const register = (server, options, next) => {
  const preResponse = (request, reply) => {
    let response = request.response
    if (response.isBoom) {
      const reformated = { errors: {} }
      reformated.errors[response.output.statusCode] = [response.output.payload.message]
      return reply(reformated).code(response.output.statusCode)
    }
    return reply.continue()
  }

  server.register(require('./articles'))
  server.register(require('./users'))
  server.register(require('./profiles'))
  server.register(require('./tags'))

  server.ext('onPreResponse', preResponse)

  server.route({
    method: 'GET',
    path: '/status',
    config: {
      description: 'Status endpoint',
      notes: 'Return the current status of the API',
      tags: ['api', 'status']
    },
    handler: (request, reply) => {
      return reply({status: 'UP'})
    }
  })
  return next()
}

register.attributes = {
  pkg: require('./package.json')
}

module.exports = register
