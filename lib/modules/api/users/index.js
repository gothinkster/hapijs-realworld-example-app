const Routes = require('./routes')

const register = (server, options, next) => {
  server.route(Routes(server))
  next()
}

const plugin = {
  register,
  pkg: require('./package.json')
}

module.exports = plugin