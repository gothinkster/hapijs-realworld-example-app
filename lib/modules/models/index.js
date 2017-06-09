const mongoose = require('mongoose')
const config = require('../../config')

const register = (server, options, next) => {
  mongoose.connect(config.database.uri)
  mongoose.Promise = require('bluebird')

  require('./User')

  server.app.db = {
    User: mongoose.model('User')
  }

  next()
}

register.attributes = {
  pkg: require('./package.json')
}

module.exports = register
