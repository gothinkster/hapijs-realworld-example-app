const register = (server, options, next) => {
  let services = [].concat(
    require('./users'),
    require('./articles'),
    require('./comments'),
    require('./tags')
  )
  server.method(services)
  return next()
}

const plugin = {
  register,
  pkg: require('./package.json')
}

module.exports = plugin