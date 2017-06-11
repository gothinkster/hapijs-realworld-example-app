const manifest = {
  connections: [{
    port: 8080,
    routes: {
      cors: true
    }
  }],
  registrations: [
    { plugin: 'hapi-auth-jwt2' },
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
