const mongoose = require('mongoose')
const config = require('../../config')
const bluebird = require('bluebird')

const register = (server, options, next) => {
  mongoose.connect(config.database.uri)
  mongoose.Promise = bluebird

  require('./User')
  require('./Comment')
  require('./Article')

  server.app.db = {
    link: mongoose.connection.db,
    User: mongoose.model('User')
  }

  return next()
}

register.attributes = {
  pkg: require('./package.json')
}

module.exports = register
