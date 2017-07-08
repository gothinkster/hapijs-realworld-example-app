const mongoose = require('mongoose')
const config = require('../../config')
const bluebird = require('bluebird')

const register = (server, options, next) => {
  mongoose.Promise = bluebird

  mongoose.connect(config.database.uri, config.database.options, (err, db) => {
    if (err) console.log(err)

    require('./User')
    require('./Comment')
    require('./Article')

    server.app.db = {
      link: db.db,
      User: db.model('User'),
      Article: db.model('Article'),
      Comment: db.model('Comment')
    }

    return next()
  })
}

register.attributes = {
  pkg: require('./package.json')
}

module.exports = register
