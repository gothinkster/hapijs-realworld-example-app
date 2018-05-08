const Routes = require('./routes')

const register = async (server, options) => {
  server.route(Routes(server))
}

const plugin = {
  register,
  pkg: require('./package.json')
}

module.exports = plugin