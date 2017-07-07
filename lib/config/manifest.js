const config = require('./index')
const manifest = {
  connections: [{
    host: (process.env.PORT) ? '0.0.0.0' : 'localhost',
    port: (process.env.PORT || 8080),
    routes: {
      cors: true
    }
  }],
  registrations: [
    { plugin: 'blipp' },
    { plugin: 'hapi-auth-jwt2' },
    { plugin: 'inert' },
    { plugin: 'vision' },
    {
      plugin: {
        register: 'hapi-swagger',
        options: config.swagger
      }
    },
    {
      plugin: {
        register: './auth'
      }
    },
    {
      plugin: {
        register: './models'
      }
    },
    {
      plugin: {
        register: './services'
      }
    },
    {
      plugin: {
        register: './api'
      },
      options: {
        routes: {
          prefix: '/api'
        }
      }
    }
  ]
}

if (process.env.NODE_ENV !== 'test') {
  manifest.registrations.push({
    plugin: {
      register: 'good',
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
    }
  })
}

module.exports = manifest
