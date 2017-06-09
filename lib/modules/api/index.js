const register = (server, options, next) => {
  server.register(require('./users'))

  server.route({
    method: 'GET',
    path: '/status',
    config: {auth: false},
    handler: (request, reply) => {
      reply({status: 'UP'})
    }
  })
  next()
}

register.attributes = {
  pkg: require('./package.json')
}

module.exports = register
