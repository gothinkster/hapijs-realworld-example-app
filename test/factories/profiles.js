const User = require('../../lib/modules/models/User')

module.exports = (factory) => {
  var buildOptions = buildOptions => {
    let attrs = {
      favorited: false,
      following: false,
      afterBuild: (model, attrs, buildOptions) => {
        model.setPassword('password')
        return model
      },
      afterCreate: (model, attrs, buildOptions) => {
        if (buildOptions.article) {
          return model.favorite(buildOptions.article._id)
        }
        return model
      }
    }

    if (buildOptions.favorited) {
      attrs.favorited = true
    }

    if (buildOptions.following) {
      attrs.following = true
    }

    return attrs
  }

  factory.define('jake_profile', User, {
    username: 'jake',
    email: 'jake@statefarm.com',
    bio: 'I work at statefarm',
    image: 'https://static.productionready.io/images/smiley-cyrus.jpg'
  }, buildOptions)

  factory.define('stan_profile', User, {
    username: 'stan',
    email: 'stan@statefarm.com',
    bio: 'I work at statefarm',
    image: 'https://static.productionready.io/images/smiley-cyrus.jpg'
  }, buildOptions)

  factory.define('emilly_profile', User, {
    username: 'emilly',
    email: 'emilly@statefarm.com',
    bio: 'I work at statefarm',
    image: 'https://static.productionready.io/images/smiley-cyrus.jpg'
  }, buildOptions)

  factory.define('mike_profile', User, {
    username: 'mike',
    email: 'mike@statefarm.com',
    bio: 'I work at statefarm',
    image: 'https://static.productionready.io/images/smiley-cyrus.jpg'
  }, buildOptions)

  factory.define('ghost_profile', User, {
    username: 'ghost',
    email: 'ghost@statefarm.com',
    bio: 'I worked at statefarm',
    image: 'https://static.productionready.io/images/smiley-cyrus.jpg'
  },
    {
      afterCreate: (model, attrs, opts) => {
        model.remove((err, model) => {
          if (err) throw err
        })
        return model
      }
    })
}
