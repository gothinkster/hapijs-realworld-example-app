module.exports = {
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
