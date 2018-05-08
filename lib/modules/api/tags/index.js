const Routes = require('./routes')

const register = (server, options) => {
  server.route(Routes(server))
}

const plugin = {
  register,
  pkg: require('./package.json')
}

module.exports = plugin