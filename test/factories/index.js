'use strict'

const factoryGirl = require('factory-girl')
const factory = factoryGirl.factory
const adapter = new factoryGirl.MongooseAdapter()

factory.setAdapter(adapter)

require('./users')(factory)
require('./profiles')(factory)
require('./articles')(factory)

module.exports = factory
