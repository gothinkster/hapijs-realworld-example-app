const register = async (server, options) => {
  const preResponse = (request, h) => {
    let response = request.response

    if (response.isBoom) {
      const reformated = { errors: {} }
      reformated.errors[response.output.statusCode] = [response.output.payload.message]
      reformated.errors['Stack'] = [h.request.response.stack] // @TODO: remove in prod
      return h.response(reformated).code(response.output.statusCode)
    }

    return h.continue
  }

  await server.register(require('./articles'))
  await server.register(require('./users'))
  await server.register(require('./profiles'))
  await server.register(require('./tags'))

  server.ext('onPreResponse', preResponse)

  server.route({
    method: 'GET',
    path: '/status',
    config: {
      description: 'Status endpoint',
      notes: 'Return the current status of the API',
      tags: ['api', 'status']
    },
    handler: (request, h) => {
      return { status: 'UP' }
    }
  })
}

const plugin = {
  register,
  pkg: require('./package.json')
}

module.exports = plugin
