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
        register: './api'
      },
      options: {
        routes: {
          prefix: '/api'
        }
      }
    },
    // {
    //   plugin: {
    //     register: './api/users',
    //   },
    //   options: {
    //       routes: {
    //         prefix: '/api'
    //       }
    //     }
    // },
    {
      plugin: {
        register: './auth'
      }
    },
    {
      plugin: {
        register: './models'
      }
    }
  ]
}
