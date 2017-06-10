'use strict'

const factoryGirl = require('factory-girl')
const factory = factoryGirl.factory
const adapter = new factoryGirl.MongooseAdapter()

factory.setAdapter(adapter)

require('./users')(factory)

module.exports = factory
