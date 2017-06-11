const User = require('../../lib/modules/models/User')

module.exports = (factory) => {
  factory.define('user', User, {
    username: factory.seq('User.username', (n) => `user${n}`),
    email: factory.seq('User.email', (n) => `user${n}@example.com`)
  }, {
    afterBuild: (model, attrs, buildOptions) => {
      model.setPassword('password')
      return model
    }
  })
}
