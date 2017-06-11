module.exports = {
  connections: [{
    port: 8080,
    routes: {
      cors: true
    }
  }],
  registrations: [
    {
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
    },
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
