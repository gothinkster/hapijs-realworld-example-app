const config = require('./index')
const manifest = {
  server: {
    host: (process.env.PORT) ? '0.0.0.0' : 'localhost',
    port: (process.env.PORT || 8080),
    routes: {
      cors: true
    }
  },
  register: {
    plugins: [
      { plugin: 'blipp' },
      { plugin: 'hapi-auth-jwt2' },
      { plugin: 'inert' },
      { plugin: 'vision' },
      { plugin: 'hapi-swagger', options: config.swagger },
      { plugin: './auth' },
      { plugin: './models' },
      { plugin: './services' },
      { plugin: './api', routes: { prefix: '/api' } }
    ]
  }
}

if (process.env.NODE_ENV !== 'test') {
  manifest.register.plugins.push({
    plugin: 'good',
    options: {
      ops: {
        interval: 1000
      },
      reporters: {
        myConsoleReporter: [{
          module: 'good-squeeze',
          name: 'Squeeze',
          args: [{ log: '*', response: '*', request: '*' }]
        }, {
          module: 'good-console'
        }, 'stdout']
      }
    }
  })
}

module.exports = manifest
