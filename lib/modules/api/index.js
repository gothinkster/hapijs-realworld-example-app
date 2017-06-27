const register = (server, options, next) => {
  server.register(require('./articles'))
  server.register(require('./users'))
  server.register(require('./profiles'))

  server.route({
    method: 'GET',
    path: '/status',
    config: {auth: false},
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
