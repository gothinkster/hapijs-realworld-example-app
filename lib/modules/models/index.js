const mongoose = require('mongoose')
const config = require('../../config')
const bluebird = require('bluebird')

const register = async (server, options) => {
  mongoose.Promise = bluebird

  try {
    const db = await mongoose.connect(config.database.uri, config.database.options)

    require('./User')
    require('./Comment')
    require('./Article')

    server.app.db = {
      link: db.connections[0].db,
      User: db.model('User'),
      Article: db.model('Article'),
      Comment: db.model('Comment')
    }
  } catch (err) {
    console.log(err)
  }
}

const plugin = {
  register,
  pkg: require('./package.json')
}

module.exports = plugin
